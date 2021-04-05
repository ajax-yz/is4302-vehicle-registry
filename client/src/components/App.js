import React from "react";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";

// components
import Layout from "./Layout";

// pages
import Error from "../pages/error";
import Login from "../pages/login";

// context
import { useUserState } from "../context/UserContext";

// Drizzle
import { Drizzle } from "@drizzle/store";
import { drizzleReactHooks } from "@drizzle/react-plugin";
import VehicleRegistry from "../contracts/VehicleRegistry.json";
// Custom loading container
import LoadingContainer from "./LoadingContainer.js";

const drizzleOptions = {
  contracts: [VehicleRegistry],
  web3: {
    fallback: {
      type: "ws",
      url: "ws://127.0.0.1:8545",
    },
  },
};

const drizzle = new Drizzle(drizzleOptions);
const { DrizzleProvider } = drizzleReactHooks;

export default function App() {
  // global
  var { isAuthenticated } = useUserState();

  return (
    <DrizzleProvider drizzle={drizzle}>
      <LoadingContainer>
        <HashRouter>
          <Switch>
            <Route
              exact
              path="/"
              render={() => <Redirect to="/app/dashboard" />}
            />
            <Route
              exact
              path="/app"
              render={() => <Redirect to="/app/dashboard" />}
            />
            <PrivateRoute path="/app" component={Layout} />
            <PublicRoute path="/login" component={Login} />
            <Route component={Error} />
          </Switch>
        </HashRouter>
      </LoadingContainer>
    </DrizzleProvider>
  );

  // #######################################################################

  function PrivateRoute({ component, ...rest }) {
    return (
      <Route
        {...rest}
        render={(props) =>
          isAuthenticated ? (
            React.createElement(component, props)
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
  }

  function PublicRoute({ component, ...rest }) {
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
            React.createElement(component, props)
          )
        }
      />
    );
  }
}
