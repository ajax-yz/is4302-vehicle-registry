import { drizzleReactHooks } from "@drizzle/react-plugin";
import { Grid, Button } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import ViewCard from "../../components/Common/ViewCard";
import TableCard from "../../components/Common/Table";
import VehicleTable from "../../components/Common/VehicleTable";

import {
  accidentColumns,
  servicingColumns,
  vehicleColumns,
} from "../../constants";
import VehicleRegistryService from "../../services/VehicleRegistry";
import ModalForm from "../../components/Common/ModalForm";

const { useDrizzle, useDrizzleState } = drizzleReactHooks;

const OwnerPage = () => {
  const state = useDrizzleState((state) => state);
  const account = state.accounts[0];
  const { drizzle } = useDrizzle();
  const [userInfo, setUserInfo] = useState({});
  const [userVehicles, setUserVehicles] = useState([]);
  const [userAccidents, setUserAccidents] = useState([]);
  const [userServicing, setUserServicing] = useState([]);

  const retrieveOwner = async () => {
    const results = await VehicleRegistryService.retrieveOwnerDealerInfo(
      drizzle,
      account,
    );
    console.log("results", results);
    setUserInfo(results);
  };

  const retrieveVehicles = async () => {
    const vehicles = await VehicleRegistryService.retrieveAllVehiclesOwn(
      drizzle,
      account,
    );
    setUserVehicles(vehicles);
    console.log("vehicles =", vehicles);
  };

  const retrieveAccidents = async () => {
    const accidents = await VehicleRegistryService.retrieveAllAccidentHistory(
      drizzle,
      account,
    );
    setUserAccidents(accidents);
  };

  const retrieveServicing = async () => {
    const servicing = await VehicleRegistryService.retrieveAllServicingHistory(
      drizzle,
      account,
    );
    setUserServicing(servicing);
  };
  useEffect(() => {
    retrieveOwner();
    retrieveVehicles();
    retrieveAccidents();
    retrieveServicing();
  }, []);
  const remove = async () => {
    const testremauth = await VehicleRegistryService.removeAuthorization(
      drizzle,
      {
        vehicleId: 1,
        authorizedAddress: "0x08591F9105C01C5940DCBC33f3279a7EBa1F2676",
      },
    );
    console.log("rem auth", testremauth);
  };
  return (
    <Grid container direction={"column"} spacing={4}>
      <Authorize />
      <Button onClick={() => remove()}>Remove</Button>
      <ViewCard userData={userInfo} title={"User Details"} />
      <VehicleTable userVehicles={userVehicles} />
      <TableCard
        data={userAccidents}
        title={"Accident Records"}
        columns={[
          "vehicleId",
          ...accidentColumns.accident1,
          ...accidentColumns.accident2,
        ]}
        cardWidth={"100%"}
      />

      <TableCard
        data={userServicing}
        title={"Servicing Records"}
        columns={[
          "vehicleId",
          ...servicingColumns.history1,
          ...servicingColumns.history2,
        ]}
        cardWidth={"100%"}
      />
    </Grid>
  );
};
const Authorize = () => {
  const [visible, setVisible] = useState(false);
  const { drizzle } = useDrizzle();

  const authorize = async (data) => {
    console.log("data =", data);
    const body1 = {};
    const bodyKeys1 = ["vehicleId", "authorizedAddress"];
    bodyKeys1.map((key) => {
      body1[key] = data[key];
    });
    // const workshopAddress = data.workshopAddress;

    const resp = await Promise.all([
      VehicleRegistryService.authorizeAccess(drizzle, body1),
    ]);
    console.log("resp =", resp);
    const testauth = await VehicleRegistryService.retrieveAuthorizedAddresses(
      drizzle,
      body1["vehicleId"],
    );
    console.log(testauth);
  };

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setVisible(!visible)}
      >
        Authorize
      </Button>

      <ModalForm
        title={"Authorize"}
        visible={visible}
        toggleVisible={() => setVisible(!visible)}
        onSubmit={authorize}
        keys={["vehicleId", "authorizedAddress"]}
      />
    </div>
  );
};

export default OwnerPage;
