import { drizzleReactHooks } from "@drizzle/react-plugin";
import React, { useState } from "react";
import { Button, Grid } from "@material-ui/core";
import { adminColumns, ownerColumns } from "../../constants";
import VehicleRegistryService from "../../services/VehicleRegistry";
import RegisterButton from "../Common/RegisterButton";
import ModalForm from "../Common/ModalForm";
import TableCard from "../Common/Table";

const { useDrizzle, useDrizzleState } = drizzleReactHooks;

const WorkshopTable = () => {
  const [owners, setOwners] = useState([]);
  const { drizzle } = useDrizzle();
  const registerWorkshop = (body) => {
    return VehicleRegistryService.registerOwnerDealer(drizzle, body);
  };
  return (
    <>
      <TableCard
        data={owners}
        title={"Owners"}
        columns={ownerColumns}
        cardWidth={"100%"}
        hasAck={true}
        onClick={(_data) => console.log(_data)}
        extraComponent={<AddWorkshopCard />}
      />
    </>
  );
};

const AddWorkshopCard = () => {
  const [visible, setVisible] = useState(false);
  const { drizzle } = useDrizzle();

  const addWorkshop = async (data) => {
    console.log("data =", data);
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
      VehicleRegistryService.registerWorkshop(drizzle, body1),
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
        Add Workshop
      </Button>

      <ModalForm
        title={"Add Workshop"}
        visible={visible}
        toggleVisible={() => setVisible(!visible)}
        onSubmit={addWorkshop}
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
export default WorkshopTable;
