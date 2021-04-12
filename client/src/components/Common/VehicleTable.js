import React from "react";
import TableCard from "../../components/Common/Table";
import { vehicleColumns } from "../../constants";
import { Grid, Button } from "@material-ui/core";
import { useHistory } from "react-router-dom";

const VehicleTable = ({ userVehicles }) => {
  const history = useHistory();

  const viewVehicle = (data) => {
    console.log("data =", data);
    history.push(`/app/vehicle/${data.vehicleId}`);
  };
  return (
    <TableCard
      data={userVehicles}
      title={"Vehicles Data"}
      columns={[
        "vehicleId",
        ...vehicleColumns.details1,
        ...vehicleColumns.details1p2,
        ...vehicleColumns.details2,
      ]}
      cardWidth={"100%"}
      viewData={viewVehicle}
    />
  );
};

export default VehicleTable;
