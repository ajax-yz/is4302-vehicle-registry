import { newContextComponents } from "@drizzle/react-components";
// Drizzle
import { drizzleReactHooks } from "@drizzle/react-plugin";
import { Button, Grid } from "@material-ui/core";
import React, { useEffect, useState } from "react";

// components
import ModalForm from "../../components/Common/ModalForm";
import ViewCard from "../../components/Common/ViewCard";
import RegisterButton from "../../components/Common/RegisterButton";
import PageTitle from "../../components/PageTitle/PageTitle";
import Widget from "../../components/Widget";
import { Typography } from "../../components/Wrappers";
import OwnerTable from "../../components/Admin/OwnerTable";
import AdminTable from "../../components/Admin/AdminTable";
import WorkshopTable from "../../components/Admin/WorkshopTable";

// end components

import { adminColumns, ownerColumns, vehicleColumns } from "../../constants";
import VehicleRegistryService from "../../services/VehicleRegistry";

// styles
import useStyles from "./styles";

// End of Drizzle

const { useDrizzle, useDrizzleState } = drizzleReactHooks;
const { ContractData } = newContextComponents; // AccountData, ContractData

const AdminPage = (props) => {
  const [adminList, setAdminList] = useState([]);
  // Drizzle
  const { drizzle } = useDrizzle();
  const state = useDrizzleState((state) => state);
  const account = state.accounts[0]; // End of Drizzle
  var classes = useStyles();

  const [admin, setAdmin] = useState({});
  const isRegistryOwner = true;
  const retrieveAdmmin = async () => {
    const results = await VehicleRegistryService.retrieveAdminInfo(
      drizzle,
      account,
    );
    console.log("results", results);
    setAdmin(results);
  };

  const getAllAdmins = async () => {
    const admins = await drizzle.contracts.VehicleRegistry.methods
      .admins()
      .call();
    if (admins) {
      setAdminList(admins);
    }
  };

  useEffect(() => {
    retrieveAdmmin();
    // getAllAdmins();
  }, [state.drizzleStatus.initialized]);

  const registerAdmin = (body) => {
    return VehicleRegistryService.registerAdmin(drizzle, body);
  };

  const registerOwner = (body) => {
    return VehicleRegistryService.registerOwnerDealer(drizzle, {
      ownerDealerAddress: body.ownerDealerAddress,
      name: body.name,
      contact: body.contact,
      companyRegNo: body.companyRegNo,
      physicalAddress: body.physicalAddress,
      dateOfReg: body.dateOfReg,
      isDealer: body.isDealer,
    });
  };

  console.log("adminList =", adminList);
  return (
    <>
      <PageTitle title="Admin" />
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item lg={8} sm={8} xs={12}>
              <ViewCard userData={admin} title={"User Details"} />
            </Grid>
            <Grid item lg={4} sm={4} xs={12}>
              <Widget
                title="Vehicle Functions"
                upperTitle
                className={classes.card}
                bodyClass={classes.fullHeightBody}
              >
                <Grid item xs={16}>
                  <Typography color="text" colorBrightness="secondary" noWrap>
                    Register Vehicle to Owner
                  </Typography>

                  <AddVehicleCom />
                </Grid>
              </Widget>
            </Grid>
          </Grid>
        </Grid>

        <Grid item lg={12} sm={12} xs={12}>
          <AdminTable isRegistryOwner={isRegistryOwner} />
        </Grid>
        <Grid item lg={12} sm={12} xs={12}>
          <OwnerTable />
        </Grid>

        <Grid item lg={12} sm={12} xs={12}>
          <WorkshopTable />
        </Grid>
      </Grid>
    </>
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
      "workshopAddress",
      "workshopName",
      "workshopRegNo",
      "physicalAddress",
      "contact",
      "dateOfReg",
    ];
    bodyKeys1.map((key) => {
      body1[key] = data[key];
    });
    // const workshopAddress = data.workshopAddress;

    const resp = await Promise.all([
      VehicleRegistryService.registerWorkshop(drizzle, body1),
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
          "workshopAddress",
          "workshopName",
          "workshopRegNo",
          "physicalAddress",
          "contact",
          "dateOfReg",
        ]}
      />
    </div>
  );
};

export default AdminPage;
