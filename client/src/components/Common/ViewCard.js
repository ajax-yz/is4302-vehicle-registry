import React from "react";
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

const ViewCard = ({ data, title, extraComponent }) => {
  const keys = Object.keys(data);
  return (
    <Grid item style={{ width: "100%" }}>
      <Card style={{ width: "100%", minHeight: "284px" }}>
        <CardContent>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                padding: "4px ​4px 14px 4px",
                borderBottom: "1px solid #e8e8e8",
                marginBottom: "12px",
              }}
            >
              {title}
            </div>

            {extraComponent}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", width: "100%" }}>
            {keys.map((key, i) => {
              const label = key[0].toUpperCase() + key.substring(1);
              return (
                <div
                  key={i}
                  style={{
                    marginTop: "8px",
                    marginBottom: "20px",
                    width: "50%",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      // padding: "4px 0px",
                    }}
                  >
                    {label}
                  </div>
                  <div style={{ paddingLeft: "0px" }}>
                    {data[key]?.toString()}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default ViewCard;
