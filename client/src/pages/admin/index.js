import React from "react";
import { ContractData, ContractForm } from "drizzle-react-components";
import {
  Grid,
  LinearProgress,
  Select,
  OutlinedInput,
  MenuItem,
  Button,
} from "@material-ui/core";
import PageTitle from "../../components/PageTitle/PageTitle";

const AdminPage = () => {
  return (
    <>
      <PageTitle
        title="Admin"
        button={
          <Button variant="contained" size="medium" color="secondary">
            Latest Reports
          </Button>
        }
      />
    </>
  );
};

export default AdminPage;
