import React, { useEffect, useState } from "react";
import {
  Grid,
  CircularProgress,
  Typography,
  Button,
  Tabs,
  Tab,
  TextField,
  Fade,
  Card,
  CardContent,
} from "@material-ui/core";

import { drizzleReactHooks } from "@drizzle/react-plugin";
import { newContextComponents } from "@drizzle/react-components";

import VehicleRegistryService from "../../services/VehicleRegistry";
import PageTitle from "../../components/PageTitle/PageTitle";
import UserInfo from "../../components/ViewCard";

const { useDrizzle, useDrizzleState } = drizzleReactHooks;
const { ContractData } = newContextComponents; // AccountData, ContractData

const OwnerPage = () => {
  const state = useDrizzleState((state) => state);
  const account = state.accounts[0];
  const { drizzle } = useDrizzle();
  const [userInfo, setUserInfo] = useState({});
  const retrieveOwner = async () => {
    const results = await VehicleRegistryService.retrieveOwnerDealerInfo(
      drizzle,
      account,
    );
    console.log("results =", results);
    setUserInfo(results);
  };
  useEffect(() => {
    retrieveOwner();
  }, []);
  return (
    <Grid container>
      <UserInfo userData={userInfo} title={"User Details"} />
    </Grid>
  );
};

export default OwnerPage;
