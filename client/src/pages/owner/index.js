import { drizzleReactHooks } from "@drizzle/react-plugin";
import { Grid } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import ViewCard from "../../components/ViewCard";
import TableCard from "../../components/ViewCard/table";
import {
  accidentColumns,
  servicingColumns,
  vehicleColumns,
} from "../../constants";
import VehicleRegistryService from "../../services/VehicleRegistry";

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
    console.log("resuls", results);
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
  return (
    <Grid container direction={"column"} spacing={4}>
      <ViewCard userData={userInfo} title={"User Details"} />
      <TableCard
        data={userVehicles}
        title={"Vehicles Data"}
        columns={[
          "vehicleId",
          ...vehicleColumns.details1,
          ...vehicleColumns.details1p2,
          ...vehicleColumns.details2,
        ]}
        cardWidth={"100%"}
        hasAck={true}
        onClick={(_data) => console.log(_data)}
      />
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

export default OwnerPage;
