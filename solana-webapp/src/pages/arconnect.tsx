import React from "react";
import { Box, Divider, Grid, Typography } from "@mui/material";

import ArweaveClusterSelect from "../components/arweave-wallet/arweave-cluster-select";


// ---------------------------------------------------------

const Arconnect = () => {
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
      </Box>
    </>
  );
}


// ---------------------------------------------------------

export default Arconnect;