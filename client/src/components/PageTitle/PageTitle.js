import React from "react";

// styles
import useStyles from "./styles";

// components
import { Typography } from "../Wrappers";

export default function PageTitle(props) {
  var classes = useStyles();

  return (
    <div className={classes.pageTitleContainer}>
      <div style={{ display: "flex", alignItems: "center" }}>
        {props.backButton && props.backButton}
        <Typography className={classes.typo} variant="h1" size="sm">
          {props.title}
        </Typography>
      </div>
      {props.button && props.button}
    </div>
  );
}
