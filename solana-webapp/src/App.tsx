//import "./App.css";

import WalletConnect from "./WalletConnect";
import WalletInfo from "./WalletInfo";
import MintToken from "./MintToken";
import MintNFT from "./MintNFT";
import MintToken2 from "./MintToken2";

import Arconnect from "./pages/arconnect";
import ArweaveClusterContextProvider from "./providers/arweave-cluster";


function App() {
  return (
    <>
      <WalletConnect>
        <WalletInfo />
        <MintToken />
        <MintNFT />
        <MintToken2 />
      </WalletConnect>
      <ArweaveClusterContextProvider>
        <Arconnect />
      </ArweaveClusterContextProvider>
    </>
  )
}


export default App