import { useState } from "react";
import { getContract } from "../services/contract";

const licenseNames = [
  "Personal Use",
  "Commercial Use",
  "Remix Allowed",
  "Exclusive Copyright",
];

function MyCollection() {
  const [account, setAccount] = useState("");
  const [nfts, setNfts] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "minted" | "received"

  async function connectAndLoad() {
    if (!window.ethereum) {
      setStatus("Chưa cài MetaMask.");
      return;
    }

    try {
      setLoading(true);
      setStatus("Đang kết nối ví...");

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const userAddress = accounts[0];
      setAccount(userAddress);

      setStatus("Đang tải NFT collection...");
      await loadCollection(userAddress);
    } catch (err) {
      console.error(err);
      setStatus(err?.message || "Lỗi khi kết nối ví.");
    } finally {
      setLoading(false);
    }
  }

  async function loadCollection(userAddress) {
    const contract = await getContract();

    // Lấy tất cả event Transfer có to = userAddress (nhận NFT)
    const filterReceived = contract.filters.Transfer(null, userAddress);
    // Lấy tất cả event MusicMinted có creator = userAddress (tự mint)
    const filterMinted = contract.filters.MusicMinted(null, userAddress);

    const [receivedLogs, mintedLogs] = await Promise.all([
      contract.queryFilter(filterReceived),
      contract.queryFilter(filterMinted),
    ]);

    // Thu thập tokenId từ cả 2 nguồn, tránh trùng
    const tokenIdSet = new Set();
    const tokenMeta = {}; // tokenId -> { source: "minted" | "received" | "both" }

    for (const log of mintedLogs) {
      const id = log.args.tokenId.toString();
      tokenIdSet.add(id);
      tokenMeta[id] = { source: "minted" };
    }

    for (const log of receivedLogs) {
      const id = log.args.tokenId.toString();
      // Bỏ qua mint event (from = 0x000...)
      const from = log.args.from;
      if (from === "0x0000000000000000000000000000000000000000") continue;

      if (tokenIdSet.has(id)) {
        tokenMeta[id].source = "both";
      } else {
        tokenIdSet.add(id);
        tokenMeta[id] = { source: "received" };
      }
    }

    if (tokenIdSet.size === 0) {
      setNfts([]);
      setStatus("Bạn chưa có NFT nào.");
      return;
    }

    // Với mỗi tokenId, kiểm tra owner hiện tại rồi lấy info
    const results = [];

    await Promise.all(
      [...tokenIdSet].map(async (id) => {
        try {
          const currentOwner = await contract.ownerOf(BigInt(id));
          // Chỉ hiện nếu vẫn đang sở hữu
          if (currentOwner.toLowerCase() !== userAddress.toLowerCase()) return;

          const info = await contract.getMusicInfo(BigInt(id));
          const uri = await contract.tokenURI(BigInt(id));

          results.push({
            tokenId: id,
            title: info.title,
            artist: info.artist,
            licenseType: Number(info.licenseType),
            creator: info.creator,
            createdAt: Number(info.createdAt),
            audioHash: info.audioHash,
            metadataURI: uri,
            source: tokenMeta[id].source,
          });
        } catch (e) {
          // Token có thể bị burn hoặc không tồn tại, bỏ qua
          console.warn(`Token ${id} error:`, e.message);
        }
      })
    );

    // Sắp xếp theo tokenId tăng dần
    results.sort((a, b) => Number(a.tokenId) - Number(b.tokenId));

    setNfts(results);
    setStatus(
      `Tìm thấy ${results.length} NFT đang sở hữu.`
    );
  }

  const filtered = nfts.filter((n) => {
    if (activeTab === "minted") return n.source === "minted" || n.source === "both";
    if (activeTab === "received") return n.source === "received" || n.source === "both";
    return true;
  });

  const mintedCount = nfts.filter(
    (n) => n.source === "minted" || n.source === "both"
  ).length;
  const receivedCount = nfts.filter(
    (n) => n.source === "received" || n.source === "both"
  ).length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="section-label">My NFTs</p>
          <h2>My Collection</h2>
          <p className="muted">
            Danh sách NFT bạn đang sở hữu — bao gồm bài đã mint và bài nhận từ giao dịch.
          </p>
        </div>
      </div>

      {!account ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "12px" }}>
          <button className="wallet-btn" onClick={connectAndLoad} disabled={loading}>
            {loading ? "Đang tải..." : "🔗 Kết nối MetaMask & Xem Collection"}
          </button>
          {status && <div className="status-box">{status}</div>}
        </div>
      ) : (
        <>
          {/* Wallet info */}
          <div className="wallet-card" style={{ marginBottom: "20px" }}>
            <span className="muted" style={{ fontSize: "12px" }}>Địa chỉ ví</span>
            <p style={{ fontFamily: "monospace", wordBreak: "break-all", margin: "4px 0 0" }}>
              {account}
            </p>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
            {[
              { key: "all", label: `Tất cả (${nfts.length})` },
              { key: "minted", label: `Đã Mint (${mintedCount})` },
              { key: "received", label: `Đã Nhận (${receivedCount})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: "8px 18px",
                  borderRadius: "999px",
                  border: "1px solid var(--border)",
                  background:
                    activeTab === tab.key
                      ? "var(--accent)"
                      : "transparent",
                  color:
                    activeTab === tab.key
                      ? "#fff"
                      : "var(--text-muted)",
                  cursor: "pointer",
                  fontWeight: activeTab === tab.key ? 600 : 400,
                  fontSize: "13px",
                  transition: "all 0.2s",
                }}
              >
                {tab.label}
              </button>
            ))}

            <button
              className="primary-btn"
              style={{ marginLeft: "auto", padding: "8px 18px", fontSize: "13px" }}
              onClick={() => loadCollection(account)}
              disabled={loading}
            >
              {loading ? "Đang tải..." : "↻ Làm mới"}
            </button>
          </div>

          {/* Status */}
          {status && (
            <div className="status-box" style={{ marginBottom: "16px" }}>
              {status}
            </div>
          )}

          {/* NFT Grid */}
          {filtered.length === 0 ? (
            <div className="status-box">
              {loading ? "Đang tải dữ liệu..." : "Không có NFT nào trong mục này."}
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "16px",
              }}
            >
              {filtered.map((nft) => (
                <NFTCard key={nft.tokenId} nft={nft} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function NFTCard({ nft }) {
  const sourceLabel = {
    minted: { text: "Đã Mint", color: "#7c3aed" },
    received: { text: "Đã Nhận", color: "#0ea5e9" },
    both: { text: "Mint & Nhận", color: "#059669" },
  };

  const badge = sourceLabel[nft.source] || { text: nft.source, color: "#888" };

  return (
    <div
      className="mini-nft-card"
      style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "20px" }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div className="mini-cover" style={{ fontSize: "28px", width: "52px", height: "52px" }}>
          ♪
        </div>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            padding: "3px 10px",
            borderRadius: "999px",
            background: badge.color + "22",
            color: badge.color,
            border: `1px solid ${badge.color}44`,
          }}
        >
          {badge.text}
        </span>
      </div>

      {/* Title */}
      <div>
        <h3 style={{ margin: 0, fontSize: "15px" }}>{nft.title || "Untitled"}</h3>
        <p className="muted" style={{ margin: "2px 0 0", fontSize: "13px" }}>
          {nft.artist || "Unknown Artist"}
        </p>
      </div>

      {/* Info rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div className="mini-row">
          <span>Token ID</span>
          <strong>#{nft.tokenId}</strong>
        </div>
        <div className="mini-row">
          <span>License</span>
          <strong>{licenseNames[nft.licenseType] || "Unknown"}</strong>
        </div>
        <div className="mini-row">
          <span>Ngày tạo</span>
          <strong>{new Date(nft.createdAt * 1000).toLocaleDateString("vi-VN")}</strong>
        </div>
        <div className="mini-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: "2px" }}>
          <span>Creator</span>
          <strong
            style={{
              fontFamily: "monospace",
              fontSize: "11px",
              wordBreak: "break-all",
              opacity: 0.8,
            }}
          >
            {nft.creator}
          </strong>
        </div>
      </div>
    </div>
  );
}

export default MyCollection;
