import React, { useState, useEffect } from "react";
import TableCard from "../Common/Table";
import { adminColumns } from "../../constants";
import { drizzleReactHooks } from "@drizzle/react-plugin";
import RegisterButton from "../Common/RegisterButton";

import VehicleRegistryService from "../../services/VehicleRegistry";
const { useDrizzle, useDrizzleState } = drizzleReactHooks;

const AdminTable = ({ isRegistryOwner }) => {
  const { drizzle } = useDrizzle();
  const [admins, setAdmins] = useState([]);

  const registerAdmin = (body) => {
    return VehicleRegistryService.registerAdmin(drizzle, body);
  };

  return (
    <>
      <TableCard
        data={admins}
        title={"Admins"}
        columns={adminColumns}
        cardWidth={"100%"}
        hasAck={true}
        onClick={(_data) => console.log(_data)}
        extraComponent={
          isRegistryOwner ? (
            <RegisterButton
              submitRegister={registerAdmin}
              registerText={"Register Admin"}
              keys={adminColumns}
            />
          ) : null
        }
      />
    </>
  );
};

export default AdminTable;
