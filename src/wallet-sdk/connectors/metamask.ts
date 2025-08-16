import { WalletEvent, type ConnectResult, type Wallet } from "../types";
import metamask from "../../assets/metamask.png";
import { ethers } from "ethers";

// 检测MetaMask提供商的函数
async function detectMetaMaskProvider(): Promise<any> {
  // 标准EIP-6963检测方法
  if (window.ethereum?.providers) {
    // 查找MetaMask提供商
    const metamaskProvider = window.ethereum.providers.find(
      (provider: any) => provider.isMetaMask
    );
    if (metamaskProvider) {
      return metamaskProvider;
    }
  }

  // 传统检测方法
  if (window.ethereum?.isMetaMask) {
    return window.ethereum;
  }

  // 尝试通过EIP-6963的事件检测
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("MetaMask not found")),
      3000
    );

    function handleProviderEvent(event: any) {
      if (event.detail.provider.isMetaMask) {
        clearTimeout(timeout);
        window.removeEventListener(
          "eip6963:providerFound",
          handleProviderEvent
        );
        resolve(event.detail.provider);
      }
    }

    window.addEventListener("eip6963:providerFound", handleProviderEvent);
    window.dispatchEvent(new Event("eip6963:requestProviders"));
  });
}

async function disconnectMetamask(metamaskProvider: any): Promise<void> {
  try {
    // 1. 移除所有事件监听器
    metamaskProvider.removeAllListeners();
    // 断开链接
    await window.ethereum.request({
      method: "wallet_revokePermissions",
      params: [
        {
          // permission_name: {
          //   newKey: "New Value",
          // },
          eth_accounts: {},
        },
      ],
    });

    // 4. 触发断开连接事件
    dispatchEvent(new CustomEvent(WalletEvent.wallet_disconnected));

    console.log("MetaMask disconnected successfully");
  } catch (error) {
    console.error("Error disconnecting MetaMask:", error);
    throw error;
  }
}
export async function connectMetamask(): Promise<ConnectResult> {
  // 是否安装了Metamask
  if (!window.ethereum) {
    throw new Error("请先安装MetaMask");
  }
  try {
    // 获取MetaMask提供商
    const metamaskProvider = await detectMetaMaskProvider();
    if (!metamaskProvider) {
      throw new Error("未找到MetaMask钱包");
    }

    let accounts = await metamaskProvider.request({
      method: "eth_accounts",
    });
    const res = await metamaskProvider.request({
      method: "wallet_requestPermissions",
      params: [
        {
          eth_accounts: {},
        },
      ],
    });

    if (res) {
      // 如果没有授权账户，则请求授权
      if (!accounts || accounts.length === 0) {
        accounts = await metamaskProvider.request({
          method: "eth_requestAccounts",
        });
      }
    }
    // 首先检查是否已有授权账户

    if (!accounts || accounts.length === 0) {
      throw new Error("用户未授权");
    }

    const provider = new ethers.BrowserProvider(metamaskProvider);

    // 获取钱包地址
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    // 使用provider获取链ID，更可靠
    const { chainId } = await provider.getNetwork();
    // const chainId = network.chainId;

    // 监听账户变化
    metamaskProvider.on("accountsChanged", (accounts: string[]) => {
      if (accounts.length === 0) {
        // 断开连接
        dispatchEvent(new CustomEvent(WalletEvent.wallet_disconnected));
      } else {
        // 连接成功
        dispatchEvent(
          new CustomEvent(WalletEvent.wallet_accounts_changed, {
            detail: {
              account: accounts,
            },
          })
        );
      }
    });

    // 监听网络变化
    metamaskProvider.on("chainChanged", (chainId: string) => {
      dispatchEvent(
        new CustomEvent(WalletEvent.wallet_chain_changed, {
          detail: {
            chainId: Number(chainId),
          },
        })
      );
    });

    return {
      accounts,
      chainId: Number(chainId),
      address,
      signer,
      provider,
      disconnect: async () => {
        await disconnectMetamask(metamaskProvider);
      },
    };
  } catch (error: any) {
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
  description:
    "MetaMask is a cryptocurrency wallet that allows you to store, send, and receive cryptocurrencies.",
  // installed: window.ethereum && window.ethereum.isMetaMask,
  installed: true,
  downloadUrl: "https://metamask.io/download",
};
