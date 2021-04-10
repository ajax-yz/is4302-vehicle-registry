import {
  Button,
  Card,
  CardContent,
  Grid,
  Table,
  TableCell,
  TableRow,
  TableContainer,
  TableBody,
  Paper,
  TableHead,
} from "@material-ui/core";
import MUIDataTable from "mui-datatables";
import React from "react";

// clickrow can be any function that requires an action (eg. delete/acknowledge row)
const TableCard = ({
  data,
  title,
  columns,
  cardWidth,
  clickRow,
  hasDelete,
  hasAck,
}) => {
  const tableData = data.map((row) => Object.values(row));
  const tableColumns = columns.map((key) => {
    const headerName = key[0].toUpperCase() + key.substring(1);
    return {
      name: headerName,
    };
  });
  if (hasDelete) {
    // if usecase requires user to be able to delete rows
    tableColumns.push({
      name: "Action",
      options: {
        customBodyRender: (row) => {
          const onClick = () => {
            clickRow(row);
          };
          return (
            <Button variant="outlined" color="secondary" onClick={onClick}>
              Delete
            </Button>
          );
        },
      },
    });
  }

  if (hasAck) {
    // if usecase requires user to be able to acknowledge rows
    tableColumns.push({
      name: "Action",
      options: {
        customBodyRender: (row) => {
          const onClick = () => {
            clickRow(row);
          };
          return (
            <Button variant="contained" color="primary" onClick={onClick}>
              Mark as verified
            </Button>
          );
        },
      },
    });
  }

  return (
    <Grid item style={{ width: cardWidth }}>
      <MUIDataTable
        title={
          <div style={{ fontWeight: "bold", fontSize: "18px" }}>{title}</div>
        }
        data={tableData}
        columns={tableColumns}
        options={{ selectableRowsHideCheckboxes: true }}
      />
    </Grid>
  );
};

export default TableCard;
