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

import {
  accidentColumns,
  defaultAccidentValues,
  adminColumns,
  ownerColumns,
  servicingColumns,
  vehicleColumns,
  defaultVehicleValues,
} from "../../constants";
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
  const [isRegistryOwner, setIsRegistryOwner] = useState(false);
  const checkIsRegistryOwner = async () => {
    const ownerAddress = await drizzle.contracts.VehicleRegistry.methods
      .vehicleRegistryOwner()
      .call();
    if (ownerAddress === account) {
      setIsRegistryOwner(true);
    }
  };
  const retrieveAdmin = async () => {
    const results = await VehicleRegistryService.retrieveAdminInfo(
      drizzle,
      account,
    );
    // console.log("results", results);
    setAdmin(results);
  };

  const getAllAdmins = async () => {
    if (isRegistryOwner) {
      const admins = await drizzle.contracts.VehicleRegistry.methods
        .getAllActiveAdmins()
        .call();
      if (admins) {
        setAdminList(admins);
      }
    }
  };

  useEffect(() => {
    retrieveAdmin();
    checkIsRegistryOwner().then(() => {
      getAllAdmins();
    });

    // getAllAdmins();
  }, [state.drizzleStatus.initialized]);

  const addAccidentRecord = (body) => {
    return VehicleRegistryService.addAccidentRecord(drizzle, {
      vehicleId: body.vehicleId,
      accidentDateLocation: body.accidentDateLocation,
      driverName: body.driverName,
      timeOfAccident: body.timeOfAccident,
      descriptionOfAccident: body.descriptionOfAccident,
    });
  };

  const updateVehCOEReg = (data) => {
    return VehicleRegistryService.updateVehCOEReg(drizzle, data);
  };

  const updateVehLicensePlate = (data) => {
    return VehicleRegistryService.updateVehLicensePlate(drizzle, data);
  };

  // console.log("adminList =", adminList);
  return (
    <>
      <PageTitle title="Admin" />
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item lg={8} sm={8} xs={12}>
              <ViewCard data={admin} title={"User Details"} />
            </Grid>
            <Grid item lg={4} sm={4} xs={12}>
              <Widget
                title="Admin Functions"
                upperTitle
                className={classes.card}
                bodyClass={classes.fullHeightBody}
              >
                <Grid item xs={12}>
                  <Typography color="text" colorBrightness="secondary" noWrap>
                    Register Vehicle to Owner
                  </Typography>

                  <AddVehicleCom />
                </Grid>

                <Grid item xs={12}>
                  <Typography color="text" colorBrightness="secondary" noWrap>
                    Add Accident Record
                  </Typography>

                  <RegisterButton
                    submitRegister={addAccidentRecord}
                    registerText={"Add Accident Record"}
                    keys={[
                      "vehicleId",
                      ...accidentColumns.accident1,
                      ...accidentColumns.accident2,
                    ]}
                    defaultValues={["", ...defaultAccidentValues]}
                  />
                </Grid>

                <Grid item xs={12}>
                  <div>Vehicle Functions</div>
                  <div style={{ display: "flex" }}>
                    <div style={{ marginRight: "8px" }}>
                      <RegisterButton
                        submitRegister={updateVehCOEReg}
                        registerText={"Update Vehicle COE"}
                        keys={["vehicleId", "effectiveRegDate", "quotaPrem"]}
                        defaultValues={["", "10-04-2021", 40000]}
                      />
                    </div>
                    <RegisterButton
                      submitRegister={updateVehLicensePlate}
                      registerText={"Update License Plate"}
                      keys={["vehicleId", "newLicensePlate"]}
                      defaultValues={["", "SR2110J"]}
                    />
                  </div>
                </Grid>
              </Widget>
            </Grid>
          </Grid>
        </Grid>

        {isRegistryOwner ? (
          <Grid item lg={12} sm={12} xs={12}>
            <AdminTable isRegistryOwner={isRegistryOwner} />
          </Grid>
        ) : null}
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

  const _addVehicle = async (data) => {
    console.log("data =", data);
    return await Promise.all([
      VehicleRegistryService.registerVehicleToOwner1(
        drizzle,
        data,
        data.ownerAddress,
      ),
      VehicleRegistryService.registerVehicleToOwner2(
        drizzle,
        data,
        data.ownerAddress,
      ),
    ]);
  };
  const addVehicle = async (data) => {
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

    return resp;
  };

  const deregisterVehicle = (data) => {
    return VehicleRegistryService.deregisterVehicle(drizzle, data);
  };

  return (
    <div style={{ display: "flex" }}>
      <div style={{ marginRight: "8px" }}>
        <RegisterButton
          submitRegister={_addVehicle}
          registerText={"Add Vehicle"}
          keys={[
            ...vehicleColumns.details1,
            ...vehicleColumns.details1p2,
            ...vehicleColumns.details2,
            ...vehicleColumns.ownerAddress,
          ]}
          defaultValues={defaultVehicleValues}
        />
      </div>
      <RegisterButton
        submitRegister={deregisterVehicle}
        registerText={"Deregister Vehicle"}
        keys={["vehicleId", "ownerDealerAddress"]}
      />
    </div>
  );
};

const AddWorkshopCard = () => {
  const [visible, setVisible] = useState(false);
  const { drizzle } = useDrizzle();

  const addWorkshop = async (data) => {
    // console.log("data =", data);
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
    // console.log("resp =", resp);
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
