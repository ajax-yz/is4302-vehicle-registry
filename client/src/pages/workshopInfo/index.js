import { drizzleReactHooks } from "@drizzle/react-plugin";
import { Grid, Button } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import ViewCard from "../../components/ViewCard";
import TableCard from "../../components/ViewCard/table";
import ModalForm from "../../components/Modal/form";

import {
  accidentColumns,
  servicingColumns,
  vehicleColumns,
} from "../../constants";
import VehicleRegistryService from "../../services/VehicleRegistry";

const { useDrizzle, useDrizzleState } = drizzleReactHooks;

const WorkshopPage = () => {
  const state = useDrizzleState((state) => state);
  const account = state.accounts[0];
  const { drizzle } = useDrizzle();
  const [workshopInfo, setWorkshopInfo] = useState({});

//   const data = {"address": account};
//   setWorkshopInfo(data);
  const [AllVehIdsServicedBy, setAllVehIdsServicedBy] = useState([]);
//   const [userAccidents, setUserAccidents] = useState([]);
//   const [userServicing, setUserServicing] = useState([]);

  const retrieveWorkshop = async () => {
    const results = await VehicleRegistryService.retrieveWorkshopInfo(
      drizzle,
      account,
    );
    console.log("results", results);
    setWorkshopInfo(results);
  };

  const retrieveAllVehIdsServicedBy = async () => {
    const vehicles = await VehicleRegistryService.retrieveAllVehIdsServicedBy(
      drizzle,
      account,
    );
    setAllVehIdsServicedBy(vehicles);
    console.log("vehicles =", vehicles);
  };


  useEffect(() => {
//       setWorkshopInfo(data);
    retrieveWorkshop();
    retrieveAllVehIdsServicedBy();
//     // retrieveAccidents();
//     // retrieveServicing();
  }, []);
  return (
    <Grid container direction={"column"} spacing={4}>
      <ViewCard userData={workshopInfo} title={"Workshop Details"} />
      <UpdateWorkshopCard />
    </Grid>
  );
};
const UpdateWorkshopCard = () => {
    const [visible, setVisible] = useState(false);
    const { drizzle } = useDrizzle();
  
    const updateWorkshop = async (data) => {
      console.log("data =", data);
      const body1 = {};
      const bodyKeys1 = [
        'workshopAddress',
        'workshopName',
        'workshopRegNo',
        'physicalAddress',
        'contact',
        'DOR',
      ];
      bodyKeys1.map((key) => {
        body1[key] = data[key];
      });
      // const workshopAddress = data.workshopAddress;
  
      const resp = await Promise.all([
        VehicleRegistryService.updateWorkshopInfo(
          drizzle,
          body1,
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
          Update Workshop Info
        </Button>
  
        <ModalForm
          title={"Update Workshop details"}
          visible={visible}
          toggleVisible={() => setVisible(!visible)}
          onSubmit={updateWorkshop}
          keys={[
            'workshopAddress',
            'workshopName',
            'workshopRegNo',
            'physicalAddress',
            'contact',
            'DOR',
          ]}
        />
      </div>
    );
  };

export default WorkshopPage;
