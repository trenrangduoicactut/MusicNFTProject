import { useState } from "react";
import { getContract } from "../services/contract";

function UpdateMetadata() {
  const [tokenId, setTokenId] = useState("");
  const [newURI, setNewURI] = useState("");
  const [status, setStatus] = useState("");

  async function updateMetadata() {
    try {
      setStatus("Đang cập nhật...");

      const contract = await getContract();

      const tx = await contract.updateTokenURI(tokenId, newURI);
      await tx.wait();

      setStatus("Cập nhật metadata thành công!");
    } catch (error) {
      console.error(error);
      setStatus("Cập nhật thất bại. Chỉ owner NFT mới sửa được.");
    }
  }

  return (
    <div>
      <h2>Update Metadata</h2>

      <input
        placeholder="Token ID"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="New Metadata URI"
        value={newURI}
        onChange={(e) => setNewURI(e.target.value)}
      />

      <br /><br />

      <button onClick={updateMetadata}>Update</button>

      <p>{status}</p>
    </div>
  );
}

export default UpdateMetadata;