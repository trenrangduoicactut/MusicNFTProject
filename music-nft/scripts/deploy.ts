import hre from "hardhat";

async function main() {
  const MusicNFT = await hre.ethers.getContractFactory("MusicCopyrightNFT");

  const contract = await MusicNFT.deploy();

  await contract.waitForDeployment();

  console.log("Contract deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
