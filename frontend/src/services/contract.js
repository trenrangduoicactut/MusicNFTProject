import { ethers } from "ethers";
import MusicCopyrightNFT from "../MusicCopyrightNFT.json";

const ENV_CONTRACT_ADDRESS = import.meta.env.VITE_MUSIC_NFT_ADDRESS;

console.log("ENV_CONTRACT_ADDRESS:", ENV_CONTRACT_ADDRESS);

function getContractAddress(chainId) {
  if (ENV_CONTRACT_ADDRESS) {
    return ENV_CONTRACT_ADDRESS;
  }

  const networks = MusicCopyrightNFT.networks;
  let networkData = networks[String(chainId)];

  if (!networkData && networks["5777"]) {
    networkData = networks["5777"];
  }

  if (!networkData || !networkData.address) {
    throw new Error(
      `Không tìm thấy contract address cho chainId ${chainId}.`
    );
  }

  return networkData.address;
}

export async function getContract() {
  if (!window.ethereum) {
    throw new Error("MetaMask chưa được cài đặt");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);
  const contractAddress = getContractAddress(chainId);

  const code = await provider.getCode(contractAddress);

  if (code === "0x") {
    throw new Error(
      `Không có contract tại ${contractAddress} trên chainId ${chainId}.`
    );
  }

  const signer = await provider.getSigner();

  return new ethers.Contract(
    contractAddress,
    MusicCopyrightNFT.abi,
    signer
  );
}

export async function getContractReadOnly() {
  if (!window.ethereum) {
    throw new Error("MetaMask chưa được cài đặt");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);
  const contractAddress = getContractAddress(chainId);

  return new ethers.Contract(
    contractAddress,
    MusicCopyrightNFT.abi,
    provider
  );
}