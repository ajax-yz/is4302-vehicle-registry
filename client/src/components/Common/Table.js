import { Button, Grid } from "@material-ui/core";
import MUIDataTable from "mui-datatables";
import React from "react";

// clickrow can be any function that requires an action (eg. delete/acknowledge row)
const TableCard = ({
  data,
  title,
  columns,
  cardWidth,
  clickRow,
  hasAck,
  deleteData,
  viewData,
  extraComponent,
  rowsPerPage = 5,
}) => {
  const tableData = data.map((row) => Object.values(row));
  const booleanKeys = ["isDealer"];
  const tableColumns = columns.map((key) => {
    const headerName = key[0].toUpperCase() + key.substring(1);
    if (booleanKeys.indexOf(key) != -1) {
      return {
        name: headerName,
        options: {
          customBodyRender: (row, dataIndex, rowIndex) => {
            return <span>{row ? "TRUE" : "FALSE"}</span>;
          },
        },
      };
    }
    return {
      name: headerName,
    };
  });
  if (deleteData || hasAck || viewData) {
    // if usecase requires user to be able to delete rows
    tableColumns.push({
      name: "Action",
      options: {
        customBodyRenderLite: (row) => {
          const onClick = () => {
            clickRow(row);
          };
          return (
            <>
              {deleteData ? (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => deleteData(data[row])}
                >
                  Delete
                </Button>
              ) : null}
              {hasAck ? (
                <Button variant="contained" color="primary" onClick={onClick}>
                  Mark as verified
                </Button>
              ) : null}
              {viewData ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => viewData(data[row])}
                >
                  View
                </Button>
              ) : null}
            </>
          );
        },
      },
    });
  }

  const toolbar = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "24px",
        }}
      >
        <div style={{ fontWeight: "bold", fontSize: "18px" }}>{title}</div>
        {extraComponent}
      </div>
    );
  };
  return (
    <Grid item style={{ width: cardWidth }}>
      <MUIDataTable
        icons={null}
        components={{ TableToolbar: toolbar }}
        data={tableData}
        columns={tableColumns}
        options={{
          selectableRowsHideCheckboxes: true,
          rowsPerPage,
          rowsPerPageOptions: [5, 10],
        }}
      />
    </Grid>
  );
};

export default TableCard;
