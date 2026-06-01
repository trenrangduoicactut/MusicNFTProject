import { useState } from "react";
import { getContract } from "../services/contract";
import { createAudioFingerprint } from "../services/audioFingerprint";

const BACKEND_URL = "http://localhost:5001";

function MintMusic() {
  const [account, setAccount] = useState("");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [licenseType, setLicenseType] = useState("1");
  const [royalty, setRoyalty] = useState("500");
  const [status, setStatus] = useState("");

  const [audioHash, setAudioHash] = useState("");
  const [audioFileName, setAudioFileName] = useState("");
  const [fingerprints, setFingerprints] = useState([]);

  const [rightsHash, setRightsHash] = useState("");
  const [rightsFileName, setRightsFileName] = useState("");

  const [metadataURL, setMetadataURL] = useState("");

  async function connectWallet() {
    if (!window.ethereum) {
      setStatus("Chưa cài MetaMask.");
      return;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setAccount(accounts[0]);
    setStatus("Đã kết nối ví MetaMask.");
  }

  async function hashFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return (
      "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
    );
  }

  async function handleAudioFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    setAudioFileName(file.name);
    setAudioHash("");
    setFingerprints([]);

    setStatus("Đang tạo audioHash từ file audio...");
    const hashHex = await hashFile(file);
    setAudioHash(hashHex);

    setStatus("Đang tạo audio fingerprint...");
    const fp = await createAudioFingerprint(file);
    setFingerprints(fp);

    setStatus(`Đã tạo audioHash và ${fp.length} fingerprint segments.`);
  }

  async function handleRightsFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    setRightsFileName(file.name);
    setRightsHash("");

    setStatus("Đang tạo rightsHash từ file hợp đồng...");
    const hashHex = await hashFile(file);

    setRightsHash(hashHex);
    setStatus("Đã tạo rightsHash 32 bytes từ file hợp đồng.");
  }

  async function createMetadataURL() {
    setStatus("Đang tạo metadata URL từ backend...");

    const response = await fetch(`${BACKEND_URL}/api/metadata`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        artist,
        licenseType,
        royalty,
        audioHash,
        rightsHash,
        audioFileName,
        rightsFileName,
        fingerprintsCount: fingerprints.length,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không tạo được metadata URL.");
    }

    setMetadataURL(data.metadataURL);
    return data.metadataURL;
  }

  async function mintNFT() {
    try {
      if (!account) {
        setStatus("Vui lòng connect MetaMask trước.");
        return;
      }

      if (!title || !artist) {
        setStatus("Vui lòng nhập đầy đủ tên bài hát và nghệ sĩ.");
        return;
      }

      if (!audioHash) {
        setStatus("Vui lòng chọn file audio để tạo audioHash.");
        return;
      }

      if (!rightsHash) {
        setStatus("Vui lòng upload file hợp đồng để tạo rightsHash.");
        return;
      }

      if (!fingerprints.length) {
        setStatus("Vui lòng chờ hệ thống tạo xong audio fingerprint.");
        return;
      }

      const generatedMetadataURL = await createMetadataURL();

      setStatus("Đang gửi giao dịch mint NFT...");

      const contract = await getContract();

      const tx = await contract.mintMusic(
        account,
        title,
        artist,
        generatedMetadataURL,
        audioHash,
        rightsHash,
        Number(licenseType),
        account,
        Number(royalty)
      );

      setStatus("Đang chờ blockchain xác nhận transaction...");
      const receipt = await tx.wait();

      let tokenId = "";

      for (const log of receipt.logs) {
        try {
          const parsedLog = contract.interface.parseLog(log);

          if (parsedLog && parsedLog.name === "MusicMinted") {
            tokenId = parsedLog.args.tokenId.toString();
            break;
          }
        } catch {
          // skip unrelated logs
        }
      }

      if (tokenId) {
        localStorage.setItem(
          `fingerprint_token_${tokenId}`,
          JSON.stringify({
            tokenId,
            title,
            artist,
            audioFileName,
            rightsFileName,
            audioHash,
            rightsHash,
            metadataURL: generatedMetadataURL,
            fingerprints,
            createdAt: new Date().toISOString(),
          })
        );

        setStatus(
          `Mint NFT thành công! Token ID: ${tokenId}. Metadata URL đã được tạo tự động.`
        );
      } else {
        setStatus("Mint NFT thành công! Metadata URL đã được tạo tự động.");
      }
    } catch (error) {
      console.error(error);
      setStatus(
        error.message ||
          "Mint thất bại. Kiểm tra backend, MetaMask hoặc Console."
      );
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="section-label">Create NFT</p>
          <h2>Mint Music Copyright NFT</h2>
          <p className="muted">
            Nhập thông tin bài hát, upload file audio và hợp đồng. Backend sẽ tự
            tổng hợp dữ liệu thành metadata URL trước khi mint NFT.
          </p>
        </div>

        <button className="wallet-btn" onClick={connectWallet}>
          {account ? "Wallet Connected" : "Connect Wallet"}
        </button>
      </div>

      {account && (
        <div className="wallet-card">
          <span>Connected account</span>
          <p>{account}</p>
        </div>
      )}

      <div className="form-grid">
        <div className="form-group">
          <label>Tên bài hát</label>
          <input
            placeholder="Ví dụ: Bai hat dau tien"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <small>Tên tác phẩm âm nhạc sẽ được ghi vào metadata và contract.</small>
        </div>

        <div className="form-group">
          <label>Nghệ sĩ / Tác giả</label>
          <input
            placeholder="Ví dụ: Jack-J97"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
          />
          <small>Tên nghệ sĩ hoặc người sáng tạo tác phẩm.</small>
        </div>

        <div className="form-group full">
          <label>Audio File</label>
          <input type="file" accept="audio/*" onChange={handleAudioFile} />
          <small>
            Hệ thống tạo SHA-256 audioHash và segment fingerprint từ file audio.
          </small>

          {audioHash && (
            <div className="status-box">
              <strong>{audioFileName}</strong>
              <br />
              <b>Audio Hash:</b>
              <br />
              <span style={{ wordBreak: "break-all" }}>{audioHash}</span>
              <br />
              <br />
              <b>Fingerprint Segments:</b> {fingerprints.length}
            </div>
          )}
        </div>

        <div className="form-group full">
          <label>Copyright Document</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            onChange={handleRightsFile}
          />
          <small>
            Upload hợp đồng hoặc giấy tờ bản quyền. Hệ thống chỉ lưu rightsHash,
            không lưu file lên blockchain.
          </small>

          {rightsHash && (
            <div className="status-box">
              <strong>{rightsFileName}</strong>
              <br />
              <b>Rights Hash:</b>
              <br />
              <span style={{ wordBreak: "break-all" }}>{rightsHash}</span>
            </div>
          )}
        </div>

        {metadataURL && (
          <div className="form-group full">
            <label>Metadata URL được tạo tự động</label>
            <div className="status-box">
              <span style={{ wordBreak: "break-all" }}>{metadataURL}</span>
            </div>
            <small>
              URL này được backend tạo từ thông tin bài hát, audioHash,
              rightsHash, license và royalty.
            </small>
          </div>
        )}

        <div className="form-group">
          <label>Loại giấy phép</label>
          <select
            value={licenseType}
            onChange={(e) => setLicenseType(e.target.value)}
          >
            <option value="0">Personal Use</option>
            <option value="1">Commercial Use</option>
            <option value="2">Remix Allowed</option>
            <option value="3">Exclusive Copyright</option>
          </select>
          <small>Quy định phạm vi sử dụng tác phẩm.</small>
        </div>

        <div className="form-group">
          <label>Royalty</label>
          <input
            placeholder="500 = 5%"
            value={royalty}
            onChange={(e) => setRoyalty(e.target.value)}
          />
          <small>ERC2981 dùng mẫu số 10000. Ví dụ 500 là 5%.</small>
        </div>
      </div>

      <div className="action-row">
        <button className="primary-btn" onClick={mintNFT}>
          Mint Music NFT
        </button>

        <div className="status-box">{status || "Chưa có giao dịch nào."}</div>
      </div>
    </div>
  );
}

export default MintMusic;