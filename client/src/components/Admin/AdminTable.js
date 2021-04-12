import { drizzleReactHooks } from "@drizzle/react-plugin";
import { Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React, { useEffect, useState } from "react";
import { adminColumns } from "../../constants";
import VehicleRegistryService from "../../services/VehicleRegistry";
import RegisterButton from "../Common/RegisterButton";
import TableCard from "../Common/Table";

const { useDrizzle, useDrizzleState } = drizzleReactHooks;

const AdminTable = () => {
  const { drizzle } = useDrizzle();
  const [adminList, setAdminList] = useState([]);

  const state = useDrizzleState((state) => state);

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

  const registerAdmin = async (body) => {
    const resp = VehicleRegistryService.registerAdmin(drizzle, body);
    if (resp) {
      openSnack("Successfully added admin");
      return true;
    }

    return false;
  };

  const getAllAdmins = async () => {
    const adminAddresses = await drizzle.contracts.VehicleRegistry.methods
      .getAllActiveAdmins()
      .call();
    const admins = await Promise.all(
      adminAddresses.map(async (address) => {
        return VehicleRegistryService.retrieveAdminInfo(drizzle, address);
      }),
    );
    if (admins) {
      setAdminList(admins);
    }
  };

  const deleteAdmin = async (admin) => {
    const resp = await VehicleRegistryService.removeAdmin(
      drizzle,
      admin.adminAddress,
    );
    if (resp) {
      openSnack("Successfully deleted admin!");
      getAllAdmins();
    }
  };

  useEffect(() => {
    getAllAdmins();
  }, [state.drizzleStatus.initialized]);

  return (
    <>
      <TableCard
        data={adminList}
        title={"Admins"}
        columns={adminColumns}
        cardWidth={"100%"}
        deleteData={deleteAdmin}
        extraComponent={
          <RegisterButton
            submitRegister={registerAdmin}
            registerText={"Register Admin"}
            keys={adminColumns}
          />
        }
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
          {/* <Alert onClose={closeSnack} severity="success"> */}
          {snackBarState.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AdminTable;
