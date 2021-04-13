import React from "react";
import { Route, Switch, Redirect, withRouter } from "react-router-dom";
import classnames from "classnames";
import { Box, IconButton, Link } from "@material-ui/core";
import Icon from "@mdi/react";

//icons
import {
  mdiFacebook as FacebookIcon,
  mdiTwitter as TwitterIcon,
  mdiGithub as GithubIcon,
} from "@mdi/js";

// styles
import useStyles from "./styles";

// components
import Header from "../Header";
import Sidebar from "../Sidebar";

// pages
import Dashboard from "../../pages/dashboard";
import Typography from "../../pages/typography";
import Notifications from "../../pages/notifications";
import Tables from "../../pages/tables";
import Icons from "../../pages/icons";
import Charts from "../../pages/charts";
import AdminPage from "../../pages/admin";
import VehiclePage from "../../pages/vehicle";

// import AdminInfoPage from "../../pages/admin-info";
import OwnerPage from "../../pages/owner";
import WorkshopPage from "../../pages/workshopInfo";
import WorkshopSetSR from "../../pages/wSetSR";
// import AllVehicleInfo from "../../pages/admin-tables/vehicle-table";
// import AccidentInfoPage from "../../pages/admin-tables/accident-table";
// import ServicingInfoPage from "../../pages/admin-tables/servicing-table";

// context
import { useLayoutState } from "../../context/LayoutContext";

// constants
import { ROLES_ENUM } from "../../constants";
import MiscPage from "../../pages/misc";

function Layout(props) {
  console.log("layout prrops=-", props);
  var classes = useStyles();

  // global
  var layoutState = useLayoutState();
  const role = props.role;
  return (
    <div className={classes.root}>
      <>
        <Header history={props.history} />
        <Sidebar role={role} />
        <div
          className={classnames(classes.content, {
            [classes.contentShift]: layoutState.isSidebarOpened,
          })}
        >
          <div className={classes.fakeToolbar} />
          <Switch>
            <PrivateRoute
              path="/app/dashboard"
              component={Dashboard}
              role={role}
              allowedRoles={[ROLES_ENUM.ADMINISTRATOR]}
            />
            {/* <PrivateRoute
              path="/app/administrator/admin-info"
              component={AdminInfoPage}
              role={role}
              allowedRole={ROLES_ENUM.ADMINISTRATOR}
            /> */}
            {/* <PrivateRoute
              path="/app/administrator/admin-tables/vehicle-table"
              component={AllVehicleInfo}
              role={role}
              allowedRole={ROLES_ENUM.ADMINISTRATOR}
            />
            <PrivateRoute
              path="/app/administrator/admin-tables/accident-table"
              component={AccidentInfoPage}
              role={role}
              allowedRole={ROLES_ENUM.ADMINISTRATOR}
            />
            <PrivateRoute
              path="/app/administrator/admin-tables/servicing-table"
              component={ServicingInfoPage}
              role={role}
              allowedRole={ROLES_ENUM.ADMINISTRATOR}
            /> */}
            <PrivateRoute
              path="/app/administrator"
              component={AdminPage}
              isRegistryOwner={props.isRegistryOwner}
              role={role}
              allowedRoles={[ROLES_ENUM.ADMINISTRATOR]}
            />
            <PrivateRoute
              path="/app/owner/:ownerAddress?"
              component={OwnerPage}
              role={role}
              // allowedRole={ROLES_ENUM.OWNER}
            />
            <PrivateRoute
              path="/app/dealer"
              component={Notifications}
              role={role}
              // allowedRole={ROLES_ENUM.DEALER}
            />
            <PrivateRoute
              path="/app/workshop/:workshopAddress?"
              component={WorkshopPage}
              role={role}
              allowedRoles={[ROLES_ENUM.ADMINISTRATOR, ROLES_ENUM.WORKSHOP]}
            />
            <PrivateRoute
              path="/app/setSR"
              component={WorkshopSetSR}
              role={role}
              // allowedRole={ROLES_ENUM.WORKSHOP}
            />
            <PrivateRoute
              path="/app/vehicle/:vehicleId"
              component={VehiclePage}
              isRegistryOwner={props.isRegistryOwner}
              role={role}
              // allowedRole={ROLES_ENUM.ADMINISTRATOR}
            />
            {/* <PrivateRoute
              path="/app/insurance"
              component={Notifications}
              role={role}
              // allowedRole={ROLES_ENUM.INSURANCE}
            /> */}
            <Route
              exact
              path="/app/ui"
              render={() => <Redirect to="/app/ui/icons" />}
            />
            <Route exact path="/app/misc" component={MiscPage} />
            <Route path="/app/ui/icons" component={Icons} />
            <Route path="/app/ui/charts" component={Charts} />
          </Switch>
          <Box
            mt={5}
            width={"100%"}
            display={"flex"}
            alignItems={"center"}
            justifyContent="space-between"
          >
            <div>
              <Link
                color={"primary"}
                href={"https://flatlogic.com/"}
                target={"_blank"}
                className={classes.link}
              >
                Flatlogic
              </Link>
              <Link
                color={"primary"}
                href={"https://flatlogic.com/about"}
                target={"_blank"}
                className={classes.link}
              >
                About Us
              </Link>
              <Link
                color={"primary"}
                href={"https://flatlogic.com/blog"}
                target={"_blank"}
                className={classes.link}
              >
                Blog
              </Link>
            </div>
            <div>
              <Link
                href={"https://www.facebook.com/flatlogic"}
                target={"_blank"}
              >
                <IconButton aria-label="facebook">
                  <Icon path={FacebookIcon} size={1} color="#6E6E6E99" />
                </IconButton>
              </Link>
              <Link href={"https://twitter.com/flatlogic"} target={"_blank"}>
                <IconButton aria-label="twitter">
                  <Icon path={TwitterIcon} size={1} color="#6E6E6E99" />
                </IconButton>
              </Link>
              <Link href={"https://github.com/flatlogic"} target={"_blank"}>
                <IconButton aria-label="github" style={{ marginRight: -12 }}>
                  <Icon path={GithubIcon} size={1} color="#6E6E6E99" />
                </IconButton>
              </Link>
            </div>
          </Box>
        </div>
      </>
    </div>
  );
}

const PrivateRoute = ({
  component,
  role,
  path,
  allowedRoles,
  isRegistryOwner,
  ...rest
}) => {
  // const isAuthenticated = role === allowedRole;
  const isAuthenticated = allowedRoles ? allowedRoles.indexOf(role) > -1 : true;
  console.log("isauthenticated =", isAuthenticated);
  const rolePath = role.split(" ")[0].toLowerCase();
  // const isAuthenticated = true;

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          React.createElement(component, {
            ...props,
            role,
            isRegistryOwner,
          })
        ) : (
          <Redirect
            to={{
              // pathname: path,
              pathname: `/app/${rolePath}`,
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

export default withRouter(Layout);
