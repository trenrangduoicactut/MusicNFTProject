// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MusicCopyrightNFT is ERC721URIStorage, ERC2981, Ownable {
    uint256 private _nextTokenId;

    enum LicenseType {
        PersonalUse,
        CommercialUse,
        RemixAllowed,
        ExclusiveCopyright
    }

    struct MusicInfo {
        string title;
        string artist;
        bytes32 audioHash;
        bytes32 rightsHash;
        LicenseType licenseType;
        address creator;
        uint256 createdAt;
    }

    mapping(uint256 => MusicInfo) public musicInfos;

    event MusicMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string title,
        string artist,
        string tokenURI,
        LicenseType licenseType
    );

    constructor()
        ERC721("Music Copyright NFT", "MCNFT")
        Ownable(msg.sender)
    {}

    function mintMusic(
        address to,
        string memory title,
        string memory artist,
        string memory metadataURI,
        bytes32 audioHash,
        bytes32 rightsHash,
        LicenseType licenseType,
        address royaltyReceiver,
        uint96 royaltyFeeNumerator
    ) external returns (uint256) {
        require(to != address(0), "Invalid receiver");
        require(royaltyReceiver != address(0), "Invalid royalty receiver");
        require(bytes(title).length > 0, "Title required");
        require(bytes(artist).length > 0, "Artist required");
        require(bytes(metadataURI).length > 0, "Metadata URI required");

        // 1000 = 10%, vi ERC2981 dung mau so mac dinh 10000
        require(royaltyFeeNumerator <= 1000, "Royalty too high");

        _nextTokenId++;
        uint256 tokenId = _nextTokenId;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        musicInfos[tokenId] = MusicInfo({
            title: title,
            artist: artist,
            audioHash: audioHash,
            rightsHash: rightsHash,
            licenseType: licenseType,
            creator: msg.sender,
            createdAt: block.timestamp
        });

        _setTokenRoyalty(tokenId, royaltyReceiver, royaltyFeeNumerator);

        emit MusicMinted(
            tokenId,
            msg.sender,
            title,
            artist,
            metadataURI,
            licenseType
        );

        return tokenId;
    }

    function updateTokenURI(uint256 tokenId, string memory newMetadataURI) external {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(bytes(newMetadataURI).length > 0, "Invalid URI");

        _setTokenURI(tokenId, newMetadataURI);
    }

    function getMusicInfo(uint256 tokenId) external view returns (MusicInfo memory) {
        ownerOf(tokenId);
        return musicInfos[tokenId];
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}