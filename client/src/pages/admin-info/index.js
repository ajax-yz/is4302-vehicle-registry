import { drizzleReactHooks } from "@drizzle/react-plugin";
import { Grid } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import ViewCard from "../../components/ViewCard";
import TableCard from "../../components/ViewCard/table";
import {
  adminColumns,
} from "../../constants";
import VehicleRegistry from "../../services/VehicleRegistry";

const { useDrizzle, useDrizzleState } = drizzleReactHooks;

const AdminInfoPage = () => {
  const state = useDrizzleState((state) => state);
  const account = state.accounts[0];
  const { drizzle } = useDrizzle();
  const [userInfo, setUserInfo] = useState({});
  const [adminInfo, setAdminInfo] = useState([]);

  const retrieveAdminInfo = async () => {
    const admininfo = await VehicleRegistry.retrieveAdmininfo(
      drizzle,
      account,
    );
    setAdminInfo(admininfo);
  };

  useEffect(() => {
    retrieveAdminInfo();
  }, []);
  return (
    <Grid container direction={"column"} spacing={4}>
      <ViewCard userData={userInfo} title={"User Details"} />
      <TableCard
        data={adminInfo}
        title={"Vehicles Data"}
        columns={[
          "vehicleId",
          ...adminColumns.admin1,
        ]}
        cardWidth={"100%"}
        hasAck={true}
        onClick={(_data) => console.log(_data)}
      />
    </Grid>
  );
};

export default AdminInfoPage;
