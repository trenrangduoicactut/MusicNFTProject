import { useState } from "react";
import {
  createAudioFingerprint,
  compareFingerprints,
} from "../services/audioFingerprint";

function VerifyFingerprint() {
  const [originalFile, setOriginalFile] = useState(null);
  const [targetFile, setTargetFile] = useState(null);
  const [originalFp, setOriginalFp] = useState([]);
  const [targetFp, setTargetFp] = useState([]);
  const [matchRate, setMatchRate] = useState(null);
  const [status, setStatus] = useState("");

  async function handleOriginal(e) {
    const file = e.target.files[0];
    if (!file) return;

    setOriginalFile(file);
    setStatus("Đang tạo fingerprint cho file gốc...");

    const fp = await createAudioFingerprint(file);
    setOriginalFp(fp);

    setStatus(`Đã tạo ${fp.length} fingerprint segments cho file gốc.`);
  }

  async function handleTarget(e) {
    const file = e.target.files[0];
    if (!file) return;

    setTargetFile(file);
    setStatus("Đang tạo fingerprint cho file cần kiểm tra...");

    const fp = await createAudioFingerprint(file);
    setTargetFp(fp);

    setStatus(`Đã tạo ${fp.length} fingerprint segments cho file cần kiểm tra.`);
  }

  function verify() {
    if (!originalFp.length || !targetFp.length) {
      setStatus("Vui lòng upload cả file gốc và file cần kiểm tra.");
      return;
    }

    const rate = compareFingerprints(originalFp, targetFp);
    setMatchRate(rate);

    if (rate >= 80) {
      setStatus("Khả năng cao file có sử dụng phần lớn nội dung audio gốc.");
    } else if (rate >= 40) {
      setStatus("File có dấu hiệu sử dụng một phần nội dung audio gốc.");
    } else {
      setStatus("Không tìm thấy mức trùng khớp đáng kể.");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="section-label">Audio Fingerprinting</p>
          <h2>Detect Partial Audio Reuse</h2>
          <p className="muted">
            So khớp fingerprint theo từng đoạn để phát hiện file bị cắt, nối,
            hoặc dùng lại một phần audio.
          </p>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>File audio gốc</label>
          <input type="file" accept="audio/*" onChange={handleOriginal} />
          <small>{originalFile ? originalFile.name : "Chọn file đã đăng ký."}</small>
        </div>

        <div className="form-group">
          <label>File audio cần kiểm tra</label>
          <input type="file" accept="audio/*" onChange={handleTarget} />
          <small>{targetFile ? targetFile.name : "Chọn file nghi vấn."}</small>
        </div>
      </div>

      <div className="action-row">
        <button className="primary-btn" onClick={verify}>
          Compare Fingerprint
        </button>

        <div className="status-box">
          {matchRate !== null ? `Match rate: ${matchRate}%` : status}
        </div>
      </div>

      {matchRate !== null && (
        <div
          className={
            matchRate >= 80
              ? "status-box verify-success"
              : matchRate >= 40
              ? "status-box"
              : "status-box verify-fail"
          }
          style={{ marginTop: 20 }}
        >
          {status}
        </div>
      )}
    </div>
  );
}

export default VerifyFingerprint;