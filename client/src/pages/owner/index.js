import { drizzleReactHooks } from "@drizzle/react-plugin";
import { Card, CardContent, Grid, Button } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import ViewCard from "../../components/Common/ViewCard";
import TableCard from "../../components/Common/Table";
import VehicleTable from "../../components/Common/VehicleTable";
import { useHistory, useParams } from "react-router-dom";
import PageTitle from "../../components/PageTitle/PageTitle";
import RegisterButton from "../../components/Common/RegisterButton";
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
    setUserInfo(results);
  };

  const retrieveVehicles = async () => {
    const vehicles = await VehicleRegistryService.retrieveAllVehiclesOwn(
      drizzle,
      ownerAddr,
    );
    setUserVehicles(vehicles);
  };

  const retrieveAccidents = async () => {
    const accidents = await VehicleRegistryService.retrieveAllAccidentHistory(
      drizzle,
      ownerAddr,
    );
    setUserAccidents(accidents);
  };

  const retrieveServicing = async () => {
    const servicing = await VehicleRegistryService.retrieveAllServicingHistory(
      drizzle,
      ownerAddr,
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
        <Grid item xs={12} style={{ maxHeight: "457px" }}>
          {/* Only show owner/dealer info if loggedIn user is admin or if owner is viewingg his own home page */}
          {!ownerAddress ||
          role === ROLES_ENUM.ADMINISTRATOR ||
          (ownerAddress && role === ROLES_ENUM.ADMINISTRATOR) ? (
            <Grid container spacing={4} style={{ height: "100%" }}>
              <Grid item lg={8} xs={8} style={{ height: "100%" }}>
                <ViewCard data={userInfo} title={"User Details"} />
              </Grid>
              {role === ROLES_ENUM.OWNER || role === ROLES_ENUM.DEALER ? (
                <Grid item xs={4}>
                  <Card
                    style={{
                      width: "100%",
                      minHeight: "284px",
                      height: "100%",
                    }}
                  >
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
                      <Authorize />
                      <TransferVehicle />
                    </CardContent>
                  </Card>
                </Grid>
              ) : null}
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
    const body1 = {};
    const bodyKeys1 = ["vehicleId", "authorizedAddress"];
    bodyKeys1.map((key) => {
      body1[key] = data[key];
    });
    // const workshopAddress = data.workshopAddress;

    const resp = await Promise.all([
      VehicleRegistryService.authorizeAccess(drizzle, body1),
    ]);
    const testauth = await VehicleRegistryService.retrieveAuthorizedAddresses(
      drizzle,
      body1["vehicleId"],
    );
  };

  const removeAuthorization = (data) => {
    return VehicleRegistryService.removeAuthorization(drizzle, data);
  };

  return (
    <>
      <div style={{ padding: "8px" }}>
        <div style={{ marginBottom: "12px" }}>
          You may authorize or unauthorize another owner to have access to your
          vehicle records
        </div>
        <div style={{ display: "flex" }}>
          <div style={{ marginRight: "8px" }}>
            <RegisterButton
              submitRegister={authorize}
              registerText={"Authorize"}
              keys={["vehicleId", "authorizedAddress"]}
            />
          </div>

          <RegisterButton
            submitRegister={removeAuthorization}
            registerText={"Remove Authorization"}
            keys={["vehicleId", "authorizedAddress"]}
          />
        </div>
        {/* <Button
          variant="contained"
          color="primary"
          onClick={() => setVisible(!visible)}
        >
          Authorize
        </Button> */}
      </div>

      <ModalForm
        title={"Authorize"}
        visible={visible}
        toggleVisible={() => setVisible(!visible)}
        onSubmit={authorize}
        keys={["vehicleId", "authorizedAddress"]}
      />
    </>
  );
};

const TransferVehicle = () => {
  const [visible, setVisible] = useState(false);
  const { drizzle } = useDrizzle();

  const transfer = async (data) => {
    const resp = await VehicleRegistryService.transferVehicle(drizzle, data);
    if (resp) {
      setVisible(false);
    }
  };

  const _transfer = async (data) => {
    return VehicleRegistryService.transferVehicle(drizzle, data);
  };

  return (
    <>
      <div style={{ padding: "8px" }}>
        <div style={{ marginBottom: "12px" }}>
          You may transfer your vehicle ownership to another owner registered on
          our network
        </div>
        <RegisterButton
          submitRegister={_transfer}
          registerText={"Transfer Vehicle"}
          defaultValues={[
            "",
            "",
            "Owner2",
            92213211,
            "Block 821",
            "12-04-2021",
          ]}
          keys={[
            "vehicleId",
            "newOwnerAddress",
            "newOwnerName",
            "newOwnerContact",
            "newOwnerPhysicalAddress",
            "newOwnerDateOfReg",
          ]}
        />
        {/* <Button
          variant="contained"
          color="primary"
          onClick={() => setVisible(!visible)}
        >
          Transfer Vehicle Ownership
        </Button> */}
      </div>

      {/* <ModalForm
        title={"Transfer Vehicle"}
        visible={visible}
        toggleVisible={() => setVisible(!visible)}
        onSubmit={transfer}
        defaultValues={["", "", "Owner2", 92213211, "Block 821", "12-04-2021"]}
        keys={[
          "vehicleId",
          "newOwnerAddress",
          "newOwnerName",
          "newOwnerContact",
          "newOwnerPhysicalAddress",
          "newOwnerDateOfReg",
        ]}
      /> */}
    </>
  );
};

export default OwnerPage;
