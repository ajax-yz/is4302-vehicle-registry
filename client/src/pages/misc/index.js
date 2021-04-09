import React, { useState } from "react";
import {
  Grid,
  CircularProgress,
  Typography,
  Button,
  Modal,
  Tabs,
  Tab,
  TextField,
  Fade,
} from "@material-ui/core";
import VehicleRegistryService from "../../services/VehicleRegistry";
import { vehicleColumns } from "../../constants";
import ModalForm from "../../components/Modal/form";

// drizzle
import { drizzleReactHooks } from "@drizzle/react-plugin";
const { useDrizzle, useDrizzleState } = drizzleReactHooks;

const MiscPage = () => {
  return (
    <Grid container>
      <AddOwnerCard />
      <AddVehicleCom />
      <AddWorkshopCard />
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

const AddVehicleCom = () => {
  const [visible, setVisible] = useState(false);
  const { drizzle } = useDrizzle();

  const addVehicle = async (data) => {
    console.log("data =", data);
    const body1 = {};
    const body2 = {};
    const bodyKeys1 = [
      ...vehicleColumns.details1,
      ...vehicleColumns.details1p2,
    ];
    bodyKeys1.map((key) => {
      body1[key] = data[key];
    });
    vehicleColumns.details2.map((key) => {
      body2[key] = data[key];
    });
    const ownerAddress = data.ownerAddress;

    const resp = await Promise.all([
      VehicleRegistryService.registerVehicleToOwner1(
        drizzle,
        body1,
        ownerAddress,
      ),
      VehicleRegistryService.registerVehicleToOwner2(
        drizzle,
        body2,
        ownerAddress,
      ),
    ]);
    console.log("resp =", resp);
  };

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setVisible(!visible)}
      >
        Add Vehicle
      </Button>

      <ModalForm
        title={"Add Vehicle"}
        visible={visible}
        toggleVisible={() => setVisible(!visible)}
        onSubmit={addVehicle}
        keys={[
          ...vehicleColumns.details1,
          ...vehicleColumns.details1p2,
          ...vehicleColumns.details2,
          ...vehicleColumns.ownerAddress,
        ]}
      />
    </div>
  );
};

const AddWorkshopCard = () => {
  const [visible, setVisible] = useState(false);
  const { drizzle } = useDrizzle();

  const addWorkshop = async (data) => {
    console.log("data =", data);
    const body1 = {};
    const bodyKeys1 = [
      'workshopAddress',
      'workshopName',
      'workshopRegNo',
      'physicalAddress',
      'contact',
      'DOR',
    ];
    bodyKeys1.map((key) => {
      body1[key] = data[key];
    });
    // const workshopAddress = data.workshopAddress;

    const resp = await Promise.all([
      VehicleRegistryService.registerWorkshop(
        drizzle,
        body1,
      ),
    ]);
    console.log("resp =", resp);
  };

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setVisible(!visible)}
      >
        Add Workshop
      </Button>

      <ModalForm
        title={"Add Workshop"}
        visible={visible}
        toggleVisible={() => setVisible(!visible)}
        onSubmit={addWorkshop}
        keys={[
          'workshopAddress',
          'workshopName',
          'workshopRegNo',
          'physicalAddress',
          'contact',
          'DOR',
        ]}
      />
    </div>
  );
};
export default MiscPage;
