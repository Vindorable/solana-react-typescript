import "./App.css";

import WalletConnect from "./WalletConnect";
import WalletInfo from "./WalletInfo";
import MintToken from "./MintToken";
import MintNFT from "./MintNFT";


function App() {
  return (
    <>
      <WalletConnect>
        <WalletInfo />
        <MintToken />
        <MintNFT />
      </WalletConnect>
    </>
  )
}


export default App