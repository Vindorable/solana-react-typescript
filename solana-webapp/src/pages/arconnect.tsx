import React, { useEffect, useState } from "react";
import { Box, Button, Divider, Grid, Typography } from "@mui/material";

import ArweaveClusterSelect from "../components/arweave-wallet/arweave-cluster-select";


// ---------------------------------------------------------

const Arconnect = () => {
  const [valueConnectLabel, setConnectLabel] = useState("...");

  useEffect(() => {
    const initConnectLabel = async () => {
      // You need to wait a sec for loading wallet.
      const _sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      await _sleep(200); // 100 == 0.1 sec

      await updateConnectLabel();
    };
    initConnectLabel();
  }, []);

  const updateConnectLabel = async () => {
    try {
      const address = await window.arweaveWallet.getActiveAddress();
      setConnectLabel(address);
    } catch (e) {
      setConnectLabel("Connect ArConnect");
    }
  };

  const connectWallet = async () => {
    if (window.arweaveWallet) {
      // Permissions: https://github.com/th8ta/ArConnect#permissions
      await window.arweaveWallet.connect([
        "ACCESS_ADDRESS",
        "SIGN_TRANSACTION"
      ]);
      const address = await window.arweaveWallet.getActiveAddress();

      await updateConnectLabel();
      console.log("Connected to ArConnect =>", address);
    } else {
      console.log("Couldn't find ArConnect on your browser.");
    }
  };

  const disconnetWallet = async () => {
    await window.arweaveWallet.disconnect();

    await updateConnectLabel();
    console.log("Disconnected!");
  };

  return (
    <>
      <Box>
        <Divider textAlign="left" sx={{ mt: 2, mb: 2 }}>
          <Typography variant="body2">Select Cluster</Typography>
        </Divider>

        <Grid container>
          <Grid item xs={6}>
            <ArweaveClusterSelect />
          </Grid>
        </Grid>

        {/* ---------- */}

        <Divider textAlign="left" sx={{ mt: 2, mb: 2 }}>
          <Typography variant="body2">Connect Wallet (ArConnect)</Typography>
        </Divider>

        <Grid container>
          <Grid item xs={3}>
            <Button variant="contained" color="primary" onClick={connectWallet}>
              {valueConnectLabel}
            </Button>
          </Grid>
          <Grid item xs={3}>
            <Button variant="contained" color="primary" onClick={disconnetWallet}>
              Disconnect
            </Button>
          </Grid>
        </Grid>

        {/* ---------- */}

        <Divider textAlign="left" sx={{ mt: 2, mb: 2 }}>
          <Typography variant="body2">Change Wallet Settings</Typography>
        </Divider>

        <Grid container>
          <Grid item xs={12}>
            <Typography variant="body2">
              Change cluster on your ArConnect.
            </Typography>
            <Typography variant="caption">
              &nbsp;Start ArConnect &gt; Settings &gt; Gateway &gt; select Gateway
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}


// ---------------------------------------------------------

export default Arconnect;