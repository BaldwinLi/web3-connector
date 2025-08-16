import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  WalletEvent,
  type Wallet,
  type WalletContextValue,
  type WalletProviderProps,
  type WalletState,
} from "../types";
import { WalletModal } from "../components/WalletModal";
import { WalletDetailModal } from "../components/WalletDetailModal";
const walletContext = createContext<WalletContextValue>({
  connect: async (walletId: string) => {
    console.log("connect", walletId);
  },
  disconnect: async () => {},
  switchChain: async (chainId: number) => {
    console.log("switchChainId", chainId);
  },
  switchAccount: async (account: string) => {
    console.log("switchAccount", account);
  },
  openModal: () => {},
  closeModal: () => {},
  openDetailModal: () => {},
  closeDetailModal: () => {},
  walletIcon: "",
  walletName: "",
  walletId: "",
  address: "",
  chainId: 0,
  isConnected: false,
  ensName: "",
  error: undefined,
  chains: [],
  provider: null,
});

export const WalletProvider: React.FC<WalletProviderProps> = ({
  children,
  chains,
  // autoConnect,
  wallets,
}) => {
  const [state, setState] = useState<
    WalletState & {
      disconnect: () => Promise<void>;
    }
  >({
    walletId: "",
    walletIcon: "",
    walletName: "",
    address: "",
    chainId: -1,
    isConnected: false,
    ensName: "",
    error: void 0,
    chains,
    provider: null,
    disconnect: async () => {},
  });

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);

  const walletsMap = useMemo(() => {
    return wallets.reduce((prev, cur) => {
      prev[cur.id] = cur;
      return prev;
    }, {} as Record<string, Wallet>);
  }, [wallets]);

  const value: WalletContextValue = {
    ...state,
    disconnect: async () => {
      await state.disconnect?.();
      setState({
        ...state,
        walletIcon: "",
        walletId: "",
        walletName: "",
        address: "",
        chainId: -1,
        isConnected: false,
        ensName: "",
        error: void 0,
      });
      window.removeEventListener(
        WalletEvent.wallet_disconnected,
        handleDisconnect
      );
    },
    async connect(walletId: string) {
      window.removeEventListener(
        WalletEvent.wallet_disconnected,
        handleDisconnect
      );
      const wallet = walletsMap[walletId];
      if (!wallet) {
        throw new Error("Wallet not found");
      }
      setState({
        ...state,
      });
      try {
        const {
          address,
          chainId,
          provider,
          disconnect: _disconnect,
        } = await wallet.connector();
        // window.addEventListener('wallet_accounts_changed', () => {
        //   debugger
        // })
        if (provider && address) {
          setState({
            ...state,
            walletIcon: wallet.icon,
            walletId: wallet.id,
            walletName: wallet.name,
            address,
            chainId,
            provider,
            isConnected: true,
            error: void 0,
            disconnect: _disconnect!,
          });
        }
        window.addEventListener(
          WalletEvent.wallet_disconnected,
          handleDisconnect
        );
      } catch (error: any) {
        setState({
          ...state,
          isConnected: false,
          error,
        });
      }
    },
    switchChain: async (chainId: number) => {
      // 切换网络
      setState({
        ...state,
        isConnected: false,
      });
      if (!state.provider) {
        throw new Error("Provider not found");
      }
      try {
        const res = await state.provider.send("wallet_switchEthereumChain", [
          { chainId: `0x${chainId.toString(16)}` },
        ]);
        console.log("####", res);
      } catch (switchError: any) {
        // 如果网络不存在，添加网络
        if (switchError.code === 4902) {
          const targetChain = chains.find((item) => item.id === chainId);
          if (!targetChain) {
            throw new Error("Chain not found");
          }
          await state.provider.send("wallet_addEthereumChain", [targetChain]);
        } else {
          throw new Error(switchError);
        }
      }
      setState({
        ...state,
        chainId: Number(chainId),
      });
    },
    openModal: () => setModalOpen(true),
    closeModal: () => setModalOpen(false),
    openDetailModal: () => setDetailModalOpen(true),
    closeDetailModal: () => setDetailModalOpen(false),
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

  function handleDisconnect() {
    value.disconnect();
  }

  useEffect(() => {
    value.connect(wallets[0].id);
  }, []);
  useEffect(() => {
    async function handleChainChanged() {
      await value.connect(state.walletId);
    }
    window.addEventListener(
      "wallet_chain_changed",
      handleChainChanged as EventListener
    );
    return () => {
      window.removeEventListener(
        "wallet_chain_changed",
        handleChainChanged as EventListener
      );
    };
  }, [state.walletId]);

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
      <WalletDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
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
