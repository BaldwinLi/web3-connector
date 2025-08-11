import { ethers } from "ethers";
import type { ConnectResult, Wallet } from "../types";
import coinbase from "../../assets/coinbase.png";

function isCoinbaseWalletInstalled(): boolean {
  return typeof (window as any)?.coinbaseWalletExtension !== "undefined";
}
export async function connectCoinbase(): Promise<ConnectResult> {
  if (!isCoinbaseWalletInstalled()) {
    throw new Error("Coinbase wallet is not installed");
  }
  try {
    const coinbaseProvider = (window as any)?.coinbaseWalletExtension;
    const provider = new ethers.BrowserProvider(coinbaseProvider);
    const accounts = await coinbaseProvider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const { chainId } = await provider.getNetwork();

    coinbaseProvider?.on?.("chainChanged", (chainId: string) => {
      dispatchEvent(
        new CustomEvent("chainChanged", {
          detail: {
            chainId: Number(chainId),
          },
        })
      );
    });
    coinbaseProvider?.on?.("accountsChanged", (accounts: string[]) => {
      dispatchEvent(
        new CustomEvent("accountsChanged", {
          detail: {
            accounts,
          },
        })
      );
    });

    coinbaseProvider?.on?.("disconnect", (error: any) => {
      dispatchEvent(
        new CustomEvent("disconnect", {
          detail: {
            error,
          },
        })
      );
    });



    return {
      provider,
      signer,
      address,
      chainId: Number(chainId),
      accounts,
      disconnect: async () => {
        await provider.removeAllListeners();
      },
    };
  } catch (e: any) {
    throw e.message;
  }
}

export const coinbaseWallet: Wallet = {
  id: "coinbase",
  name: "Coinbase",
  icon: coinbase,
  connector: connectCoinbase,
  description: "Coinbase is a cryptocurrency wallet that allows you to store, send, and receive cryptocurrencies.",
  installed: true,
  downloadUrl: "https://www.coinbase.com/download",
}
