import { drizzleReactHooks } from "@drizzle/react-plugin";
import { Card, CardContent, Grid, Button } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import ViewCard from "../../components/Common/ViewCard";
import TableCard from "../../components/Common/Table";
import VehicleTable from "../../components/Common/VehicleTable";
import { useHistory, useParams } from "react-router-dom";
import PageTitle from "../../components/PageTitle/PageTitle";
import {
  accidentColumns,
  ROLES_ENUM,
  servicingColumns,
  vehicleColumns,
} from "../../constants";
import VehicleRegistryService from "../../services/VehicleRegistry";
import ModalForm from "../../components/Common/ModalForm";
import { Utility } from "../../utility";

const { useDrizzle, useDrizzleState } = drizzleReactHooks;

const OwnerPage = ({ role }) => {
  const history = useHistory();
  const state = useDrizzleState((state) => state);
  const { ownerAddress } = useParams();
  console.log("ownerAddress =", ownerAddress);
  console.log("role =", role);

  // current user account
  const account = state.accounts[0];

  // owner address to query for
  const ownerAddr = ownerAddress ? ownerAddress : account;
  const { drizzle } = useDrizzle();
  const [userInfo, setUserInfo] = useState({});
  const [userVehicles, setUserVehicles] = useState([]);
  const [userAccidents, setUserAccidents] = useState([]);
  const [userServicing, setUserServicing] = useState([]);

  const retrieveOwner = async () => {
    const results = await VehicleRegistryService.retrieveOwnerDealerInfo(
      drizzle,
      ownerAddr,
    );
    console.log("results", results);
    setUserInfo(results);
  };

  const retrieveVehicles = async () => {
    const vehicles = await VehicleRegistryService.retrieveAllVehiclesOwn(
      drizzle,
      ownerAddr,
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
    <>
      <PageTitle
        title="Owner"
        backButton={
          ownerAddress ? (
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
          ) : null
        }
      />
      <Grid container direction={"column"} spacing={4}>
        <Grid item xs={12}>
          {/* Only show owner/dealer info if loggedIn user is admin or if owner is viewingg his own home page */}
          {!ownerAddress ||
          role === ROLES_ENUM.ADMINISTRATOR ||
          (ownerAddress && role === ROLES_ENUM.ADMINISTRATOR) ? (
            <Grid container spacing={4}>
              <Grid item lg={10} xs={10}>
                <ViewCard data={userInfo} title={"User Details"} />
              </Grid>
              <Grid item xs={2}>
                <Authorize />
              </Grid>
            </Grid>
          ) : null}
        </Grid>

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
    </>
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
    <Card style={{ width: "100%", minHeight: "284px", height: "100%" }}>
      <CardContent>
        <div
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            padding: "4px ​4px 14px 4px",
            borderBottom: "1px solid #e8e8e8",
            marginBottom: "12px",
          }}
        >
          Owner Functions
        </div>
        <div style={{ padding: "8px" }}>
          <div style={{ marginBottom: "12px" }}>
            You may authorize another owner to have access to your vehicle
            records
          </div>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setVisible(!visible)}
          >
            Authorize
          </Button>
        </div>

        <ModalForm
          title={"Authorize"}
          visible={visible}
          toggleVisible={() => setVisible(!visible)}
          onSubmit={authorize}
          keys={["vehicleId", "authorizedAddress"]}
        />
      </CardContent>
    </Card>
  );
};

export default OwnerPage;
