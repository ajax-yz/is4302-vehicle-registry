import { drizzleReactHooks } from "@drizzle/react-plugin";
import { Button, Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React, { useEffect, useState } from "react";
import { workshopColumns } from "../../constants";
import VehicleRegistryService from "../../services/VehicleRegistry";
import ModalForm from "../Common/ModalForm";
import RegisterButton from "../Common/RegisterButton";
import TableCard from "../Common/Table";

const { useDrizzle, useDrizzleState } = drizzleReactHooks;

const WorkshopTable = () => {
  const [workshops, setWorkshopList] = useState([]);
  const { drizzle } = useDrizzle();
  const state = useDrizzleState((state) => state);

  const registerWorkshop = async (body) => {
    const resp = await VehicleRegistryService.registerWorkshop(drizzle, body);
    if (resp) {
      openSnack("Successfully added workshop");
      return true;
    }
  };

  // snackbar
  const [snackBarState, setSnackBar] = useState({
    open: false,
    message: "",
    vertical: "top",
    horizontal: "center",
  });

  const openSnack = (message) => {
    setSnackBar({ ...snackBarState, message, open: true });
  };

  const closeSnack = () => {
    setSnackBar({ ...snackBarState, open: false });
  };
  // end snackbar

  const getAllWorkshops = async () => {
    const workshopAddresses = await drizzle.contracts.VehicleRegistry.methods
      .getAllActiveWorkshops()
      .call();
    const workshops = await Promise.all(
      workshopAddresses.map(async (address) => {
        return VehicleRegistryService.retrieveWorkshopInfo(drizzle, address);
      }),
    );
    if (workshops) {
      setWorkshopList(workshops);
    }
  };

  const deleteWorkshop = async (workshop) => {
    const resp = await VehicleRegistryService.removeWorkshop(
      drizzle,
      workshop.workshopAddress,
    );
    if (resp) {
      openSnack("Successfully deleted workshop!");
      getAllWorkshops();
    }
  };

  useEffect(() => {
    getAllWorkshops();
  }, [state.drizzleStatus.initialized]);

  return (
    <>
      <TableCard
        data={workshops}
        title={"Workshops"}
        columns={workshopColumns}
        cardWidth={"100%"}
        deleteData={deleteWorkshop}
        onClick={(_data) => console.log(_data)}
        extraComponent={
          <RegisterButton
            submitRegister={registerWorkshop}
            registerText={"Add Workshop"}
            keys={workshopColumns}
          />
        }
        // extraComponent={<AddWorkshopCard />}
      />

      <Snackbar
        anchorOrigin={{
          vertical: snackBarState.vertical,
          horizontal: snackBarState.horizontal,
        }}
        open={snackBarState.open}
        autoHideDuration={3000}
        onClose={closeSnack}
        key={snackBarState.vertical + snackBarState.horizontal}
      >
        <Alert
          elevation={6}
          variant="filled"
          severity="success"
          onClose={closeSnack}
        >
          {snackBarState.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default WorkshopTable;
