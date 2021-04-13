import { drizzleReactHooks } from "@drizzle/react-plugin";
import { Card, CardContent, Grid, Button } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import ViewCard from "../../components/Common/ViewCard";
import TableCard from "../../components/Common/Table";
import VehicleTable from "../../components/Common/VehicleTable";
import { useHistory, useParams } from "react-router-dom";
import {
  accidentColumns,
  ROLES_ENUM,
  servicingColumns,
  vehicleColumns,
} from "../../constants";
import VehicleRegistryService from "../../services/VehicleRegistry";
import ModalForm from "../../components/Common/ModalForm";
import { Utility } from "../../utility";
import PageTitle from "../../components/PageTitle/PageTitle";
const { useDrizzle, useDrizzleState } = drizzleReactHooks;

const VehiclePage = ({ role }) => {
  const history = useHistory();
  const state = useDrizzleState((state) => state);
  const { vehicleId } = useParams();

  // current user account
  const account = state.accounts[0];

  const { drizzle } = useDrizzle();
  const [vehicleInfo, setVehicleInfo] = useState({});
  const [vehicleAccidents, setVehicleAccidents] = useState([]);
  const [vehicleServicing, setVehicleServicing] = useState([]);
  const [extraData, setExtraData] = useState({});

  const retrieveVehicle = async () => {
    const results = await VehicleRegistryService.retrieveOneVehicleDetails(
      drizzle,
      vehicleId,
    );
    setVehicleInfo(results);
  };

  const retrieveExtraData = async () => {
    const numTransfers = await VehicleRegistryService.retrieveNoOfTransfers(
      drizzle,
      vehicleId,
    );
    const numServiceRecords = await VehicleRegistryService.retrieveNoOfServicingRecords(
      drizzle,
      vehicleId,
    );
    const numAccidentRecords = await VehicleRegistryService.retrieveNoOfAccidentRecords(
      drizzle,
      vehicleId,
    );
    setExtraData({
      ["Number of Transfers"]: numTransfers,
      ["Number of Service Records"]: numServiceRecords,
      ["Number of Accident Records"]: numAccidentRecords,
    });
  };

  const retrieveAccidents = async () => {
    const accidents = await VehicleRegistryService.retrieveOneVehicleAccidentRecords(
      drizzle,
      vehicleId,
    );
    setVehicleAccidents(accidents);
  };

  const retrieveServicing = async () => {
    const servicing = await VehicleRegistryService.retrieveOneVehicleServicingRecords(
      drizzle,
      vehicleId,
    );
    setVehicleServicing(servicing);
  };

  useEffect(() => {
    retrieveVehicle();
    retrieveAccidents();
    retrieveServicing();
    retrieveExtraData();
  }, []);

  return (
    <>
      <PageTitle
        title="Vehicle Data"
        backButton={
          <div>
            <Button
              variant="contained"
              size="small"
              color="primary"
              style={{ marginRight: "12px" }}
              onClick={() => history.goBack()}
            >
              Back
            </Button>
          </div>
        }
      />
      <Grid container direction={"column"} spacing={4}>
        {role === ROLES_ENUM.ADMINISTRATOR || role === ROLES_ENUM.OWNER ? (
          <Grid item lg={12} xs={12}>
            <ViewCard data={vehicleInfo} title={"Vehicle Details"} />
          </Grid>
        ) : null}

        <ViewCard data={extraData} title={"Additional Information"} />

        <TableCard
          data={vehicleAccidents}
          title={"Accident Records"}
          columns={[
            "vehicleId",
            ...accidentColumns.accident1,
            ...accidentColumns.accident2,
          ]}
          cardWidth={"100%"}
        />

        <TableCard
          data={vehicleServicing}
          title={"Servicing Records"}
          columns={[
            "vehicleId",
            ...servicingColumns.history1,
            ...servicingColumns.history2,
          ]}
          cardWidth={"100%"}
        />
      </Grid>
    </>
  );
};
export default VehiclePage;
