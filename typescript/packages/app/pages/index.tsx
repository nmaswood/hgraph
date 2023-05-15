import {
  AppBar,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  InputLabel,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import * as React from "react";

import { useWriteCompany } from "../src/hooks/use-write-company";
import { useWriteCompanyAcquisition } from "../src/hooks/use-write-company-acquisition";
import { useWritePersonEmployment } from "../src/hooks/use-write-person-employment";
import { HGRAPH_PURPLE } from "../src/style/colors";

const Home: React.FC = () => {
  const [page, setPage] = React.useState<"Explore" | "Upload">("Explore");
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
        flexDirection="column"
        gap={3}
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
  return (
    <Box
      display="flex"
      gap={3}
      justifyContent="center"
      alignContent="center"
      width="100%"
      height="100%"
    >
      <AddCompany />
      <AddCompanyAcquisition />
      <AddPersonEmployment />
    </Box>
  );
};

const AddCompany: React.FC = () => {
  const [companyId, setCompanyId] = React.useState<number>(0);
  const [companyName, setCompanyName] = React.useState<string>("");
  const [headcount, setHeadcount] = React.useState<number>(0);

  const { trigger } = useWriteCompany();

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={1}
      justifyContent="space-between"
      height="100%"
    >
      <Typography variant="h6">Add Company</Typography>
      <Box display="flex" flexDirection="column" gap={1}>
        <TextField
          type="number"
          label="Company ID"
          value={companyId}
          onChange={(e) => setCompanyId(parseInt(e.target.value))}
        />

        <TextField
          type="text"
          label="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />

        <TextField
          type="number"
          label="Head Count"
          InputProps={{ inputProps: { min: 0, max: 8_000_000_000 } }}
          value={headcount}
          onChange={(e) => setHeadcount(parseInt(e.target.value))}
        />
      </Box>
      <Button
        variant="contained"
        onClick={async () => {
          await trigger({
            companyId,
            companyName,
            headcount,
          });
        }}
      >
        Add Company
      </Button>
    </Box>
  );
};

const AddCompanyAcquisition: React.FC = () => {
  const [parentCompanyId, setParentCompanyId] = React.useState<number>(0);
  const [acquiredCompanyId, setAcquiredCompanyId] = React.useState<number>(0);
  const [mergedIntoParentCompany, setMergedIntoParentCompany] =
    React.useState<boolean>(false);

  const { trigger } = useWriteCompanyAcquisition();
  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={1}
      height="100%"
      justifyContent="space-between"
    >
      <Typography variant="h6">Add Company Acquisition</Typography>
      <Box display="flex" flexDirection="column" gap={1}>
        <TextField
          type="number"
          label="Parent Company ID"
          InputProps={{ inputProps: { min: 0, max: 8_000_000_000 } }}
          value={parentCompanyId}
          onChange={(e) => setParentCompanyId(parseInt(e.target.value))}
        />

        <TextField
          type="number"
          InputProps={{ inputProps: { min: 0, max: 8_000_000_000 } }}
          label="Acquired Company ID"
          value={acquiredCompanyId}
          onChange={(e) => setAcquiredCompanyId(parseInt(e.target.value))}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={mergedIntoParentCompany}
              onChange={(e) => setMergedIntoParentCompany(e.target.checked)}
              color="primary"
            />
          }
          label="Merged Into Parent Company"
        />
      </Box>
      <Button
        onClick={async () => {
          await trigger({
            parentCompanyId,
            acquiredCompanyId,
            mergedIntoParentCompany,
          });
        }}
        variant="contained"
      >
        Add Company Acquisition
      </Button>
    </Box>
  );
};

const AddPersonEmployment: React.FC = () => {
  const [companyId, setCompanyId] = React.useState<number>(0);
  const [personId, setPersonId] = React.useState<number>(0);
  const [employmentTitle, setEmploymentTitle] = React.useState<string>("");
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);

  const { trigger } = useWritePersonEmployment();

  const [open, setOpen] = React.useState(false);

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={1}
      height="100%"
      justifyContent="space-between"
    >
      <Typography variant="h6">Add Person Employment</Typography>
      <Box display="flex" flexDirection="column" gap={1}>
        <TextField
          type="number"
          label="Company ID"
          value={companyId}
          onChange={(e) => setCompanyId(parseInt(e.target.value))}
        />

        <TextField
          type="number"
          label="Person ID"
          value={personId}
          onChange={(e) => setPersonId(parseInt(e.target.value))}
        />

        <TextField
          type="text"
          label="Employment Title"
          value={employmentTitle}
          onChange={(e) => setEmploymentTitle(e.target.value)}
        />
        <Box display="flex" justifyContent="space-between">
          <InputLabel>Start Date:</InputLabel>
          <input
            type="date"
            value={startDate ? startDate.toISOString().slice(0, 10) : ""}
            onChange={(e) => setStartDate(new Date(e.target.value))}
          />
        </Box>

        <Box display="flex" justifyContent="space-between">
          <InputLabel>End Date:</InputLabel>
          <input
            type="date"
            value={endDate ? endDate.toISOString().slice(0, 10) : ""}
            onChange={(e) => setEndDate(new Date(e.target.value))}
          />
        </Box>
      </Box>

      <Button
        onClick={async () => {
          await trigger({
            companyId,
            personId,
            employmentTitle,
            startDate: startDate ? startDate.toISOString() : undefined,
            endDate: endDate ? endDate.toISOString() : undefined,
          });
        }}
        variant="contained"
      >
        Add Person Employment
      </Button>
      <Snackbar
        open={open}
        autoHideDuration={3_000}
        onClose={() => setOpen(false)}
        message="It worked!"
      />
    </Box>
  );
};

const Explore: React.FC = () => {
  return <Viz />;
};

const Viz: React.FC = () => {
  React.useLayoutEffect(() => {
    const init = async () => {
      const { NeoVis } = await import("neovis.js");

      const neoViz = new NeoVis({
        containerId: "#neo4jd3",

        visConfig: {
          edges: {
            arrows: {
              to: { enabled: true },
            },
          },
        },
        neo4j: {
          serverUrl: "bolt://localhost:7687",
          serverUser: "neo4j",
          serverPassword: "password",
        },
        labels: {
          Person: {
            label: "employmentTitle",
          },
          Company: {
            label: "name",
          },
        },
        relationships: {
          ACQUIRED: {
            label: "label",
          },
          WORKED_AT: {
            label: "label",
          },
          WORKS_AT: {
            label: "label",
          },
          MERGED_INTO: {
            label: "label",
          },
        },

        initialCypher: `
        MATCH (n)
OPTIONAL MATCH (n)-[r]-()
RETURN n, r
        `,
      });
      neoViz.render();
    };
    init();
  }, []);

  return <Box id="#neo4jd3" display="flex" width="100%" height="900px"></Box>;
};

export default Home;
