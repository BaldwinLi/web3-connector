import { useEffect, useState } from "react";
import { useWaller } from "../provider";
import { ethers } from "ethers";
import * as chains from "wagmi/chains";

interface ConnectionButtonProps {
  label?: string;
  showBalance?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onChainChange?: (chainId: number) => void;
  onBalanceChange?: (balance: string) => void;
  onAccountChange?: (account: string) => void;
}

export function ConnectionButton({
  label,
  showBalance,
  size,
  className,
  onConnect,
  onDisconnect,
  onChainChange,
  onAccountChange,
  onBalanceChange,
}: ConnectionButtonProps): React.ReactNode {
  const {
    walletIcon,
    walletName,
    isConnected,
    ensName,
    openModal,
    openDetailModal,
    address,
    chainId,
    provider,
  } = useWaller();

  // 获取当前钱包账户的余额
  const [balance, setBalance] = useState<string>("");
  async function getBalance() {
    if (!address) {
      return;
    }
    // const network = await provider.getNetwork();
    // const currentChainId = Number(network.chainId);

    // // 检查是否匹配期望的链ID
    // if (chainId && currentChainId !== chainId) {
    //   console.log(`Network mismatch: expected ${chainId}, got ${currentChainId}`);
    //   // 等待网络同步或提示用户
    //   return;
    // }
    try {
      for (const chain of Object.values(chains)) {
        if (chain.id === chainId) {
          const _balance = await provider.getBalance(address);
          const { name } = await provider.getNetwork();
          setBalance(
            `${ethers.formatEther(_balance)} ${name} ${
              chain.nativeCurrency.symbol
            }`
          );
          break;
        }
      }
    } catch (error) {
      console.warn("getBalance error", error);

    }

    // setBalance(`${ethers.formatEther(_balance)} ${name} ${currencySymbols[chainId || 1] || 'ETH'}`);

    // setSymbol(currencySymbol);
  }

  useEffect(() => {
    if (isConnected) {
      onConnect?.();
    } else {
      onDisconnect?.();
    }
  }, [isConnected, onConnect, onDisconnect]);
  useEffect(() => {
    if (chainId) {
      onChainChange?.(chainId);
    }
  }, [chainId, onChainChange]);
  useEffect(() => {
    if (address) {
      onAccountChange?.(address);
    }
  }, [address, onAccountChange]);
  useEffect(() => {
    getBalance();
  }, [address, provider]);
  // 展示余额
  useEffect(() => {
    onBalanceChange?.(balance);
  }, [balance, onBalanceChange]);

  const sizeClasses = {
    md: "text-base px-4 py-2",
    lg: "text-lg px-6 py-3",
    sm: "text-sm px-3 py-1",
  };
  const defaultClassName =
    " flex items-center justify-center bg-blue-500 text-white rounded-md px-4 py-2 cursor-pointer hover:bg-blue-600 transition-colors duration-300 outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md focus:ring-offset-blue-500 group ";

  return (
    <div>
      {isConnected ? (
        <button
          className={sizeClasses[size || "md"] + defaultClassName + className}
          onClick={openDetailModal}
        >
          <img className=" w-6 h-6 rounded-full mr-2" src={walletIcon} alt="" />


          {label || `${walletName} ` + (showBalance ? `| ${balance} ` : "")}
        </button>
      ) : (
        <button
          className={sizeClasses[size || "md"] + defaultClassName + className}
          onClick={openModal}
        >
          {label || `Connect ${ensName}`}
        </button>
      )}
    </div>
  );
}
