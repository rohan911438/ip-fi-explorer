const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("IPAssetNFT", function () {
  let ipAssetNFT, owner, creator, investor1, investor2, feeRecipient;
  let assetId;

  beforeEach(async function () {
    [owner, creator, investor1, investor2, feeRecipient] = await ethers.getSigners();
    
    const IPAssetNFT = await ethers.getContractFactory("IPAssetNFT");
    ipAssetNFT = await IPAssetNFT.deploy("IP Asset NFT", "IPNFT", feeRecipient.address);
    await ipAssetNFT.waitForDeployment();
  });

  describe("Asset Creation", function () {
    it("Should mint a new IP asset", async function () {
      const tx = await ipAssetNFT.mintIPAsset(
        creator.address,
        "QmTestHash123",
        10000, // total shares
        ethers.parseEther("0.01"), // price per share
        "digital-art",
        1000 // 10% royalty
      );

      const receipt = await tx.wait();
      const events = receipt.logs;
      const assetMintedEvent = events.find(e => e.fragment?.name === "AssetMinted");
      
      expect(assetMintedEvent).to.not.be.undefined;
      assetId = assetMintedEvent.args[0];
      
      const asset = await ipAssetNFT.getAsset(assetId);
      expect(asset.creator).to.equal(creator.address);
      expect(asset.totalShares).to.equal(10000);
      expect(asset.availableShares).to.equal(10000);
      expect(asset.pricePerShare).to.equal(ethers.parseEther("0.01"));
      expect(asset.assetType).to.equal("digital-art");
      expect(asset.isListed).to.be.true;
    });

    it("Should fail with invalid parameters", async function () {
      await expect(
        ipAssetNFT.mintIPAsset(
          ethers.ZeroAddress,
          "QmTestHash123",
          10000,
          ethers.parseEther("0.01"),
          "digital-art",
          1000
        )
      ).to.be.revertedWith("Invalid creator address");

      await expect(
        ipAssetNFT.mintIPAsset(
          creator.address,
          "",
          10000,
          ethers.parseEther("0.01"),
          "digital-art",
          1000
        )
      ).to.be.revertedWith("IPFS hash cannot be empty");

      await expect(
        ipAssetNFT.mintIPAsset(
          creator.address,
          "QmTestHash123",
          0,
          ethers.parseEther("0.01"),
          "digital-art",
          1000
        )
      ).to.be.revertedWith("Total shares must be greater than 0");
    });
  });

  describe("Share Purchase", function () {
    beforeEach(async function () {
      const tx = await ipAssetNFT.mintIPAsset(
        creator.address,
        "QmTestHash123",
        10000,
        ethers.parseEther("0.01"),
        "digital-art",
        1000
      );
      const receipt = await tx.wait();
      assetId = receipt.logs[0].args[0];
    });

    it("Should allow purchasing shares", async function () {
      const shareCount = 100;
      const totalCost = ethers.parseEther("1.0"); // 100 * 0.01 ETH

      await expect(
        ipAssetNFT.connect(investor1).purchaseShares(assetId, shareCount, {
          value: totalCost
        })
      ).to.emit(ipAssetNFT, "SharesPurchased");

      const investment = await ipAssetNFT.getInvestment(assetId, investor1.address);
      expect(investment.shares).to.equal(shareCount);
      expect(investment.amountInvested).to.equal(totalCost);

      const asset = await ipAssetNFT.getAsset(assetId);
      expect(asset.availableShares).to.equal(9900);
      expect(asset.totalRaised).to.equal(totalCost);
    });

    it("Should handle platform fees correctly", async function () {
      const shareCount = 100;
      const totalCost = ethers.parseEther("1.0");
      const platformFee = totalCost * BigInt(250) / BigInt(10000); // 2.5%
      const creatorAmount = totalCost - platformFee;

      const initialCreatorBalance = await ethers.provider.getBalance(creator.address);
      const initialFeeRecipientBalance = await ethers.provider.getBalance(feeRecipient.address);

      await ipAssetNFT.connect(investor1).purchaseShares(assetId, shareCount, {
        value: totalCost
      });

      const finalCreatorBalance = await ethers.provider.getBalance(creator.address);
      const finalFeeRecipientBalance = await ethers.provider.getBalance(feeRecipient.address);

      expect(finalCreatorBalance - initialCreatorBalance).to.equal(creatorAmount);
      expect(finalFeeRecipientBalance - initialFeeRecipientBalance).to.equal(platformFee);
    });

    it("Should fail with insufficient payment", async function () {
      await expect(
        ipAssetNFT.connect(investor1).purchaseShares(assetId, 100, {
          value: ethers.parseEther("0.5") // Less than required
        })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should fail when requesting too many shares", async function () {
      await expect(
        ipAssetNFT.connect(investor1).purchaseShares(assetId, 20000, {
          value: ethers.parseEther("200")
        })
      ).to.be.revertedWith("Not enough shares available");
    });
  });

  describe("Royalty Distribution", function () {
    beforeEach(async function () {
      const tx = await ipAssetNFT.mintIPAsset(
        creator.address,
        "QmTestHash123",
        10000,
        ethers.parseEther("0.01"),
        "digital-art",
        1000
      );
      const receipt = await tx.wait();
      assetId = receipt.logs[0].args[0];

      // Purchase shares from multiple investors
      await ipAssetNFT.connect(investor1).purchaseShares(assetId, 6000, {
        value: ethers.parseEther("60")
      });

      await ipAssetNFT.connect(investor2).purchaseShares(assetId, 4000, {
        value: ethers.parseEther("40")
      });
    });

    it("Should distribute royalties proportionally", async function () {
      const royaltyAmount = ethers.parseEther("1.0");
      
      const investor1InitialBalance = await ethers.provider.getBalance(investor1.address);
      const investor2InitialBalance = await ethers.provider.getBalance(investor2.address);

      await expect(
        ipAssetNFT.connect(creator).distributeRoyalties(assetId, {
          value: royaltyAmount
        })
      ).to.emit(ipAssetNFT, "RoyaltyDistributed");

      const investor1FinalBalance = await ethers.provider.getBalance(investor1.address);
      const investor2FinalBalance = await ethers.provider.getBalance(investor2.address);

      // Investor1 should receive 60% of royalties (6000/10000 shares)
      const investor1Royalty = royaltyAmount * BigInt(6000) / BigInt(10000);
      // Investor2 should receive 40% of royalties (4000/10000 shares)  
      const investor2Royalty = royaltyAmount * BigInt(4000) / BigInt(10000);

      expect(investor1FinalBalance - investor1InitialBalance).to.equal(investor1Royalty);
      expect(investor2FinalBalance - investor2InitialBalance).to.equal(investor2Royalty);

      // Check investment records updated
      const investment1 = await ipAssetNFT.getInvestment(assetId, investor1.address);
      const investment2 = await ipAssetNFT.getInvestment(assetId, investor2.address);

      expect(investment1.totalRoyaltiesReceived).to.equal(investor1Royalty);
      expect(investment2.totalRoyaltiesReceived).to.equal(investor2Royalty);
    });

    it("Should only allow creator to distribute royalties", async function () {
      await expect(
        ipAssetNFT.connect(investor1).distributeRoyalties(assetId, {
          value: ethers.parseEther("1.0")
        })
      ).to.be.revertedWith("Only asset creator can perform this action");
    });

    it("Should fail with zero royalty amount", async function () {
      await expect(
        ipAssetNFT.connect(creator).distributeRoyalties(assetId, {
          value: 0
        })
      ).to.be.revertedWith("Royalty amount must be greater than 0");
    });
  });

  describe("Asset Management", function () {
    beforeEach(async function () {
      const tx = await ipAssetNFT.mintIPAsset(
        creator.address,
        "QmTestHash123",
        10000,
        ethers.parseEther("0.01"),
        "digital-art",
        1000
      );
      const receipt = await tx.wait();
      assetId = receipt.logs[0].args[0];
    });

    it("Should allow creator to update listing status", async function () {
      await expect(
        ipAssetNFT.connect(creator).updateListingStatus(assetId, false)
      ).to.emit(ipAssetNFT, "AssetDelisted");

      const asset = await ipAssetNFT.getAsset(assetId);
      expect(asset.isListed).to.be.false;

      await expect(
        ipAssetNFT.connect(creator).updateListingStatus(assetId, true)
      ).to.emit(ipAssetNFT, "AssetListed");
    });

    it("Should allow creator to update price per share", async function () {
      const newPrice = ethers.parseEther("0.02");
      
      await ipAssetNFT.connect(creator).updatePricePerShare(assetId, newPrice);
      
      const asset = await ipAssetNFT.getAsset(assetId);
      expect(asset.pricePerShare).to.equal(newPrice);
    });

    it("Should only allow creator to manage asset", async function () {
      await expect(
        ipAssetNFT.connect(investor1).updateListingStatus(assetId, false)
      ).to.be.revertedWith("Only asset creator can perform this action");

      await expect(
        ipAssetNFT.connect(investor1).updatePricePerShare(assetId, ethers.parseEther("0.02"))
      ).to.be.revertedWith("Only asset creator can perform this action");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      const tx = await ipAssetNFT.mintIPAsset(
        creator.address,
        "QmTestHash123",
        10000,
        ethers.parseEther("0.01"),
        "digital-art",
        1000
      );
      const receipt = await tx.wait();
      assetId = receipt.logs[0].args[0];

      await ipAssetNFT.connect(investor1).purchaseShares(assetId, 1000, {
        value: ethers.parseEther("10")
      });
    });

    it("Should return asset investors", async function () {
      const investors = await ipAssetNFT.getAssetInvestors(assetId);
      expect(investors).to.include(investor1.address);
      expect(investors.length).to.equal(1);
    });

    it("Should return creator assets", async function () {
      const creatorAssets = await ipAssetNFT.getCreatorAssets(creator.address);
      expect(creatorAssets).to.include(assetId);
      expect(creatorAssets.length).to.equal(1);
    });

    it("Should return investor assets", async function () {
      const investorAssets = await ipAssetNFT.getInvestorAssets(investor1.address);
      expect(investorAssets).to.include(assetId);
      expect(investorAssets.length).to.equal(1);
    });
  });

  describe("Platform Fee Management", function () {
    it("Should allow owner to update platform fee", async function () {
      const newFee = 500; // 5%
      await ipAssetNFT.updatePlatformFee(newFee);
      expect(await ipAssetNFT.platformFee()).to.equal(newFee);
    });

    it("Should not allow fee above 10%", async function () {
      await expect(
        ipAssetNFT.updatePlatformFee(1500) // 15%
      ).to.be.revertedWith("Platform fee cannot exceed 10%");
    });

    it("Should allow owner to update fee recipient", async function () {
      await ipAssetNFT.updateFeeRecipient(investor1.address);
      expect(await ipAssetNFT.feeRecipient()).to.equal(investor1.address);
    });

    it("Should not allow zero address as fee recipient", async function () {
      await expect(
        ipAssetNFT.updateFeeRecipient(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid recipient address");
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to pause and unpause", async function () {
      await ipAssetNFT.pause();
      expect(await ipAssetNFT.paused()).to.be.true;

      // Create asset first
      const tx = await ipAssetNFT.mintIPAsset(
        creator.address,
        "QmTestHash123",
        10000,
        ethers.parseEther("0.01"),
        "digital-art",
        1000
      );
      const receipt = await tx.wait();
      assetId = receipt.logs[0].args[0];

      // Should fail when paused
      await expect(
        ipAssetNFT.connect(investor1).purchaseShares(assetId, 100, {
          value: ethers.parseEther("1")
        })
      ).to.be.revertedWithCustomError(ipAssetNFT, "EnforcedPause");

      await ipAssetNFT.unpause();
      expect(await ipAssetNFT.paused()).to.be.false;
    });

    it("Should allow emergency withdrawal", async function () {
      // Send some ETH to contract
      await owner.sendTransaction({
        to: await ipAssetNFT.getAddress(),
        value: ethers.parseEther("1")
      });

      const initialBalance = await ethers.provider.getBalance(owner.address);
      const tx = await ipAssetNFT.emergencyWithdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalBalance = await ethers.provider.getBalance(owner.address);
      const netGain = finalBalance - initialBalance + gasUsed;

      expect(netGain).to.equal(ethers.parseEther("1"));
    });
  });
});