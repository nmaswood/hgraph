import { assertNever } from "@hgraph/precedent-iso";
import {
  AppBar,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import * as React from "react";

import { useFetchFacets } from "../src/hooks/use-get-facets";
import { useWriteCompany } from "../src/hooks/use-write-company";
import { useWriteCompanyAcquisition } from "../src/hooks/use-write-company-acquisition";
import { useWritePersonEmployment } from "../src/hooks/use-write-person-employment";
import { CypherQuery } from "../src/query";
import {
  CompanySearchWidget,
  PersonSearchWidget,
  SearchWidgetState,
  useManageWidgets,
} from "../src/search-widget-state";
import { HGRAPH_PURPLE } from "../src/style/colors";
import { toCypherQuery } from "../src/to-cypher-query";
import { toQueries } from "../src/to-queries";

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
  const { widgets, addWidget, setCompanyState, setPersonState } =
    useManageWidgets();

  const query = toCypherQuery(toQueries(widgets));

  return (
    <Box display="flex" flexDirection="column" gap={3} marginTop={2}>
      <DisplaySearchWidgets
        widgets={widgets}
        addWidget={addWidget}
        setCompanyState={setCompanyState}
        setPersonState={setPersonState}
      />
      <Box display="flex" height="100%" width="100%">
        <NetworkViz query={query} />
      </Box>
    </Box>
  );
};

const DisplaySearchWidgets: React.FC<{
  widgets: SearchWidgetState[];
  addWidget: (type: "person" | "company") => void;
  setCompanyState: (index: number, state: CompanySearchWidget) => void;
  setPersonState: (index: number, state: PersonSearchWidget) => void;
}> = ({ widgets, addWidget, setCompanyState, setPersonState }) => {
  return (
    <Paper
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        height: "100%",
        width: "100%",
      }}
    >
      <AddWidget addWidget={addWidget} />
      <DisplayWidgets
        widgets={widgets}
        setCompanyState={setCompanyState}
        setPersonState={setPersonState}
      />
    </Paper>
  );
};

const DisplayWidgets: React.FC<{
  widgets: SearchWidgetState[];
  setCompanyState: (index: number, state: CompanySearchWidget) => void;
  setPersonState: (index: number, state: PersonSearchWidget) => void;
}> = ({ widgets, setCompanyState, setPersonState }) => {
  const { data: facets } = useFetchFacets();
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {widgets.map((widget, index) => (
        <DisplayWidget
          key={index}
          widget={widget}
          index={index}
          companyIds={facets.companyIds}
          personIds={facets.personIds}
          setCompanyState={setCompanyState}
          setPersonState={setPersonState}
        />
      ))}
    </Box>
  );
};

const DisplayWidget: React.FC<{
  widget: SearchWidgetState;
  index: number;
  companyIds: string[];
  personIds: string[];
  setCompanyState: (index: number, state: CompanySearchWidget) => void;
  setPersonState: (index: number, state: PersonSearchWidget) => void;
}> = ({
  widget,
  index,
  companyIds,
  personIds,
  setPersonState,
  setCompanyState,
}) => {
  switch (widget.type) {
    case "company":
      return (
        <DisplayCompanyWidget
          widget={widget}
          index={index}
          companyIds={companyIds}
          setCompanyState={setCompanyState}
        />
      );
    case "person":
      return (
        <DisplayPersonWidget
          widget={widget}
          index={index}
          personIds={personIds}
          setPersonState={setPersonState}
        />
      );
    default:
      return assertNever(widget);
  }
};

const DisplayPersonWidget: React.FC<{
  widget: PersonSearchWidget;
  index: number;
  personIds: string[];
  setPersonState: (index: number, state: PersonSearchWidget) => void;
}> = ({ widget, index, personIds, setPersonState }) => {
  return (
    <Box display="flex">
      <Typography variant="body1">Person Query</Typography>
      <FormControl sx={{ width: "300px" }}>
        <Autocomplete
          value={widget.personId ?? null}
          options={personIds}
          sx={{ width: 300 }}
          renderInput={(params) => (
            <TextField {...(params as any)} label="Person Id" />
          )}
          onChange={(_, personId) => {
            setPersonState(index, {
              ...widget,
              personId: personId ?? undefined,
            });
          }}
        />
      </FormControl>
      <FormControl sx={{ width: "300px" }}>
        <InputLabel>Relationship</InputLabel>
        <Select
          value={widget.relationship ?? null}
          label="Relationship"
          onChange={(e) => {
            setPersonState(index, {
              ...widget,
              relationship: e.target.value ?? undefined,
            });
          }}
        >
          <MenuItem value="WORKED_AT">WORKED_AT</MenuItem>
          <MenuItem value="WORKS_AT">WORKS_AT</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

const DisplayCompanyWidget: React.FC<{
  widget: CompanySearchWidget;
  index: number;
  companyIds: string[];
  setCompanyState: (index: number, state: CompanySearchWidget) => void;
}> = ({ widget, index, companyIds, setCompanyState }) => {
  return (
    <Box display="flex" gap={3} alignItems="center">
      <Typography variant="body1">Company Query</Typography>

      <FormControl sx={{ width: "300px" }}>
        <Autocomplete
          value={widget.companyId ?? null}
          options={companyIds}
          sx={{ width: 300 }}
          renderInput={(params) => (
            <TextField {...(params as any)} label="Company Id" />
          )}
          onChange={(_, companyId) => {
            setCompanyState(index, {
              ...widget,
              companyId: companyId ?? undefined,
            });
          }}
        />
      </FormControl>
      <FormControl sx={{ width: "300px" }}>
        <InputLabel>Relationship</InputLabel>
        <Select
          value={widget.relationship ?? null}
          label="Relationship"
          onChange={(e) => {
            setCompanyState(index, {
              ...widget,
              relationship: e.target.value ?? undefined,
            });
          }}
        >
          <MenuItem value="ACQUIRED">ACQUIRED</MenuItem>
          <MenuItem value="MERGED_INTO">MERGED_INTO</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

const AddWidget: React.FC<{
  addWidget: (type: "company" | "person") => void;
}> = ({ addWidget }) => {
  const [type, setType] = React.useState<"company" | "person">("company");
  return (
    <Box display="flex" width="250px" gap={2} flexDirection="column">
      <FormControl fullWidth>
        <InputLabel>Query type</InputLabel>
        <Select
          value={type}
          label="Add query"
          onChange={(e) => setType(e.target.value as "company" | "person")}
        >
          <MenuItem value={"company"}>Company query</MenuItem>
          <MenuItem value={"person"}>Person query</MenuItem>
        </Select>
      </FormControl>
      <Button variant="contained" onClick={() => addWidget(type)}>
        Add new query widget
      </Button>
    </Box>
  );
};

const NetworkViz: React.FC<{ query: CypherQuery }> = ({ query }) => {
  React.useEffect(() => {
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
        initialCypher: query,
      });
      neoViz.render();
    };
    init();
  }, [query]);

  return <Box id="#neo4jd3" display="flex" width="100%" height="900px"></Box>;
};

export default Home;
