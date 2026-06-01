export default function NFTPreviewCard({
  title,
  artist,
  license,
  royalty,
  audioHash,
}) {
  return (
    <div className="preview-card">
      <div className="preview-cover">
        ♪
      </div>

      <h3>
        {title || "Untitled Song"}
      </h3>

      <p>
        {artist || "Unknown Artist"}
      </p>

      <div className="preview-info">
        <span>
          License
        </span>

        <strong>
          {license}
        </strong>
      </div>

      <div className="preview-info">
        <span>
          Royalty
        </span>

        <strong>
          {royalty}%
        </strong>
      </div>

      <div className="preview-hash">
        {audioHash
          ? audioHash.slice(0, 18) + "..."
          : "No audio hash"}
      </div>
    </div>
  );
}