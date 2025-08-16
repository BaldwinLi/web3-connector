import type { ethers } from "ethers";
import type { Chain } from "wagmi/chains";

export interface WalletState {
  walletId: string;

  walletIcon: string;

  walletName: string;
  address?: string;
  chainId?: number;
  isConnected: boolean;
  ensName?: string;
  error?: Error;
  chains: Chain[];
  provider: any;
}

export interface WalletContextValue extends WalletState {
  connect: (walletId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  switchChain: (chainId: number) => Promise<void>;
  switchAccount: (account: string) => Promise<void>;
  openModal: () => void;
  closeModal: () => void;
  openDetailModal: () => void;
  closeDetailModal: () => void;
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
  // autoConnect?: boolean;
  provider?: any;
}

export interface ConnectResult {
  accounts: string[];
  chainId: number;
  address: string;
  signer?: ethers.Signer;
  provider: any;
  disconnect?: () => Promise<void>;
}

export interface Wallet {
  id: string;
  name: string;
  icon: string;
  connector: () => Promise<ConnectResult>;
  description?: string;
  installed?: boolean;
  downloadUrl?: string;
}

export enum WalletEvent {
  wallet_disconnected = 'wallet_disconnected',
  wallet_accounts_changed = 'wallet_accounts_changed',
  wallet_chain_changed = 'wallet_chain_changed',
}