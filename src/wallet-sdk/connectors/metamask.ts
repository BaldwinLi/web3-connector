import type { ConnectResult, Wallet } from "../types";
import metamask from "../../assets/metamask.png";
import { ethers } from "ethers";

export async function connectMetamask(): Promise<ConnectResult> {
  // 是否安装了Metamask
  // 连接Metamask
  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    if (!accounts || accounts.length === 0) {
      throw new Error("用户未授权");
    }
    const provider = new ethers.BrowserProvider(window.ethereum);

    // 获取钱包地址
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    const chainId = await window.ethereum.request({
      method: "eth_chainId",
    });

    // 监听账户变化
    window.ethereum.on("accountsChanged", (accounts: string[]) => {
      if (accounts.length === 0) {
        // 断开连接
        dispatchEvent(new CustomEvent("wallet_disconnected"));
      } else {
        // 连接成功
        dispatchEvent(
          new CustomEvent("wallet_accounts_changed", {
            detail: {
              account: accounts,
            },
          })
        );
      }
    });

    // 监听网络变化
    window.ethereum.on("chainChanged", (chainId: string) => {
      dispatchEvent(
        new CustomEvent("wallet_chain_changed", {
          detail: {
            chainId: Number(chainId),
          },
        })
      );
    });

    return {
      accounts,
      chainId,
      address,
      signer,
      provider,
    };
  } catch (error) {
    console.log(error);
    return {
      accounts: [],
      chainId: -1,
      address: "",
      signer: void 0,
      provider: null,
    };
  }
}

export const metaMaskWallet: Wallet = {
  id: "metamask",
  name: "MetaMask",
  icon: metamask,
  connector: connectMetamask,
  description: "MetaMask is a cryptocurrency wallet that allows you to store, send, and receive cryptocurrencies.",
  // installed: window.ethereum && window.ethereum.isMetaMask,
  installed: true,
  downloadUrl: "https://metamask.io/download",

}