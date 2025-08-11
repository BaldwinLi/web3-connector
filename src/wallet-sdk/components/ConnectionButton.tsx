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
    isConnected,
    disconnect,
    ensName,
    openModal,
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
    const balance = await provider.getBalance(address);
    setBalance(ethers.formatEther(balance));
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
  //   async function handleConnect() {
  //     await connect("metamask");
  //     onConnect?.();
  //   }

  async function handleDisconnect() {
    await disconnect();
    onDisconnect?.();
  }
  const defaultClassName = " flex items-center justify-center bg-blue-500 text-white rounded-md px-4 py-2";



  return (
    <div>
      {isConnected ? (
        <button
          className={sizeClasses[size || "md"] + defaultClassName + className}

          onClick={handleDisconnect}
        >
          {label ||
            `Disconnect ${ensName} ` +
              (showBalance ? `| balance: ${balance}` : "")}
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
