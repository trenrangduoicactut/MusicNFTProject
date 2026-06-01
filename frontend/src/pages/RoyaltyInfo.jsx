import { useState } from "react";
import { ethers } from "ethers";
import { getContract } from "../services/contract";

function RoyaltyInfo() {
  const [tokenId, setTokenId] = useState("");
  const [salePrice, setSalePrice] = useState("1");
  const [receiver, setReceiver] = useState("");
  const [royaltyAmount, setRoyaltyAmount] = useState("");
  const [status, setStatus] = useState("");

  async function checkRoyalty() {
    try {
      setStatus("Đang kiểm tra royalty...");

      const contract = await getContract();
      const priceWei = ethers.parseEther(salePrice);

      const result = await contract.royaltyInfo(BigInt(tokenId), priceWei);

      setReceiver(result[0]);
      setRoyaltyAmount(ethers.formatEther(result[1]));
      setStatus("Đã tính royalty thành công.");
      const logs = JSON.parse(localStorage.getItem("royaltyLogs") || "[]");

    logs.push({
      tokenId,
      salePrice,
      receiver: result[0],
      royaltyAmount: ethers.formatEther(result[1]),
      time: new Date().toISOString(),
    });

localStorage.setItem("royaltyLogs", JSON.stringify(logs));
    } catch (error) {
      console.error(error);
      setStatus("Không kiểm tra được royalty. Kiểm tra Token ID hoặc network.");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="section-label">Royalty</p>
          <h2>Royalty Info</h2>
          <p className="muted">
            Kiểm tra tiền bản quyền mà creator nhận được khi NFT được bán lại.
          </p>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>Token ID</label>
          <input
            placeholder="Ví dụ: 1"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
          />
          <small>ID của NFT cần kiểm tra royalty.</small>
        </div>

        <div className="form-group">
          <label>Sale Price</label>
          <input
            placeholder="Ví dụ: 1"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
          />
          <small>Giá bán giả định tính bằng ETH.</small>
        </div>
      </div>

      <div className="action-row">
        <button className="primary-btn" onClick={checkRoyalty}>
          Check Royalty
        </button>

        <div className="status-box">{status || "Chưa kiểm tra royalty."}</div>
      </div>

      {receiver && (
        <div className="nft-card">
          <div className="nft-art">%</div>

          <div className="nft-info">
            <h3>Royalty Result</h3>

            <div className="info-grid">
              <div>
                <span>Royalty Receiver</span>
                <p>{receiver}</p>
              </div>

              <div>
                <span>Royalty Amount</span>
                <p>{royaltyAmount} ETH</p>
              </div>

              <div>
                <span>Sale Price</span>
                <p>{salePrice} ETH</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoyaltyInfo;