import hre from "hardhat";

async function main() {
  const publicClient = await hre.viem.getPublicClient();
  const [walletClient] = await hre.viem.getWalletClients();

  const contract = await hre.viem.deployContract("MusicCopyrightNFT");

  console.log("Contract deployed to:", contract.address);
  console.log("Deployer:", walletClient.account.address);

  const blockNumber = await publicClient.getBlockNumber();
  console.log("Block:", blockNumber);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});