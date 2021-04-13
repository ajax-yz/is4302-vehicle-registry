import React, { useEffect, useState } from "react";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";

// components
import Layout from "./Layout";

// pages
import Error from "../pages/error";
import Login from "../pages/login";

// Drizzle
import { drizzleReactHooks } from "@drizzle/react-plugin";

// constants
import { allRoles } from "../constants";

const { useDrizzle, useDrizzleState } = drizzleReactHooks;

const App = () => {
  // global
  const [userRole, setUserRole] = useState(null);
  const [isRegistryOwner, setRegistryOwner] = useState(false);
  const drizzleState = useDrizzleState((state) => state);
  const account = drizzleState.accounts[0];
  // console.log("drizzlestate.accounts =", drizzleState.accounts);
  const accountsLength = Object.keys(drizzleState.accounts).length;
  const { drizzle } = useDrizzle();

  const getRole = async () => {
    // console.log("drizzle =", drizzle);
    // console.log("drizzleState =", drizzleState);

    const roleBytes = await drizzle.contracts.VehicleRegistry.methods
      .roleOfAddress(account)
      .call();
    if (roleBytes) {
      const role = drizzle.web3.utils.toUtf8(roleBytes);
      setUserRole(role);
      // console.log("accountt =", account);
      // console.log("role =", role);
    }
  };

  const checkIsRegistryOwner = async () => {
    const ownerAddress = await drizzle.contracts.VehicleRegistry.methods
      .vehicleRegistryOwner()
      .call();
    if (ownerAddress === account) {
      setRegistryOwner(true);
    }
  };

  useEffect(() => {
    if (drizzleState.drizzleStatus.initialized && accountsLength == 1) {
      getRole();
      // checkIsRegistryOwner();
    }
  }, [drizzleState.drizzleStatus.initialized]);

  // length == 1 means user is logged in on meta mask (Includes correct and incorrect accounts). Length > 1 means user not logged in.
  const isLoggedInOnMetaMask = Object.keys(drizzleState.accounts).length === 1;
  if (userRole == null) {
    return <Login isLoggedIn={isLoggedInOnMetaMask} />;
  }
  return (
    <HashRouter>
      <Switch>
        <Route exact path="/" render={() => <Redirect to="/app/dashboard" />} />
        <Route
          exact
          path="/app"
          render={() => <Redirect to="/app/dashboard" />}
        />
        <PrivateRoute
          path="/app"
          component={Layout}
          role={userRole}
          // isRegistryOwner={isRegistryOwner}
        />
        <PublicRoute
          path="/login"
          component={Login}
          role={userRole}
          isLoggedIn={isLoggedInOnMetaMask}
        />
        <Route component={Error} />
      </Switch>
    </HashRouter>
  );
};

const PrivateRoute = ({ component, role, isRegistryOwner, ...rest }) => {
  // const isAuthenticated = allRoles.indexOf(role) != -1;
  const isAuthenticated = true;
  // console.log("test ");
  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          React.createElement(component, { ...props, role, isRegistryOwner })
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: {
                from: props.location,
              },
            }}
          />
        )
      }
    />
  );
};

const PublicRoute = ({ component, role, isLoggedIn, ...rest }) => {
  const isAuthenticated = allRoles.indexOf(role) != -1;
  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          <Redirect
            to={{
              pathname: "/",
            }}
          />
        ) : (
          React.createElement(component, { ...props, isLoggedIn })
        )
      }
    />
  );
};

export default App;
