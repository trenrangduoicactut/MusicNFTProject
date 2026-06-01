import { useState } from "react";
import { getContract } from "../services/contract";

function UpdateMetadata() {
  const [tokenId, setTokenId] = useState("");
  const [newURI, setNewURI] = useState("");
  const [status, setStatus] = useState("");

  async function updateMetadata() {
    try {
      setStatus("Đang cập nhật metadata...");

      const contract = await getContract();
      const tx = await contract.updateTokenURI(tokenId, newURI);

      setStatus("Đang chờ xác nhận transaction...");
      await tx.wait();

      setStatus("Cập nhật metadata thành công!");
    } catch (error) {
      console.error(error);
      setStatus("Cập nhật thất bại. Chỉ owner NFT mới có quyền sửa.");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="section-label">Manage NFT</p>
          <h2>Update Metadata URI</h2>
          <p className="muted">
            Cập nhật metadata URI cho NFT. Chỉ chủ sở hữu token mới thực hiện được.
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
          <small>ID của NFT cần cập nhật.</small>
        </div>

        <div className="form-group">
          <label>New Metadata URI</label>
          <input
            placeholder="Ví dụ: ipfs://new-metadata-cid"
            value={newURI}
            onChange={(e) => setNewURI(e.target.value)}
          />
          <small>URI metadata mới của NFT.</small>
        </div>
      </div>

      <div className="action-row">
        <button className="primary-btn" onClick={updateMetadata}>
          Update Metadata
        </button>

        <div className="status-box">{status || "Chưa có cập nhật nào."}</div>
      </div>
    </div>
  );
}

export default UpdateMetadata;