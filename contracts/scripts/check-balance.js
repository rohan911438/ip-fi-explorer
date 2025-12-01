const { ethers } = require("hardhat");

async function main() {
  const address = "0x8b550ff0ba4f55f070cafa161e44e84abedbbc56";
  const balance = await ethers.provider.getBalance(address);
  const network = await ethers.provider.getNetwork();
  
  console.log("Network:", network.name, "Chain ID:", network.chainId.toString());
  console.log("Wallet Address:", address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");
  console.log("Balance in Wei:", balance.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });