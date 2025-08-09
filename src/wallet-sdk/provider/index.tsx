import React, { createContext, useContext, useEffect, useState } from "react";
import type {
  WalletContextValue,
  WalletProviderProps,
  WalletState,
} from "../types";
const walletContext = createContext<WalletContextValue>({
  connect: async (walletId: string) => {},
  disconnect: async () => {},
  switchChain: async (chainId: string) => {},
  openModal: () => {},
  closeModal: () => {},
  address: "",
  chainId: 0,
  isConnecting: false,
  isConnected: false,
  ensName: "",
  error: undefined,
  chains: [],
  provider: null,
});

export const WalletProvider: React.FC<WalletProviderProps> = ({
  children,
  chains,
  provider,
  autoConnect,
  wallets
}) => {
  const [state, setState] = useState<WalletState>({
    address: "",
    chainId: -1,
    isConnecting: false,
    isConnected: false,
    ensName: "",
    error: void 0,
    chains,
    provider,
    
  });

  const value: WalletContextValue = {
    ...state,
    connect: async (walletId: string) => {},
    disconnect: async () => {},
    switchChain: async (chainId: string) => {},
    openModal: () => {},
    closeModal: () => {},
  };

  useEffect(() => {
    if (autoConnect) {
      value.connect(value.chains[0].id);
    }
  }, []);
  return (
    <walletContext.Provider value={value}>{children}</walletContext.Provider>
  );
};

export  function useWaller(): WalletContextValue {
  const context = useContext(walletContext);
  if (!context) {
    throw new Error("useWaller must be used within a WalletProvider");
  }
  return context;
}


export default WalletProvider;