import { drizzleReactHooks } from "@drizzle/react-plugin";
import { Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React, { useState, useEffect } from "react";
import { ownerColumns, ownerDefaultValues } from "../../constants";
import VehicleRegistryService from "../../services/VehicleRegistry";
import RegisterButton from "../Common/RegisterButton";
import TableCard from "../Common/Table";
import { useHistory } from "react-router-dom";
const { useDrizzle, useDrizzleState } = drizzleReactHooks;

const OwnerTable = () => {
  const [ownerList, setOwnerList] = useState([]);
  const history = useHistory();
  const { drizzle } = useDrizzle();
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

  const registerOwner = async (body) => {
    const resp = await VehicleRegistryService.registerOwnerDealer(
      drizzle,
      body,
    );
    if (resp) {
      openSnack("Successfully added owner");
      return true;
    }
  };

  const getAllOwners = async () => {
    const ownerAddresses = await drizzle.contracts.VehicleRegistry.methods
      .getAllActiveOwnerDealers()
      .call();
    const owners = await Promise.all(
      ownerAddresses.map(async (address) => {
        return VehicleRegistryService.retrieveOwnerDealerInfo(drizzle, address);
      }),
    );
    if (owners) {
      setOwnerList(owners);
    }
  };

  const deleteOwner = async (owner) => {
    const resp = await VehicleRegistryService.removeDealer(
      drizzle,
      owner.ownerDealerAddress,
    );
    if (resp) {
      openSnack("Successfully deleted owner!");
      getAllOwners();
    }
  };

  const viewOwner = async (owner) => {
    history.push(`/app/owner/${owner.ownerDealerAddress}`);
  };

  useEffect(() => {
    getAllOwners();
  }, [state.drizzleStatus.initialized]);
  return (
    <>
      <TableCard
        data={ownerList}
        title={"Owners"}
        columns={ownerColumns}
        cardWidth={"100%"}
        deleteData={deleteOwner}
        viewData={viewOwner}
        extraComponent={
          <RegisterButton
            submitRegister={registerOwner}
            registerText={"Add Owner"}
            keys={ownerColumns}
            defaultValues={ownerDefaultValues}
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
          {snackBarState.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default OwnerTable;
