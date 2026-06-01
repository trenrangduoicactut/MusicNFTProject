import { useState } from "react";

export default function ConnectWallet() {
  const [account, setAccount] = useState("");

  async function connect() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setAccount(accounts[0]);
  }

  return (
    <>
      <button onClick={connect}>
        Connect Wallet
      </button>

      <p>{account}</p>
    </>
  );
}