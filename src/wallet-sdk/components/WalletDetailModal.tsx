import { useWaller } from "../provider";

interface WalletDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  //   error: Error | undefined;
}

export function WalletDetailModal({
  isOpen,
  onClose,
}: WalletDetailModalProps): React.ReactNode {
  const {
    walletIcon,
    chains,
    walletName,
    disconnect,
    address,
    switchChain,
    chainId,
    isConnected,
  } = useWaller();
  if (!isOpen) {
    return null;
  }
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
        {/* 在这里做一个loading的遮罩， 此遮罩可以遮住下面这个元素 */}
        {isConnected ? null : (
          <div className="absolute inset-0 bg-black opacity-50 flex justify-center items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
          </div>
        )}

        <div className="text-2xl font-bold flex flex-col justify-center items-center gap-2">
          <img
            className="w-16 h-16 rounded-full"
            src={walletIcon}
            alt={walletName}
          />
          <span>{walletName}</span>
          <div className="flex items-center justify-center gap-1">
            <span className="text-sm text-gray-500 flex flex-wrap items-center justify-center gap-1">
              {chains.map((chain) => {
                return (
                  <button
                    key={chain.id}
                    className={`border border-gray-300 rounded-md px-2 py-1 cursor-pointer text-sm hover:bg-gray-100 transition-colors duration-300 ${
                      chainId === chain.id ? "bg-gray-300" : ""
                    }`}
                    onClick={() => switchChain(chain.id)}
                  >
                    {chain.name}
                  </button>
                );
              })}
            </span>
          </div>

          <i className="text-sm text-gray-500">{address}</i>
          <button
            className="border border-gray-300 rounded-md px-2 py-1 cursor-pointer text-sm hover:bg-gray-100 transition-colors duration-300"
            onClick={async () => {
              await disconnect();
              onClose();
            }}
          >
            Disconnect
          </button>
        </div>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1"></div>
      </div>
    </div>
  );
}
