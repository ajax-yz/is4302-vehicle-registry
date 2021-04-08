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
const UserInfo = ({ userData, title }) => {
  const keys = Object.keys(userData);
  return (
    <Card title={"Welcome back"} style={{ width: "100%" }}>
      <CardContent>
        <div
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            padding: "4px ​4px 14px 4p",
            borderBottom: "1px solid #e8e8e8",
            marginBottom: "12px",
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", width: "100%" }}>
          {keys.map((key) => {
            const label = key[0].toUpperCase() + key.substring(1);
            return (
              <div style={{ marginBottom: "12px", width: "50%" }}>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 500,
                    padding: "4px 0px",
                  }}
                >
                  {label}
                </div>
                {userData[key]}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserInfo;
