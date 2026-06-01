import { useState } from "react";
import { getContract } from "../services/contract";

function TransferNFT() {
  const [tokenId, setTokenId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [currentOwner, setCurrentOwner] = useState("");
  const [status, setStatus] = useState("");

  async function loadOwner() {
    try {
      const contract = await getContract();
      const owner = await contract.ownerOf(BigInt(tokenId));

      setCurrentOwner(owner);
      setFrom(owner);
      setStatus("Đã lấy owner hiện tại.");
    } catch (error) {
      console.error(error);
      setStatus("Không lấy được owner. Kiểm tra Token ID.");
    }
  }

  async function transferNFT() {
    try {
      setStatus("Đang chuyển quyền sở hữu NFT...");

      const contract = await getContract();

      const tx = await contract.transferFrom(
        from,
        to,
        BigInt(tokenId)
      );

      await tx.wait();

      const newOwner = await contract.ownerOf(BigInt(tokenId));
      setCurrentOwner(newOwner);

      setStatus("Chuyển quyền sở hữu thành công.");
    } catch (error) {
      console.error(error);
      setStatus(
        "Transfer thất bại. Chỉ owner hoặc approved account mới chuyển được."
      );
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="section-label">Ownership</p>
          <h2>Transfer NFT Ownership</h2>
          <p className="muted">
            Mô phỏng chuyển nhượng quyền sở hữu bản quyền âm nhạc từ nghệ sĩ
            sang cá nhân hoặc công ty khai thác.
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
          <small>NFT bản quyền cần chuyển nhượng.</small>
        </div>

        <div className="form-group">
          <label>Current Owner</label>
          <input
            placeholder="Bấm Load Owner"
            value={currentOwner}
            readOnly
          />
          <small>Chủ sở hữu hiện tại của NFT.</small>
        </div>

        <div className="form-group full">
          <button className="primary-btn" onClick={loadOwner}>
            Load Owner
          </button>
        </div>

        <div className="form-group">
          <label>From Address</label>
          <input
            placeholder="Địa chỉ owner hiện tại"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <small>Địa chỉ chuyển NFT đi.</small>
        </div>

        <div className="form-group">
          <label>To Address</label>
          <input
            placeholder="Địa chỉ nhận NFT"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <small>Địa chỉ người/công ty nhận quyền sở hữu.</small>
        </div>
      </div>

      <div className="action-row">
        <button className="primary-btn" onClick={transferNFT}>
          Transfer NFT
        </button>

        <div className="status-box">{status || "Chưa có giao dịch transfer."}</div>
      </div>
    </div>
  );
}

export default TransferNFT;