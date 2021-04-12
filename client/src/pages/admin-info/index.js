import { drizzleReactHooks } from "@drizzle/react-plugin";
import { Grid } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import ViewCard from "../../components/Common/ViewCard";
import TableCard from "../../components/Common/Table";
import { adminColumns } from "../../constants";
import VehicleRegistry from "../../services/VehicleRegistry";

const { useDrizzle, useDrizzleState } = drizzleReactHooks;

const AdminInfoPage = () => {
  const state = useDrizzleState((state) => state);
  const account = state.accounts[0];
  const { drizzle } = useDrizzle();
  const [adminInfo, setAdminInfo] = useState([]);
  console.log("account admininfo = ", account);

  const retrieveAdminInfo = async () => {
    const info = await VehicleRegistry.retrieveAdminInfo(drizzle, account);
    console.log("retrieved admin info", info);
    const infoarray = Object.values(info);
    console.log("infoarray = ", infoarray);
    console.log("type of info", typeof info);
    setAdminInfo(infoarray);
  };

  useEffect(() => {
    retrieveAdminInfo();
  }, []);
  return (
    <Grid container direction={"column"} spacing={4}>
      <ViewCard userData={adminInfo} title={"Admin Details"} />
      <TableCard
        data={adminInfo}
        title={"Admin Data"}
        columns={["AdminId", ...adminColumns.admin1]}
        cardWidth={"100%"}
        hasAck={true}
        onClick={(_data) => console.log(_data)}
      />
    </Grid>
  );
};

export default AdminInfoPage;
