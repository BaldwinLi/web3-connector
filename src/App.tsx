import WalletProvider from "./wallet-sdk/provider";
import { sepolia, mainnet, optimism, arbitrum } from "wagmi/chains";
import { coinbaseWallet, ConnectionButton, metaMaskWallet } from "./wallet-sdk";

const chains = [sepolia, mainnet, optimism, arbitrum];
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
