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
      <AddAdminCard />
    </Grid>
  );
};
const AddOwnerCard = () => {
  const { drizzle } = useDrizzle();
  const [ownerDealerAddress, setOwnerAddress] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [companyRegNo, setCompanyRegNo] = useState("");
  const [physicalAddress, setPhysicalAddress] = useState("");
  const [dateOfReg, setDOR] = useState("");

  const submit = async () => {
    const response = await VehicleRegistryService.registerOwnerDealer(drizzle, {
      ownerDealerAddress,
      name,
      contact,
      companyRegNo,
      physicalAddress,
      dateOfReg,
      isDealer: false, 
    });
    console.log(response);
    const testfn = await VehicleRegistryService.retrieveOwnerDealerInfo(drizzle, ownerDealerAddress);
    console.log(testfn);
    const testupdate = await VehicleRegistryService.updateOwnerDealerInfo(drizzle, {
      ownerDealerAddress,
      name,
      contact,
      companyRegNo:"ep23",
      physicalAddress,
      dateOfReg,
      isDealer: false, 
    });
    console.log(testupdate);
  };
  const remove = async() => {
    const testrem = await VehicleRegistryService.removeAdmin(drizzle, 
      "0x08591F9105C01C5940DCBC33f3279a7EBa1F2676");
      console.log("rem admin",testrem);
  }

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
      <Button onClick={() => remove()}>Remove</Button>
      <Grid container>
        registerOwnerDealer
        <TextField
          id="name"
          value={ownerDealerAddress}
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
        <TextField
          id="name"
          value={dateOfReg}
          onChange={(e) => setDOR(e.target.value)}
          margin="normal"
          placeholder="Date of Reg"
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
      'dateOfReg',
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
          'dateOfReg',
        ]}
      />
    </div>
  );
};
const AddAdminCard = () => {
  const [visible, setVisible] = useState(false);
  const { drizzle } = useDrizzle();

  const addAdmin = async (data) => {
    console.log("data =", data);
    const body1 = {};
    const bodyKeys1 = [
      'adminAddress',
      'adminName',
      'dateJoined',
      'contact',
    ];
    bodyKeys1.map((key) => {
      body1[key] = data[key];
    });
    // const workshopAddress = data.workshopAddress;

    const resp = await Promise.all([
      VehicleRegistryService.registerAdmin(
        drizzle,
        body1,
      ),
    ]);
    console.log("resp =", resp);
    const testretad = await VehicleRegistryService.retrieveAdminInfo(drizzle, body1['adminAddress']);
    console.log(testretad);
    const testadupdate = await VehicleRegistryService.updateAdminInfo(drizzle, {
      adminAddress: body1['adminAddress'],
      adminName: body1['adminName'],
      dateJoined: body1['dateJoined'],
      contact: 239,
    });
    console.log(testadupdate);
  };

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setVisible(!visible)}
      >
        Add Admin
      </Button>

      <ModalForm
        title={"Add Admin"}
        visible={visible}
        toggleVisible={() => setVisible(!visible)}
        onSubmit={addAdmin}
        keys={[
          'adminAddress',
          'adminName',
          'dateJoined',
          'contact',
        ]}
      />
    </div>
  );
};
export default MiscPage;
