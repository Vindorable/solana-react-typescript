import React, { useContext, useEffect, useState } from "react";
import { Box, Button, Divider, Grid, Typography } from "@mui/material";

import ArweaveClusterSelect from "../components/arweave-wallet/arweave-cluster-select";
import { ArweaveClusterContext } from '../providers/arweave-cluster';


// ---------------------------------------------------------

const Arconnect = () => {
  const { arweave, changeArweaveCluster } = useContext(ArweaveClusterContext);
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

  const getBalance = async () => {
    const address = await window.arweaveWallet.getActiveAddress();
    const balance = await arweave.wallets.getBalance(address);
    const ar = arweave.ar.winstonToAr(balance);

    console.log(balance, "Winston");
    console.log(ar, "AR");
  };

  const airdrop = async () => {
    const address = await window.arweaveWallet.getActiveAddress();
    // 100 AR = 100000000000000 Winston
    const response = await arweave.api.get("mint/" + address + "/100000000000000");
    console.log(response);
  };

  // Ellipsis for MUI Button.
  const ellipsisButtonSX = {
    width: "100%",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textAlign: "center",
    display: "block",
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

        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Button variant="contained" color="primary" onClick={connectWallet} sx={ellipsisButtonSX}>
              {valueConnectLabel}
            </Button>
          </Grid>
          <Grid item xs={3}>
            <Button variant="contained" color="primary" onClick={disconnetWallet} sx={ellipsisButtonSX}>
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

        {/* ---------- */}

        <Divider textAlign="left" sx={{ mt: 2, mb: 2 }}>
          <Typography variant="body2">Other Functions</Typography>
        </Divider>

        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Button variant="contained" color="primary" onClick={getBalance}>
              Get Balance
            </Button>
          </Grid>
          <Grid item xs={3}>
            <Button variant="contained" color="primary" onClick={airdrop}>
              Airdrop
            </Button>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}


// ---------------------------------------------------------

export default Arconnect;