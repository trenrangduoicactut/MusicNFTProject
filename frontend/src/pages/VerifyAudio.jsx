import { useState } from "react";
import { getContract } from "../services/contract";

function VerifyAudio() {
  const [tokenId, setTokenId] = useState("");
  const [fileHash, setFileHash] = useState("");
  const [chainHash, setChainHash] = useState("");
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState("");
  const [status, setStatus] = useState("");

  async function hashAudioFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setStatus("Đang tạo SHA-256 hash từ file audio...");

    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex =
      "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    setFileHash(hashHex);
    setStatus("Đã tạo hash từ file audio.");
  }

  async function verifyAudio() {
    try {
      if (!tokenId) {
        setStatus("Vui lòng nhập Token ID.");
        return;
      }

      if (!fileHash) {
        setStatus("Vui lòng chọn file audio để kiểm tra.");
        return;
      }

      setStatus("Đang lấy audioHash từ blockchain...");

      const contract = await getContract();
      const musicInfo = await contract.getMusicInfo(BigInt(tokenId));

      const onChainHash = musicInfo.audioHash;
      setChainHash(onChainHash);

      if (fileHash.toLowerCase() === onChainHash.toLowerCase()) {
        setResult("valid");
        setStatus("File audio hợp lệ. Hash trùng với bản đã đăng ký.");
        const logs = JSON.parse(localStorage.getItem("verifyLogs") || "[]");

        logs.push({
          tokenId,
          result: "valid",
          time: new Date().toISOString(),
        });

        localStorage.setItem("verifyLogs", JSON.stringify(logs));
      } else {
        setResult("invalid");
        setStatus("File audio không khớp. Có thể file đã bị sửa hoặc không phải bản gốc.");
        const logs = JSON.parse(localStorage.getItem("verifyLogs") || "[]");

        logs.push({
          tokenId,
          result: "invalid",
          time: new Date().toISOString(),
        });

localStorage.setItem("verifyLogs", JSON.stringify(logs));
      }
    } catch (error) {
      console.error(error);
      setResult("invalid");
      setStatus("Xác minh thất bại. Token ID không tồn tại hoặc lỗi kết nối contract.");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="section-label">Integrity Check</p>
          <h2>Verify Audio Authenticity</h2>
          <p className="muted">
            Upload file audio để tạo SHA-256 hash, sau đó so sánh với audioHash đã lưu trên blockchain.
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
          <small>ID của NFT cần xác minh.</small>
        </div>

        <div className="form-group">
          <label>Audio File cần kiểm tra</label>
          <input type="file" accept="audio/*" onChange={hashAudioFile} />
          <small>Hệ thống chỉ hash file trên trình duyệt, không upload file lên blockchain.</small>
        </div>

        {fileHash && (
          <div className="form-group full">
            <label>Hash của file vừa upload</label>
            <div className="status-box">
              <b>{fileName}</b>
              <br />
              <span style={{ wordBreak: "break-all" }}>{fileHash}</span>
            </div>
          </div>
        )}

        {chainHash && (
          <div className="form-group full">
            <label>Hash lưu trên blockchain</label>
            <div className="status-box">
              <span style={{ wordBreak: "break-all" }}>{chainHash}</span>
            </div>
          </div>
        )}
      </div>

      <div className="action-row">
        <button className="primary-btn" onClick={verifyAudio}>
          Verify Audio
        </button>

        <div
          className={
            result === "valid"
              ? "status-box verify-success"
              : result === "invalid"
              ? "status-box verify-fail"
              : "status-box"
          }
        >
          {status || "Chưa có kết quả xác minh."}
        </div>
      </div>
    </div>
  );
}

export default VerifyAudio;