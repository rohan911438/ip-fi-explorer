const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting IP-Fi Smart Contract Deployment...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy IPFiToken first
  console.log("📦 Deploying IPFiToken...");
  const IPFiToken = await ethers.getContractFactory("IPFiToken");
  const ipfiToken = await IPFiToken.deploy();
  await ipfiToken.waitForDeployment();
  const ipfiTokenAddress = await ipfiToken.getAddress();
  console.log("✅ IPFiToken deployed to:", ipfiTokenAddress);

  // Deploy IPAssetNFT
  console.log("\n📦 Deploying IPAssetNFT...");
  const IPAssetNFT = await ethers.getContractFactory("IPAssetNFT");
  const ipAssetNFT = await IPAssetNFT.deploy(
    "IP-Fi Asset NFT",
    "IPFA",
    deployer.address // Fee recipient
  );
  await ipAssetNFT.waitForDeployment();
  const ipAssetNFTAddress = await ipAssetNFT.getAddress();
  console.log("✅ IPAssetNFT deployed to:", ipAssetNFTAddress);

  // Deploy IPFiPlatform
  console.log("\n📦 Deploying IPFiPlatform...");
  const IPFiPlatform = await ethers.getContractFactory("IPFiPlatform");
  const ipfiPlatform = await IPFiPlatform.deploy(ipAssetNFTAddress);
  await ipfiPlatform.waitForDeployment();
  const ipfiPlatformAddress = await ipfiPlatform.getAddress();
  console.log("✅ IPFiPlatform deployed to:", ipfiPlatformAddress);

  // Set up initial configuration
  console.log("\n⚙️ Setting up initial configuration...");
  
  // Transfer ownership of IPAssetNFT to IPFiPlatform for minting
  console.log("🔄 Transferring IPAssetNFT ownership to IPFiPlatform...");
  await ipAssetNFT.transferOwnership(ipfiPlatformAddress);
  console.log("✅ Ownership transferred");

  // Authorize IPFiPlatform as a minter for community rewards
  console.log("🔄 Authorizing IPFiPlatform as token minter...");
  await ipfiToken.authorizeMinter(ipfiPlatformAddress);
  console.log("✅ Minter authorization complete");

  // Deployment summary
  console.log("\n🎉 Deployment Summary:");
  console.log("═══════════════════════════════════════");
  console.log("📄 IPFiToken:      ", ipfiTokenAddress);
  console.log("🖼️  IPAssetNFT:     ", ipAssetNFTAddress);
  console.log("🏛️  IPFiPlatform:   ", ipfiPlatformAddress);
  console.log("💼 Deployer:       ", deployer.address);
  console.log("⛓️  Network:        ", hre.network.name);
  console.log("═══════════════════════════════════════");

  // Save deployment addresses to file
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      IPFiToken: {
        address: ipfiTokenAddress,
        name: "IPFi Token",
        symbol: "IPFI"
      },
      IPAssetNFT: {
        address: ipAssetNFTAddress,
        name: "IP-Fi Asset NFT",
        symbol: "IPFA"
      },
      IPFiPlatform: {
        address: ipfiPlatformAddress,
        name: "IP-Fi Platform"
      }
    },
    configuration: {
      platformFee: "2.5%",
      stakingAPY: "12%",
      minimumStakeDuration: "7 days",
      vestingDuration: "2 years",
      vestingCliff: "6 months"
    }
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save to network-specific file
  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to:", deploymentFile);

  // Generate environment variables for backend
  console.log("\n📝 Environment Variables for Backend:");
  console.log("═══════════════════════════════════════");
  console.log(`IPFI_TOKEN_ADDRESS=${ipfiTokenAddress}`);
  console.log(`IP_ASSET_NFT_ADDRESS=${ipAssetNFTAddress}`);
  console.log(`IPFI_PLATFORM_ADDRESS=${ipfiPlatformAddress}`);
  console.log(`DEPLOYMENT_NETWORK=${hre.network.name}`);
  console.log(`DEPLOYMENT_CHAIN_ID=${(await ethers.provider.getNetwork()).chainId}`);

  // Save environment variables to file
  const envFile = path.join(deploymentsDir, '.env.contracts');
  const envContent = `# IP-Fi Smart Contract Addresses - ${hre.network.name}
# Generated on ${new Date().toISOString()}

IPFI_TOKEN_ADDRESS=${ipfiTokenAddress}
IP_ASSET_NFT_ADDRESS=${ipAssetNFTAddress}
IPFI_PLATFORM_ADDRESS=${ipfiPlatformAddress}
DEPLOYMENT_NETWORK=${hre.network.name}
DEPLOYMENT_CHAIN_ID=${(await ethers.provider.getNetwork()).chainId}

# Contract ABIs available in artifacts/src/ directory
`;
  
  fs.writeFileSync(envFile, envContent);
  console.log("💾 Environment file saved to:", envFile);

  // Verification instructions
  console.log("\n🔍 Contract Verification Commands:");
  console.log("═══════════════════════════════════════");
  console.log(`npx hardhat verify --network ${hre.network.name} ${ipfiTokenAddress}`);
  console.log(`npx hardhat verify --network ${hre.network.name} ${ipAssetNFTAddress} "IP-Fi Asset NFT" "IPFA" "${deployer.address}"`);
  console.log(`npx hardhat verify --network ${hre.network.name} ${ipfiPlatformAddress} "${ipAssetNFTAddress}"`);

  console.log("\n✨ Deployment completed successfully!");
  console.log("🔗 You can now update your backend .env file with the contract addresses above.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });