import type { Chain } from "wagmi/chains";

export interface WalletState {
  address?: string;
  chainId?: number;
  isConnecting: boolean;
  isConnected: boolean;
  ensName?: string;
  error?: Error;
  chains: Chain[];
  provider: any;
}

export interface WalletContextValue extends WalletState {
  connect: (walletId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  switchChain: (chainId: string) => Promise<void>;
  openModal: () => void;
  closeModal: () => void;
}

// export interface Chain {
//   id: string;
//   name: string;
//   rpcUrl: string;
//   currency: {
//     name: string;
//     symbol: string;
//     decimals: number;
//   };
//   blockExplorer: {
//     url: string;
//     name: string;
//   };
// }

export interface WalletProviderProps {
  children: React.ReactNode;
  chains: Chain[];
  wallets: Wallet[];
  autoConnect?: boolean;
  provider?: any;
}

export interface Wallet {
  id: string;
  name: string;
  icon: string;
  connector: () => Promise<void>;
  description?: string;
  installed?: boolean;
  downloadUrl?: string;
}
 