import React, { useState } from "react";
import {
  Grid,
  LinearProgress,
  Select,
  OutlinedInput,
  MenuItem,
  Button,
} from "@material-ui/core";
import { useTheme } from "@material-ui/styles";
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  LineChart,
  Line,
  Area,
  PieChart,
  Pie,
  Cell,
  YAxis,
  XAxis,
} from "recharts";
import { 
  Link,
  useHistory,
 } from 'react-router-dom';

// styles
import useStyles from "./styles";

import PageTitle from "../../components/PageTitle/PageTitle";
import Widget from "../../components/Widget";
import { Typography } from "../../components/Wrappers";
import Dot from "../../components/Sidebar/components/Dot";
import ModalForm from "../../components/Modal/form";
import { vehicleColumns } from "../../constants";
import VehicleRegistryService from "../../services/VehicleRegistry";
import { adminColumns } from "../../constants";

// Drizzle
import { drizzleReactHooks } from "@drizzle/react-plugin";
import { newContextComponents } from "@drizzle/react-components";
// End of Drizzle

const { useDrizzle, useDrizzleState } = drizzleReactHooks;
const { ContractData } = newContextComponents; // AccountData, ContractData

const AdminPage = () => {

  // Drizzle
  const { drizzle } = useDrizzle();
  const state = useDrizzleState(state => state);
  // End of Drizzle  
  var classes = useStyles();
  var theme = useTheme();
  return (
    <>
      <PageTitle
        title="Admin"
        button={
          <Button variant="contained" size="medium" color="secondary">
            Latest Reports
          </Button>
          
        }
      />
      <Grid container spacing={4}>
        <Grid item lg={3} md={4} sm={6} xs={12}>
          <Widget
            title="Admin Account Functions"
            upperTitle
            bodyClass={classes.fullHeightBody}
            className={classes.card}
          >
           
            {/*<Grid
              container
              direction="row"
              justify="space-between"
              alignItems="center"
            >*/}
              <Grid item xs={12}>
                <Typography color="text" colorBrightness="secondary" noWrap>
                  Register Admin
                </Typography>
                <AddAdminCom />
              </Grid>
              <Grid item xs={12}>
                <Typography color="text" colorBrightness="secondary" noWrap>
                  Retrieve Admin Info
                </Typography>
                <ViewAdminCom />
              </Grid>
              <Grid item xs={12}>
                <Typography color="text" colorBrightness="secondary" noWrap>
                  Update Admin Info
                </Typography>
                <Typography size="md">32</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography color="text" colorBrightness="secondary" noWrap>
                  Remove Admin
                </Typography>
                <Typography size="md">3.25%</Typography>
              </Grid>
            {/*</Grid>*/}
          </Widget>
        </Grid>
        <Grid item lg={3} md={8} sm={6} xs={12}>
          <Widget
            title="Workshop Functions"
            upperTitle
            className={classes.card}
            bodyClass={classes.fullHeightBody}
          >
            <Grid item xs={16}>
                <Typography color="text" colorBrightness="secondary" noWrap>
                  Register Workshop
                </Typography>
                <Typography size="md">860</Typography>
              </Grid>
            <Grid item xs={16}>
                <Typography color="text" colorBrightness="secondary" noWrap>
                  Update Workshop Information
                </Typography>
                <Typography size="md">860</Typography>
              </Grid>
              <Grid item xs={16}>
                <Typography color="text" colorBrightness="secondary" noWrap>
                  Retrieve Workshop Details
                </Typography>
                <Typography size="md">32</Typography>
              </Grid>
              <Grid item xs={16}>
                <Typography color="text" colorBrightness="secondary" noWrap>
                  Remove Workshop
                </Typography>
                <Typography size="md">3.25%</Typography>
              </Grid>
          </Widget>
        </Grid>
        <Grid item lg={3} md={8} sm={6} xs={12}>
          <Widget
            title="Vehicle Functions"
            upperTitle
            className={classes.card}
            bodyClass={classes.fullHeightBody}
          >
            <Grid item xs={16}>
                <Typography color="text" colorBrightness="secondary" noWrap>
                  Add Registered Vehicle
                </Typography>
                <AddVehicleCom />
              </Grid>
            <Grid item xs={16}>
                <Typography color="text" colorBrightness="secondary" noWrap>
                  Retrieve Vehicle Information
                </Typography>
                <Typography size="md">860</Typography>
              </Grid>
              <Grid item xs={16}>
                <Typography color="text" colorBrightness="secondary" noWrap>
                  Update Vehicle Information
                </Typography>
                <Typography size="md">32</Typography>
              </Grid>
              <Grid item xs={16}>
                <Typography color="text" colorBrightness="secondary" noWrap>
                  Deregister Vehicle
                </Typography>
                <Typography size="md">3.25%</Typography>
              </Grid>
          </Widget>
        </Grid>
        <Grid item lg={3} md={8} sm={6} xs={12}>
          <Widget
            title="Owner Functions (should be under vehicle info i guess)"
            upperTitle
            className={classes.card}
            bodyClass={classes.fullHeightBody}
          >
            <Grid item xs={16}>
                <Typography color="text" colorBrightness="secondary" noWrap>
                  Add Owner Information
                </Typography>
                <Typography size="md">860</Typography>
              </Grid>
            <Grid item xs={16}>
                <Typography color="text" colorBrightness="secondary" noWrap>
                  Retrieve Ownership History
                </Typography>
                <Typography size="md">860</Typography>
              </Grid>
              <Grid item xs={16}>
                <Typography color="text" colorBrightness="secondary" noWrap>
                  Update Owner Details
                </Typography>
                <Typography size="md">32</Typography>
              </Grid>
              <Grid item xs={16}>
                <Typography color="text" colorBrightness="secondary" noWrap>
                  Retrieve Servicing History
                </Typography>
                <Typography size="md">3.25%</Typography>
              </Grid>
          </Widget>
        </Grid>
        </Grid>
    </>
  );
};
// find out where adminaddress comes from
const AddAdminCom = () => {
  const [visible, setVisible] = useState(false);
  const { drizzle } = useDrizzle();

  const registerAdmin = async (data) => {
    console.log("data =", data);
    const body1 = {};
    const bodyKeys1 = [
      ...adminColumns.admin1,
    ];
    bodyKeys1.map((key) => {
      body1[key] = data[key];
    });

    const resp = await Promise.all([
      VehicleRegistryService.registerAdmin(
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
        Register Admin
      </Button>

      <ModalForm
        title={"Register Admin"}
        visible={visible}
        toggleVisible={() => setVisible(!visible)}
        onSubmit={registerAdmin}
        keys={[
          ...adminColumns.admin1,
        ]}
      />
    </div>
  );
};

const AddVehicleCom = () => {
  const [visible, setVisible] = useState(false);
  const { drizzle } = useDrizzle();

  const addVehicle = async (data) => {
    console.log("data =", data);
    const body1 = {};
    const body2 = {};
    const bodyKeys1 = [
      ...vehicleColumns.details1,
      ...vehicleColumns.details1p2,
    ];
    bodyKeys1.map((key) => {
      body1[key] = data[key];
    });
    vehicleColumns.details2.map((key) => {
      body2[key] = data[key];
    });
    const ownerAddress = data.ownerAddress;

    const resp = await Promise.all([
      VehicleRegistryService.registerVehicleToOwner1(
        drizzle,
        body1,
        ownerAddress,
      ),
      VehicleRegistryService.registerVehicleToOwner2(
        drizzle,
        body2,
        ownerAddress,
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
        Add Vehicle
      </Button>

      <ModalForm
        title={"Add Vehicle"}
        visible={visible}
        toggleVisible={() => setVisible(!visible)}
        onSubmit={addVehicle}
        keys={[
          ...vehicleColumns.details1,
        ]}
      />
    </div>
  );
};

const ViewAdminCom = () => {
  const history = useHistory();
  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={() => history.push("/app/administrator/admin-info")}
      >
        View Admin Info
        </Button>
      
    </div>
  );
};
export default AdminPage;
