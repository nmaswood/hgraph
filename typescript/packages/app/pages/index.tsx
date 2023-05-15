import { AppBar, Box, Button, Typography } from "@mui/material";
import * as React from "react";

import { HGRAPH_PURPLE } from "../src/style/colors";

const Home: React.FC = () => {
  const [page, setPage] = React.useState<"Explore" | "Upload">("Upload");
  return (
    <Box display="flex" width="100%" height="100%" flexDirection="column">
      <Box display="flex" width="100%" height="80px">
        <AppBar
          sx={{
            background: "white",
            padding: 2,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box border={`1px solid ${HGRAPH_PURPLE}`} padding={1}>
            <Typography variant="body1" color="primary">
              HGraph
            </Typography>
          </Box>

          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              onClick={() => setPage("Explore")}
              size="small"
            >
              Explore
            </Button>
            <Button
              variant="outlined"
              onClick={() => setPage("Upload")}
              size="small"
            >
              Upload
            </Button>
          </Box>
        </AppBar>
      </Box>
      <Box
        display="flex"
        width="100%"
        height="100%"
        paddingLeft={1}
        paddingTop={1}
      >
        <Typography color="primary" variant="h4">
          {page}
        </Typography>
        <Box display="flex">
          {page === "Explore" && <Explore />}
          {page === "Upload" && <Upload />}
        </Box>
      </Box>
    </Box>
  );
};

const Upload: React.FC = () => {
  return null;
};
const Explore: React.FC = () => {
  return null;
};

export default Home;
