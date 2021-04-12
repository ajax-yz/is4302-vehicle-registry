import { drizzleReactHooks } from "@drizzle/react-plugin";
import React, { useState } from "react";
import { adminColumns, ownerColumns } from "../../constants";
import VehicleRegistryService from "../../services/VehicleRegistry";
import RegisterButton from "../Common/RegisterButton";
import TableCard from "../Common/Table";

const { useDrizzle, useDrizzleState } = drizzleReactHooks;

const OwnerTable = () => {
  const [owners, setOwners] = useState([]);
  const { drizzle } = useDrizzle();
  const registerOwner = (body) => {
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
        extraComponent={
          <RegisterButton
            submitRegister={registerOwner}
            registerText={"Add Owner"}
            keys={adminColumns}
          />
        }
      />
    </>
  );
};

export default OwnerTable;
