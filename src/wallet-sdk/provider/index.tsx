import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  Wallet,
  WalletContextValue,
  WalletProviderProps,
  WalletState,
} from "../types";
import { WalletModal } from "../components/WalletModal";
const walletContext = createContext<WalletContextValue>({
  connect: async (walletId: string) => {
    console.log("connect", walletId);
  },
  disconnect: async () => {},
  switchChain: async (chainId: string) => {
    console.log("switchChainId", chainId);
  },
  switchAccount: async (account: string) => {
    console.log("switchAccount", account);
  },
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
  autoConnect,
  wallets,
}) => {
  const [state, setState] = useState<WalletState>({
    address: "",
    chainId: -1,
    isConnecting: false,
    isConnected: false,
    ensName: "",
    error: void 0,
    chains,
    provider: null,
  });

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const walletsMap = useMemo(() => {
    return wallets.reduce((prev, cur) => {
      prev[cur.id] = cur;
      return prev;
    }, {} as Record<string, Wallet>);
  }, [wallets]);
  let _disconnect: () => Promise<void>;

  const value: WalletContextValue = {
    ...state,
    connect: async (walletId: string) => {
      const wallet = walletsMap[walletId];
      if (!wallet) {
        throw new Error("Wallet not found");
      }
      setState({
        ...state,
        isConnecting: true,
      });
      try {
        const { address, chainId, provider, disconnect } = await wallet.connector();
        _disconnect = disconnect!
        setState({
          ...state,
          address,
          chainId,
          provider,
          isConnecting: false,
          isConnected: true,
          error: void 0,
        });
      } catch (error: any) {
        setState({
          ...state,
          isConnecting: false,
          isConnected: false,
          error,
        });
      }
    },
    disconnect: async () => {
      // 断开当前钱包链接
      await _disconnect?.();

      // 2. 重置前端状态
      setState({
        ...state,
        address: "",
        chainId: -1,
        isConnecting: false,
        isConnected: false,
        ensName: "",
        error: void 0,
      });
    },
    switchChain: async (chainId: string) => {
      // 切换chainId
      if (!state.provider) {
        throw new Error("Provider not found");
      }
      const currentChainId = await state.provider.send("eth_chainId", [chainId]);
      if (Number(currentChainId) !== Number(chainId)) {
        throw new Error("ChainId not match");
      }

      setState({
        ...state,
        chainId: Number(currentChainId),
      });
    },
    openModal: () => setModalOpen(true),
    closeModal: () => setModalOpen(false),
    switchAccount: async (account: string) => {
      // 切换account
      if (!state.provider) {
        throw new Error("Provider not found");
      }
      const currentAccount = await state.provider.send("eth_requestAccounts", [
        account,
      ]);
      if (currentAccount !== account) {
        throw new Error("Account not match");
      }
      setState({
        ...state,
        address: currentAccount,
      });
    },
  };

  useEffect(() => {
    if (autoConnect) {
      value.connect(wallets[0].id);
    }
  }, []);
  return (
    <walletContext.Provider value={value}>
      {children}

      <WalletModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        wallets={wallets}
        onSelectWallet={value.connect}
        isConnected={value.isConnected}
        // error={value.error}
      />
    </walletContext.Provider>
  );
};

export function useWaller(): WalletContextValue {
  const context = useContext(walletContext);
  if (!context) {
    throw new Error("useWaller must be used within a WalletProvider");
  }
  return context;
}

export default WalletProvider;
