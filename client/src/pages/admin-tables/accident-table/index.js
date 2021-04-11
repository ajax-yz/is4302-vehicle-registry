import { drizzleReactHooks } from "@drizzle/react-plugin";
import { Grid } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import ViewCard from "../../../components/ViewCard";
import TableCard from "../../../components/ViewCard/table";
import {
  accidentColumns,
  servicingColumns,
  vehicleColumns,
} from "../../../constants";
import VehicleRegistryService from "../../../services/VehicleRegistry";

const { useDrizzle, useDrizzleState } = drizzleReactHooks;

const AccidentInfoPage = () => {
  const state = useDrizzleState((state) => state);
  const account = state.accounts[0];
  const VehicleID = 1; //passed when u select a vehicle
  const accidentID = 1; //this one need to loop thru all accidents
  const { drizzle } = useDrizzle();
  const [accidentInfo1, setAccidentInfo1] = useState([]);
  const [accidentInfo2, setAccidentInfo2] = useState([]);
  console.log("account accidentinfo = ", account);

  const retrieveAccidentInfo = async () => {
    const info = await VehicleRegistryService.retrieveAccidentHistory1(
      drizzle,
      VehicleID,
      accidentID,
    );
    console.log("retrieved accident records", info);
    const infoarray = Object.values(info);
    console.log("infoarray = ", infoarray);
    console.log("type of info", typeof info);
    setAccidentInfo(infoarray);
  };
  const retrieveAccidentInfo = async () => {
    const info2 = await VehicleRegistryService.retrieveAccidentHistory2(
      drizzle,
      VehicleID,
      accidentID,
    );
    console.log("retrieved accident records", info2);
    const infoarray2 = Object.values(info2);
    console.log("infoarray = ", infoarray2);
    console.log("type of info", typeof info2);
    setAccidentInfo(infoarray2);
  };

  useEffect(() => {
    retrieveAccidentInfo1();
    retrieveAccidentInfo2();
  }, []);
  return (
    <Grid container direction={"column"} spacing={5}>
      <ViewCard userData={accidentInfo} title={"Accident record Details"} />
      <TableCard
        data={accidentInfo1}
        title={"Accident Records"}
        columns={[
          "Vehicle Id",
          ...accidentColumns.accident1,
        ]}
        cardWidth={"100%"}
        hasAck={true}
        onClick={(_data) => console.log(_data)}
      />
      <TableCard
        data={accidentInfo2}
        title={"Accident Records"}
        columns={[
          "Vehicle Id",
          ...accidentColumns.accident2,
        ]}
        cardWidth={"100%"}
        hasAck={true}
        onClick={(_data) => console.log(_data)}
      />
    </Grid>
  );
};

export default AccidentInfoPage;
