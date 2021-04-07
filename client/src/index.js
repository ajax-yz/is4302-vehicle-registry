import { CssBaseline } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";
import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import { LayoutProvider } from "./context/LayoutContext";
import { UserProvider } from "./context/UserContext";
import * as serviceWorker from "./serviceWorker";
import Themes from "./themes";
import drizzleOptions from './drizzleOptions';
import { drizzleReactHooks } from "@drizzle/react-plugin";
import { Drizzle } from "@drizzle/store";


// Custom loading container
import LoadingContainer from "./components/LoadingContainer";

// setup drizzle
const drizzle = new Drizzle(drizzleOptions);
const { DrizzleProvider } = drizzleReactHooks;

ReactDOM.render(
  <LayoutProvider>
    <UserProvider>
      <ThemeProvider theme={Themes.default}>
        <CssBaseline />
        <DrizzleProvider drizzle={drizzle}>
          <LoadingContainer>
            <App />
          </LoadingContainer>
        </DrizzleProvider>
      </ThemeProvider>
    </UserProvider>
  </LayoutProvider>,
  document.getElementById("root"),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
