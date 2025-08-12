import { useWaller } from "../provider";

interface WalletDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  //   error: Error | undefined;
}

export function WalletDetailModal({ isOpen, onClose }: WalletDetailModalProps): React.ReactNode {
  const {
    walletIcon,

    walletName,
    disconnect,
    address
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
        <div className="text-2xl font-bold flex flex-col justify-center items-center gap-2">

          <img src={walletIcon} alt={walletName} />
          <span>{walletName}</span>
          <i className="text-sm text-gray-500">{address}</i>
          <button className="border border-gray-300 rounded-md px-2 py-1 cursor-pointer" onClick={async () => {


            await disconnect();
            onClose();
          }}>Disconnect</button>
        </div>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1"></div>
      </div>
    </div>
  );
}
