import { useEffect, useState } from "react";
import { useWaller } from "../provider";
import { ethers } from "ethers";

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

// 常见链的货币符号映射
const currencySymbols: Record<number, string> = {
  1: "ETH", // 主网
  5: "ETH", // Goerli
  11155111: "ETH", // Sepolia
  137: "MATIC", // Polygon
  80001: "MATIC", // Mumbai
  56: "BNB", // BSC
  97: "BNB", // BSC Testnet
  43114: "AVAX", // Avalanche
  43113: "AVAX", // Avalanche Fuji
};

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
    const _balance = await provider.getBalance(address);
    const { chainId } = await provider.getNetwork();

    setBalance(`${ethers.formatEther(_balance)} ${currencySymbols[chainId]}`);

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
    " flex items-center justify-center bg-blue-500 text-white rounded-md px-4 py-2";

  return (
    <div>
      {isConnected ? (
        <button
          className={sizeClasses[size || "md"] + defaultClassName + className}
          onClick={openDetailModal}
        >
          <img className=" w-6 h-6 rounded-full" src={walletIcon} alt="" />

          {label ||
            `${walletName} ` + (showBalance ? `| ${balance} ` : "")}
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
