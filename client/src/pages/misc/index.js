import React, { useState } from "react";
import {
  Grid,
  CircularProgress,
  Typography,
  Button,
  Tabs,
  Tab,
  TextField,
  Fade,
} from "@material-ui/core";
import VehicleRegistryService from "../../services/VehicleRegistry";

// drizzle
import { drizzleReactHooks } from "@drizzle/react-plugin";
const { useDrizzle, useDrizzleState } = drizzleReactHooks;

const MiscPage = () => {
  return (
    <Grid container>
      <AddOwnerCard />
    </Grid>
  );
};
const AddOwnerCard = () => {
  const { drizzle } = useDrizzle();
  const [ownerAddress, setOwnerAddress] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [companyRegNo, setCompanyRegNo] = useState("");
  const [physicalAddress, setPhysicalAddress] = useState("");
  const submit = async () => {
    const response = await VehicleRegistryService.registerOwnerDealer(drizzle, {
      ownerAddress,
      name,
      contact,
      companyRegNo,
      physicalAddress,
    });
  };

  // address = 0x58Ff09a4aFBf3cDD9791Bc603F4630D2c3fb3857
  return (
    <Grid
      container
      style={{
        backgroundColor: "white",
        border: "1px solid #e8e8e8",
        padding: "24px",
      }}
    >
      <Grid container>
        registerOwnerDealer
        <TextField
          id="name"
          value={ownerAddress}
          onChange={(e) => setOwnerAddress(e.target.value)}
          margin="normal"
          placeholder="Owner/Dealer address"
          type="text"
          fullWidth
        />
        <TextField
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
          placeholder="Name"
          type="text"
          fullWidth
        />
        <TextField
          id="name"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          margin="normal"
          placeholder="Contact No."
          type="text"
          fullWidth
        />
        <TextField
          id="name"
          value={companyRegNo}
          onChange={(e) => setCompanyRegNo(e.target.value)}
          margin="normal"
          placeholder="Company Register Number"
          type="text"
          fullWidth
        />
        <TextField
          id="name"
          value={physicalAddress}
          onChange={(e) => setPhysicalAddress(e.target.value)}
          margin="normal"
          placeholder="Physical Address"
          type="text"
          fullWidth
        />
        <Button onClick={() => submit()}>Submit</Button>
      </Grid>
    </Grid>
  );
};

export default MiscPage;
