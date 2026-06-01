import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MusicCopyrightNFTModule = buildModule("MusicCopyrightNFTModule", (m) => {
  const musicNFT = m.contract("MusicCopyrightNFT");

  return { musicNFT };
});

export default MusicCopyrightNFTModule;
