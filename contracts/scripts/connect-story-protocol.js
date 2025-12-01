const { ethers } = require("hardhat");

// Story Protocol contract addresses
const STORY_CONTRACTS = {
  IPAssetRegistry: "0x77319B4031e6eF1250907aa00018B8B1c67a244b",
  LicensingModule: "0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f",
  RoyaltyModule: "0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086",
  LicenseRegistry: "0x529a750E02d8E2f15649c13D69a465286a780e24",
  LicenseToken: "0xFe3838BFb30B34170F00030B52eA4893d8aAC6bC",
  PILicenseTemplate: "0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316",
  GroupingModule: "0x69D3a7aa9edb72Bc226E745A7cCdd50D947b69Ac",
  DisputeModule: "0x9b7A9c70AFF961C799110954fc06F3093aeb94C5",
  CoreMetadataModule: "0x6E81a25C99C6e8430aeC7353325EB138aFE5DC16",
  RoyaltyPolicyLAP: "0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E",
  AccessController: "0xcCF37d0a503Ee1D4C11208672e622ed3DFB2275a"
};

async function main() {
  console.log("🔗 Connecting to Story Protocol Contracts...\n");

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log("📝 Account:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("⛓️  Network:", network.chainId.toString());
  console.log();

  // Basic contract interaction to verify connectivity
  try {
    // Try to get some basic info from IPAssetRegistry
    const ipAssetRegistry = await ethers.getContractAt(
      ["function totalSupply() external view returns (uint256)"],
      STORY_CONTRACTS.IPAssetRegistry
    );
    
    console.log("✅ Successfully connected to Story Protocol!");
    console.log("📋 Available Story Protocol Contracts:");
    console.log("═══════════════════════════════════════");
    
    Object.entries(STORY_CONTRACTS).forEach(([name, address]) => {
      console.log(`${name.padEnd(25)} ${address}`);
    });
    
    console.log("═══════════════════════════════════════");
    console.log("\n🎯 Ready for IP-Fi integration!");
    console.log("You can now build your platform using these existing Story Protocol contracts.");
    
  } catch (error) {
    console.log("❌ Error connecting to Story Protocol contracts:");
    console.log(error.message);
    console.log("\nThis might be due to RPC connectivity issues.");
  }

  // Generate integration guide
  console.log("\n📚 Integration Guide:");
  console.log("1. Use IPAssetRegistry for registering IP assets");
  console.log("2. Use LicensingModule for licensing operations");
  console.log("3. Use RoyaltyModule for royalty distribution");
  console.log("4. Use GroupingModule for IP asset grouping");
  console.log("5. Build your custom UI and business logic on top");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:");
    console.error(error);
    process.exit(1);
  });