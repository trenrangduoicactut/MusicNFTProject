import { useState } from "react";
import { getContract } from "../services/contract";

function ApprovalManager() {
  const [tokenId, setTokenId] = useState("");
  const [approvedAddress, setApprovedAddress] = useState("");
  const [operator, setOperator] = useState("");
  const [owner, setOwner] = useState("");
  const [isApproved, setIsApproved] = useState(false);
  const [status, setStatus] = useState("");

  async function approveAddress() {
    try {
      setStatus("Đang cấp quyền chuyển nhượng cho địa chỉ được chỉ định...");

      const contract = await getContract();
      const tx = await contract.approve(approvedAddress, BigInt(tokenId));

      await tx.wait();
      setStatus("Đã approve địa chỉ cho NFT này.");
    } catch (error) {
      console.error(error);
      setStatus("Approve thất bại. Chỉ owner mới có quyền approve.");
    }
  }

  async function checkApproved() {
    try {
      const contract = await getContract();
      const approved = await contract.getApproved(BigInt(tokenId));

      setApprovedAddress(approved);
      setStatus("Đã lấy approved address.");
    } catch (error) {
      console.error(error);
      setStatus("Không lấy được approved address.");
    }
  }

  async function setOperatorApproval() {
    try {
      setStatus("Đang cấp quyền operator cho toàn bộ NFT...");

      const contract = await getContract();
      const tx = await contract.setApprovalForAll(operator, true);

      await tx.wait();
      setStatus("Đã cấp quyền operator.");
    } catch (error) {
      console.error(error);
      setStatus("Cấp quyền operator thất bại.");
    }
  }

  async function checkOperatorApproval() {
    try {
      const contract = await getContract();
      const result = await contract.isApprovedForAll(owner, operator);

      setIsApproved(result);
      setStatus(result ? "Operator đã được cấp quyền." : "Operator chưa được cấp quyền.");
    } catch (error) {
      console.error(error);
      setStatus("Không kiểm tra được operator approval.");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="section-label">Access Control</p>
          <h2>Approval Manager</h2>
          <p className="muted">
            Quản lý quyền cho marketplace, nhà phân phối hoặc bên thứ ba được
            phép chuyển nhượng NFT thay owner.
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
          <small>NFT cần cấp quyền approve.</small>
        </div>

        <div className="form-group">
          <label>Approved Address</label>
          <input
            placeholder="Địa chỉ được phép chuyển NFT này"
            value={approvedAddress}
            onChange={(e) => setApprovedAddress(e.target.value)}
          />
          <small>Cấp quyền cho một địa chỉ cụ thể trên một token.</small>
        </div>

        <div className="form-group">
          <button className="primary-btn" onClick={approveAddress}>
            Approve Address
          </button>
        </div>

        <div className="form-group">
          <button className="primary-btn" onClick={checkApproved}>
            Get Approved
          </button>
        </div>

        <div className="form-group">
          <label>Owner Address</label>
          <input
            placeholder="Địa chỉ owner cần kiểm tra"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
          />
          <small>Địa chỉ chủ sở hữu NFT.</small>
        </div>

        <div className="form-group">
          <label>Operator Address</label>
          <input
            placeholder="Marketplace hoặc distributor"
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
          />
          <small>Địa chỉ được cấp quyền quản lý toàn bộ NFT.</small>
        </div>

        <div className="form-group">
          <button className="primary-btn" onClick={setOperatorApproval}>
            Set Approval For All
          </button>
        </div>

        <div className="form-group">
          <button className="primary-btn" onClick={checkOperatorApproval}>
            Check Operator
          </button>
        </div>
      </div>

      <div className="action-row">
        <div className="status-box">
          {status || "Chưa có thao tác approval."}
          <br />
          Operator approved: {isApproved ? "Yes" : "No"}
        </div>
      </div>
    </div>
  );
}

export default ApprovalManager;