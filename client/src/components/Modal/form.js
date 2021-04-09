import { Button, Grid, Modal, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useState, useEffect } from "react";

const useStyles = makeStyles((theme) => ({
  paper: {
    position: "relative",
    width: "50%",
    display: "flex",
    flexDirection: "column",
    // border: "2px solid #000",
    // backgroundColor: theme.palette.background.paper,
    maxHeight: "600px",
    backgroundColor: "white",
    justifyContent: "space-between",
    // padding: theme.spacing(2, 4, 3),
  },
}));

const ModalForm = ({ visible, toggleVisible, onSubmit, keys, title }) => {
  const classes = useStyles();
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const formD = {};
    keys.map((key) => {
      formD[key] = "";
    });
    setFormData(formD);
  }, [keys]);
  return (
    <div>
      test
      <Modal
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          outline: "none",
        }}
        open={visible}
        onClose={toggleVisible}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div className={classes.paper}>
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              padding: "20px",
              borderBottom: "1px solid #e8e8e8",
            }}
          >
            {title}
          </div>
          <div style={{ overflow: "auto", padding: "20px" }}>
            {keys.map((key, i) => {
              const label = key[0].toUpperCase() + key.substring(1);
              return (
                <Grid container key={key} style={{ marginBottom: "8px" }}>
                  <Grid
                    item
                    xs={12}
                    sm={3}
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      paddingRight: "8px",
                      fontWeight: "300",
                      fontSize: "18px",
                    }}
                  >
                    {label}:
                  </Grid>
                  <Grid item xs={12} sm={9}>
                    <TextField
                      value={formData[key]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [key]: e.target.value,
                        })
                      }
                      placeholder={label}
                      type="text"
                      fullWidth
                    />
                  </Grid>
                </Grid>
              );
            })}
          </div>

          <div
            style={{
              display: "flex",
              padding: "20px",
              justifyContent: "flex-end",
            }}
          >
            <Button variant="outlined" color="default" onClick={toggleVisible}>
              Cancel
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={() => onSubmit(formData)}
            >
              Submit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ModalForm;
