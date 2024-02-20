import "./App.css";

import MintToken from "./MintToken";
import MintNFT from "./MintNFT";
import WalletConnect from "./WalletConnect";


function App() {
  return (
    <>
      <WalletConnect>
        <MintToken />
        <MintNFT />
      </WalletConnect>
    </>
  )
}


export default App