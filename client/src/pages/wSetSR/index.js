import React, { useState } from "react";
import {
  Grid,
  Button,
  TextField,
} from "@material-ui/core";
import VehicleRegistryService from "../../services/VehicleRegistry";
import { vehicleColumns } from "../../constants";
import ModalForm from "../../components/Modal/form";

// drizzle
import { drizzleReactHooks } from "@drizzle/react-plugin";
const { useDrizzle, useDrizzleState } = drizzleReactHooks;

const WorkshopSetSR = () => {
  const state = useDrizzleState((state) => state);
  // const account = state.accounts[0];
  const { drizzle } = useDrizzle();
  const [userInfo, setUserInfo] = useState({});
  const [ownerAddress, setOwnerAddress] = useState("");
  const [userVehicles, setUserVehicles] = useState([]);
  const [userAccidents, setUserAccidents] = useState([]);
  const [userServicing, setUserServicing] = useState([]);

  const retrieveVehicles = async () => {
    const vehicles = await VehicleRegistryService.retrieveAllVehiclesOwn(
      drizzle,
      ownerAddress,
    );
    setUserVehicles(vehicles);
    console.log("vehicles =", vehicles);
  };

  // useEffect(() => {
  //   retrieveVehicles();
  // }, []);

  // const retrieve = async () => {
  //       const response = await VehicleRegistryService.addServicingRecord(drizzle, {
  //           vehicleId,
  //           dateCompleted,
  //           workshopRegNo,
  //           typeOfWorkDone,
  //           appointedMechanic,
  //           currentMileage,
  //           workDone,
  //           totalCharges,
  //       });
  //     };

  return (
    <Grid container>
      <TextField
          id="name"
          value={ownerAddress}
          onChange={(e) => setOwnerAddress(e.target.value)}
          margin="normal"
          placeholder="Enter Owner Blockchain Address"
          type="text"
          fullWidth
        />
      <Button 
      onClick={() => retrieveVehicles()} 
      variant="contained"
      size="medium"
      color="primary"> 
      Retrieve Vehicles 
      </Button>
      {/* <AddServicingRecord /> */}
    </Grid>
  );
};
// const AddServicingRecord = () => {
//   const { drizzle } = useDrizzle();
//   const [vehicleId, setVehicleId] = useState("");
//   const [dateCompleted, setDateCompleted] = useState("");
//   const [workshopRegNo, setWorkshopRegNo] = useState("");
//   const [typeOfWorkDone, setTypeOfWorkDone] = useState("");
//   const [appointedMechanic, setAppointedMechanic] = useState("");
//   const [currentMileage, setCurrentMileage] = useState("");
//   const [workDone, setWorkDone] = useState("");
//   const [totalCharges, setTotalCharges] = useState("");

//   const submit = async () => {
//     const response = await VehicleRegistryService.addServicingRecord(drizzle, {
//         vehicleId,
//         dateCompleted,
//         workshopRegNo,
//         typeOfWorkDone,
//         appointedMechanic,
//         currentMileage,
//         workDone,
//         totalCharges,
//     });
//   };

//   // address = 0x58Ff09a4aFBf3cDD9791Bc603F4630D2c3fb3857
//   return (
//     <Grid
//       container
//       style={{
//         backgroundColor: "white",
//         border: "1px solid #e8e8e8",
//         padding: "24px",
//       }}
//     >
//       <Grid container>
//         addServicingRecord
//         <TextField
//           id="name"
//           value={vehicleId}
//           onChange={(e) => setVehicleId(e.target.value)}
//           margin="normal"
//           placeholder="Vehicle Id"
//           type="text"
//           fullWidth
//         />
//         <TextField
//           id="name"
//           value={dateCompleted}
//           onChange={(e) => setDateCompleted(e.target.value)}
//           margin="normal"
//           placeholder="Date Completed"
//           type="text"
//           fullWidth
//         />
//         <TextField
//           id="name"
//           value={workshopRegNo}
//           onChange={(e) => setWorkshopRegNo(e.target.value)}
//           margin="normal"
//           placeholder="Workshop RegNo"
//           type="text"
//           fullWidth
//         />
//         <TextField
//           id="name"
//           value={typeOfWorkDone}
//           onChange={(e) => setTypeOfWorkDone(e.target.value)}
//           margin="normal"
//           placeholder="Type Of Work Done"
//           type="text"
//           fullWidth
//         />
//         <TextField
//           id="name"
//           value={appointedMechanic}
//           onChange={(e) => setAppointedMechanic(e.target.value)}
//           margin="normal"
//           placeholder="Appointed Mechanic"
//           type="text"
//           fullWidth
//         />
//         <TextField
//           id="name"
//           value={currentMileage}
//           onChange={(e) => setCurrentMileage(e.target.value)}
//           margin="normal"
//           placeholder="Current Mileage"
//           type="text"
//           fullWidth
//         />
//         <TextField
//           id="name"
//           value={workDone}
//           onChange={(e) => setWorkDone(e.target.value)}
//           margin="normal"
//           placeholder="Work Done"
//           type="text"
//           fullWidth
//         />
//         <TextField
//           id="name"
//           value={totalCharges}
//           onChange={(e) => setTotalCharges(e.target.value)}
//           margin="normal"
//           placeholder="Total Charges"
//           type="text"
//           fullWidth
//         />
//         <Button onClick={() => submit()}>Submit</Button>
//       </Grid>
//     </Grid>
//   );
// };

export default WorkshopSetSR;
