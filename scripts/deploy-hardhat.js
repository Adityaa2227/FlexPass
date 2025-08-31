const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying MicroSubscriptionPass contract to Polygon Amoy...");

  // Get the contract factory
  const MicroSubscriptionPass = await ethers.getContractFactory("MicroSubscriptionPass");

  // Deploy the contract
  const contract = await MicroSubscriptionPass.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("MicroSubscriptionPass deployed to:", contractAddress);

  // Verify deployment
  console.log("Verifying deployment...");
  const owner = await contract.owner();
  console.log("Contract owner:", owner);

  // Set up initial service prices (in wei)
  console.log("Setting up service prices...");
  
  const prices = [
    ethers.parseEther("0.001"), // OpenAI: 0.001 ETH
    ethers.parseEther("0.0005"), // Spotify: 0.0005 ETH  
    ethers.parseEther("0.002")   // Netflix: 0.002 ETH
  ];

  for (let i = 0; i < prices.length; i++) {
    const tx = await contract.setServicePrice(i, prices[i]);
    await tx.wait();
    console.log(`Set price for service ${i}: ${ethers.formatEther(prices[i])} ETH`);
  }

  console.log("\n=== Deployment Summary ===");
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Network: Polygon Amoy Testnet (Chain ID: 80002)`);
  console.log(`Explorer: https://amoy.polygonscan.com/address/${contractAddress}`);
  console.log("\nUpdate your .env file with:");
  console.log(`VITE_CONTRACT_ADDRESS=${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
