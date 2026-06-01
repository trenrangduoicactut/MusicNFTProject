import { useState } from "react";
import { getContract } from "../services/contract";

const licenseNames = [
  "Personal Use",
  "Commercial Use",
  "Remix Allowed",
  "Exclusive Copyright",
];

function SearchNFT() {
  const [tokenId, setTokenId] = useState("");
  const [info, setInfo] = useState(null);
  const [owner, setOwner] = useState("");
  const [uri, setUri] = useState("");
  const [status, setStatus] = useState("");

  async function searchNFT() {
    try {
      if (!tokenId || Number(tokenId) <= 0) {
        setStatus("Vui lòng nhập Token ID hợp lệ, ví dụ: 1");
        setInfo(null);
        return;
      }

      setStatus("Đang truy vấn NFT...");

      console.log("Searching token:", tokenId);

      const contract = await getContract();

      const musicInfo = await contract.getMusicInfo(BigInt(tokenId));
      const tokenOwner = await contract.ownerOf(BigInt(tokenId));
      const tokenURI = await contract.tokenURI(BigInt(tokenId));

      console.log("Music info:", musicInfo);
      console.log("Owner:", tokenOwner);
      console.log("Token URI:", tokenURI);

      setInfo({
        title: musicInfo.title,
        artist: musicInfo.artist,
        audioHash: musicInfo.audioHash,
        rightsHash: musicInfo.rightsHash,
        licenseType: Number(musicInfo.licenseType),
        creator: musicInfo.creator,
        createdAt: Number(musicInfo.createdAt),
      });

      setOwner(tokenOwner);
      setUri(tokenURI);
      setStatus("Tìm thấy NFT.");
    } catch (error) {
      console.error("Search error:", error);

      setStatus(
        error?.shortMessage ||
          error?.reason ||
          error?.message ||
          "Không tìm thấy NFT hoặc token chưa tồn tại."
      );

      setInfo(null);
      setOwner("");
      setUri("");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="section-label">Verify NFT</p>
          <h2>Search Music NFT</h2>
          <p className="muted">
            Tra cứu thông tin bản quyền, chủ sở hữu và metadata theo Token ID.
          </p>
        </div>
      </div>

      <div className="search-bar">
        <div className="form-group">
          <label>Token ID</label>
          <input
            type="number"
            min="1"
            placeholder="Ví dụ: 1"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
          />
        </div>

        <button className="primary-btn" onClick={searchNFT}>
          Search
        </button>
      </div>

      <div className="status-box">
        {status || "Nhập Token ID để bắt đầu tra cứu."}
      </div>

      {info && (
        <div className="nft-card">
          <div className="nft-art">♪</div>

          <div className="nft-info">
            <h3>{info.title}</h3>
            <p className="muted">{info.artist}</p>

            <div className="info-grid">
              <div>
                <span>Token ID</span>
                <p>{tokenId}</p>
              </div>

              <div>
                <span>License</span>
                <p>{licenseNames[info.licenseType] || "Unknown"}</p>
              </div>

              <div>
                <span>Owner</span>
                <p>{owner}</p>
              </div>

              <div>
                <span>Creator</span>
                <p>{info.creator}</p>
              </div>

              <div>
                <span>Metadata URI</span>
                <p>{uri}</p>
              </div>

              <div>
                <span>Audio Hash</span>
                <p>{info.audioHash}</p>
              </div>

              <div>
                <span>Rights Hash</span>
                <p>{info.rightsHash}</p>
              </div>

              <div>
                <span>Created At</span>
                <p>{new Date(info.createdAt * 1000).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchNFT;