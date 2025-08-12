import type { Wallet } from "../types";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  onSelectWallet: (walletId: string) => Promise<void>;
  isConnected: boolean;
  //   error: Error | undefined;
}

export function WalletModal({
  isOpen,
  onClose,
  wallets,
  onSelectWallet,
  isConnected,
}: //   error,
WalletModalProps) {
  if (!isOpen) {
    return null;
  }
  // 查询已连接的钱包
  //   const connectedWallet = wallets.find((wallet) => wallet.isConnected);

  return (
    <div
      className="fixed inset-0 bg-black opacity-50 flex justify-center items-center"




      onClick={onClose}
    >
      <div
        className="bg-white p-4 rounded-lg  box-shadow border border-gray-300 opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        <div className="text-2xl font-bold">Select Wallet</div>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {wallets.map((wallet) => (
            <div
              key={wallet.id}
              className="flex items-center justify-between p-2 border-b"
            >
              <img
                src={wallet.icon}
                alt={wallet.name}
                className="w-8 h-8 rounded-md"
              />
              <div
                className={`text-lg font-bold text-blue-500 cursor-pointer flex-1 ml-3 text-center`}



                onClick={async () => {
                  if (!isConnected) {
                    await onSelectWallet(wallet.id);
                    onClose();
                  }
                }}
              >
                {wallet.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
