import WalletProvider from "./wallet-sdk/provider";
import { sepolia } from "wagmi/chains";
import { coinbaseWallet, ConnectionButton, metaMaskWallet } from "./wallet-sdk";

const chains = [sepolia];
const wallets = [metaMaskWallet, coinbaseWallet]
function App() {;
  return (
    <>
      <WalletProvider chains={chains} wallets={wallets}>
        <div>
          Hello World, MetaMask Wallet
        </div>
        <ConnectionButton showBalance={true} />
      </WalletProvider>
    </>
  );
}

export default App;
