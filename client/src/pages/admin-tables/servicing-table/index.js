import { drizzleReactHooks } from "@drizzle/react-plugin";
import { Grid } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import ViewCard from "../../../components/ViewCard";
import TableCard from "../../../components/ViewCard/table";
import { servicingColumns, vehicleColumns } from "../../../constants";
import VehicleRegistryService from "../../../services/VehicleRegistry";

const { useDrizzle, useDrizzleState } = drizzleReactHooks;

const ServicingInfoPage = () => {
  const state = useDrizzleState((state) => state);
  const account = state.accounts[0];
  const VehicleID = 1; //passed when u select a vehicle
  const servicingID = 1; //this one need to loop thru all servicings
  const { drizzle } = useDrizzle();
  // const [servicingInfo1, setservicingInfo1] = useState([]);
  // const [servicingInfo2, setservicingInfo2] = useState([]);
  // console.log("account servicinginfo = ", account);

  const retrieveServicingInfo1 = async () => {
    const info = await VehicleRegistryService.retrieveServicingHistory1(
      drizzle,
      VehicleID,
      servicingID,
    );
    // console.log("retrieved servicing records", info);
    const infoarray = Object.values(info);
    // console.log("infoarray = ", infoarray);
    // console.log("type of info", typeof info);
    // setservicingInfo1(infoarray);
  };

  const retrieveServicingInfo2 = async () => {
    const info2 = await VehicleRegistryService.retrieveServicingHistory2(
      drizzle,
      VehicleID,
      servicingID,
    );
    // console.log("retrieved servicing records", info2);
    const infoarray2 = Object.values(info2);
    // console.log("infoarray = ", infoarray2);
    // console.log("type of info", typeof info2);
    // setservicingInfo2(infoarray2);
  };

  useEffect(() => {
    retrieveServicingInfo1();
    retrieveServicingInfo2();
  }, []);
  return (
    <Grid container direction={"column"} spacing={5}>
      {/* <ViewCard data={servicingInfo1} title={"servicing record Details"} /> */}
      {/* <TableCard
        data={servicingInfo1}
        title={"servicing Records 1"}
        columns={[
          "Vehicle Id",
          ...servicingColumns.history1,
        ]}
        cardWidth={"100%"}
        hasAck={true}
        // onClick={(_data) => console.log(_data)}
      />
      <TableCard
        data={servicingInfo2}
        title={"servicing Records 2"}
        columns={[
          "Vehicle Id",
          ...servicingColumns.history2,
        ]}
        cardWidth={"100%"}
        hasAck={true}
        // onClick={(_data) => console.log(_data)}
      /> */}
    </Grid>
  );
};

export default ServicingInfoPage;
