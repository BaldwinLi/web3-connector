import { useState } from "react";
import WalletProvider from "./wallet-sdk/provider";
import { ethers } from "ethers";
import { sepolia } from "wagmi/chains";

const chains = [sepolia];

function App() {
  const [count, setCount] = useState(0);
  const provider = new ethers.BrowserProvider(window.ethereum);
  return (
    <>
      <WalletProvider chains={chains} provider={provider} autoConnect={true} wallets={[]}>
        <div>
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
        </div>
      </WalletProvider>
    </>
  );
}

export default App;
