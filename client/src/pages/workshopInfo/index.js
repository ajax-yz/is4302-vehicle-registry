import { drizzleReactHooks } from "@drizzle/react-plugin";
import { Card, CardContent, Grid, Button } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import Widget from "../../components/Widget";
import PageTitle from "../../components/PageTitle";
import ViewCard from "../../components/Common/ViewCard";
import RegisterButton from "../../components/Common/RegisterButton";

import TableCard from "../../components/Common/Table";
import ModalForm from "../../components/Common/ModalForm";
import { useParams, useHistory } from "react-router-dom";
import { ROLES_ENUM } from "../../constants";
import {
  accidentColumns,
  servicingColumns,
  vehicleColumns,
  defaultServicingValues,
} from "../../constants";
import VehicleRegistryService from "../../services/VehicleRegistry";
import VehicleTable from "../../components/Common/VehicleTable";

const { useDrizzle, useDrizzleState } = drizzleReactHooks;

const WorkshopPage = ({ role }) => {
  const history = useHistory();
  const state = useDrizzleState((state) => state);
  const account = state.accounts[0];
  const { drizzle } = useDrizzle();
  const { workshopAddress } = useParams();
  const workshopAddr = workshopAddress ? workshopAddress : account;

  const [workshopInfo, setWorkshopInfo] = useState({});

  //   const data = {"address": account};
  //   setWorkshopInfo(data);
  const [vehServicingRecords, setVehServicingRecords] = useState([]);
  // Accident records of vehicles serviced by WS
  const [vehAccidentRecords, setVehAccidentRecords] = useState([]);
  //   const [userAccidents, setUserAccidents] = useState([]);
  //   const [userServicing, setUserServicing] = useState([]);

  const retrieveWorkshop = async () => {
    const results = await VehicleRegistryService.retrieveWorkshopInfo(
      drizzle,
      workshopAddr,
    );
    setWorkshopInfo(results);
  };

  const retrieveAllVehServiceRecordsByWorkshop = async () => {
    const servicingRecords = await VehicleRegistryService.retrieveAllVehServiceRecordsByWorkshop(
      drizzle,
      workshopAddr,
    );
    setVehServicingRecords(servicingRecords);
  };

  const retrieveAccidentsOfVehiclesServiced = async () => {
    const accidents = await VehicleRegistryService.retrieveAllVehAccidentRecordsByWorkshop(
      drizzle,
      workshopAddr,
    );
    setVehAccidentRecords(accidents);
  };

  const addServicingRecord = (body) => {
    return VehicleRegistryService.addServicingRecord(drizzle, {
      vehicleId: body.vehicleId,
      dateCompleted: body.dateCompleted,
      workshopRegNo: body.workshopRegNo,
      typeOfWorkDone: body.typeOfWorkDone,
      appointedMechanic: body.appointedMechanic,
      currentMileage: body.currentMileage,
      workDone: body.workDone,
      totalCharges: body.totalCharges,
    });
  };

  useEffect(() => {
    //       setWorkshopInfo(data);
    retrieveWorkshop();
    retrieveAllVehServiceRecordsByWorkshop();
    retrieveAccidentsOfVehiclesServiced();
    //     // retrieveAccidents();
    //     // retrieveServicing();
  }, []);
  return (
    <>
      <PageTitle
        title="Workshop"
        backButton={
          workshopAddress ? (
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
        button={<UpdateWorkshopCard />}
      />
      <Grid container direction={"column"} spacing={4}>
        <Grid item xs={12}>
          <Grid container spacing={4}>
            <Grid item lg={10} xs={10}>
              <ViewCard data={workshopInfo} title={"Workshop Details"} />
            </Grid>
            {role === ROLES_ENUM.WORKSHOP ? (
              <Grid item xs={2}>
                <Card
                  style={{ width: "100%", minHeight: "284px", height: "100%" }}
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
                      Workshop Functions
                    </div>
                    <div style={{ padding: "8px" }}>
                      <div style={{ marginBottom: "12px" }}>
                        You may add a servicing record
                      </div>
                      <RegisterButton
                        submitRegister={addServicingRecord}
                        registerText={"Add Servicing Record"}
                        keys={[
                          "vehicleId",
                          ...servicingColumns.history1,
                          ...servicingColumns.history2,
                        ]}
                        defaultValues={defaultServicingValues}
                      />
                    </div>
                  </CardContent>
                </Card>
              </Grid>
            ) : null}

            <TableCard
              data={vehAccidentRecords}
              title={"Accident Records"}
              columns={[
                "vehicleId",
                ...accidentColumns.accident1,
                ...accidentColumns.accident2,
              ]}
              cardWidth={"100%"}
            />

            <TableCard
              data={vehServicingRecords}
              title={"All Servicing Records"}
              columns={[
                "vehicleId",
                ...servicingColumns.history1,
                ...servicingColumns.history2,
              ]}
              cardWidth={"100%"}
            />
          </Grid>
        </Grid>
        {/* <UpdateWorkshopCard /> */}
      </Grid>
    </>
  );
};
const UpdateWorkshopCard = () => {
  const [visible, setVisible] = useState(false);
  const { drizzle } = useDrizzle();

  const updateWorkshop = async (data) => {
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
      VehicleRegistryService.updateWorkshopInfo(drizzle, body1),
    ]);
  };

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setVisible(!visible)}
      >
        Update Workshop Info
      </Button>

      <ModalForm
        title={"Update Workshop details"}
        visible={visible}
        toggleVisible={() => setVisible(!visible)}
        onSubmit={updateWorkshop}
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

export default WorkshopPage;
