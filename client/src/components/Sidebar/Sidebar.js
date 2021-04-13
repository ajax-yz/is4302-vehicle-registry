import React, { useState, useEffect } from "react";
import { Drawer, IconButton, List } from "@material-ui/core";
import {
  Home as HomeIcon,
  NotificationsNone as NotificationsIcon,
  FormatSize as TypographyIcon,
  FilterNone as UIElementsIcon,
  BorderAll as TableIcon,
  QuestionAnswer as SupportIcon,
  LibraryBooks as LibraryIcon,
  HelpOutline as FAQIcon,
  ArrowBack as ArrowBackIcon,
} from "@material-ui/icons";
import { useTheme } from "@material-ui/styles";
import { withRouter } from "react-router-dom";
import classNames from "classnames";

// styles
import useStyles from "./styles";

// components
import SidebarLink from "./components/SidebarLink/SidebarLink";
import Dot from "./components/Dot";

// context
import {
  useLayoutState,
  useLayoutDispatch,
  toggleSidebar,
} from "../../context/LayoutContext";
import { ROLES_ENUM } from "../../constants";

const structure = [
  {
    id: 0,
    label: "Dashboard",
    link: "/app/dashboard",
    icon: <HomeIcon />,
    allowedRoles: [ROLES_ENUM.ADMINISTRATOR],
  },
  {
    id: 1,
    label: "Administrator",
    link: "/app/administrator",
    icon: <TypographyIcon />,
    allowedRoles: [ROLES_ENUM.ADMINISTRATOR],
  },
  {
    id: 2,
    label: "Owner",
    link: "/app/owner",
    icon: <NotificationsIcon />,
    allowedRoles: [ROLES_ENUM.OWNER, ROLES_ENUM.DEALER],
  },
  {
    id: 3,
    label: "Workshop",
    link: "/app/workshop",
    icon: <HomeIcon />,
    allowedRoles: [ROLES_ENUM.WORKSHOP],
  },
  // {
  //   id: 5,
  //   label: "Add Servicing Record",
  //   link: "/app/setSR",
  //   icon: <UIElementsIcon />,
  //   allowedRoles: [ROLES_ENUM.WORKSHOP],
  // },
  // {
  //   id: 6,
  //   label: "Insurance",
  //   link: "/app/insurance",
  //   icon: <UIElementsIcon />,
  //   allowedRoles: [ROLES_ENUM.INSURANCE],
  // },
  // {
  //   id: 7,
  //   label: "Misc (to be deleted)",
  //   link: "/app/misc",
  //   icon: <UIElementsIcon />,
  // },
];

const Sidebar = ({ location, role }) => {
  var classes = useStyles();
  var theme = useTheme();

  // global
  var { isSidebarOpened } = useLayoutState();
  var layoutDispatch = useLayoutDispatch();

  // local
  var [isPermanent, setPermanent] = useState(true);

  useEffect(function () {
    window.addEventListener("resize", handleWindowWidthChange);
    handleWindowWidthChange();
    return function cleanup() {
      window.removeEventListener("resize", handleWindowWidthChange);
    };
  });

  return (
    <Drawer
      variant={isPermanent ? "permanent" : "temporary"}
      className={classNames(classes.drawer, {
        [classes.drawerOpen]: isSidebarOpened,
        [classes.drawerClose]: !isSidebarOpened,
      })}
      classes={{
        paper: classNames({
          [classes.drawerOpen]: isSidebarOpened,
          [classes.drawerClose]: !isSidebarOpened,
        }),
      }}
      open={isSidebarOpened}
    >
      <div className={classes.toolbar} />
      <div className={classes.mobileBackButton}>
        <IconButton onClick={() => toggleSidebar(layoutDispatch)}>
          <ArrowBackIcon
            classes={{
              root: classNames(classes.headerIcon, classes.headerIconCollapse),
            }}
          />
        </IconButton>
      </div>
      <List className={classes.sidebarList}>
        {structure.map((link) => {
          // return (
          //   <SidebarLink
          //     key={link.id}
          //     location={location}
          //     isSidebarOpened={isSidebarOpened}
          //     {...link}
          //   />
          // );
          if (link.allowedRoles.indexOf(role) > -1) {
            return (
              <SidebarLink
                key={link.id}
                location={location}
                isSidebarOpened={isSidebarOpened}
                {...link}
              />
            );
          }
        })}
      </List>
    </Drawer>
  );

  // ##################################################################
  function handleWindowWidthChange() {
    var windowWidth = window.innerWidth;
    var breakpointWidth = theme.breakpoints.values.md;
    var isSmallScreen = windowWidth < breakpointWidth;

    if (isSmallScreen && isPermanent) {
      setPermanent(false);
    } else if (!isSmallScreen && !isPermanent) {
      setPermanent(true);
    }
  }
};

export default withRouter(Sidebar);
