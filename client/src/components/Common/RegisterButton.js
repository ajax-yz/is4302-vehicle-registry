// Drizzle
import { drizzleReactHooks } from "@drizzle/react-plugin";
import { Button } from "@material-ui/core";
import React, { useState } from "react";
// components
import ModalForm from "./ModalForm";

// End of Drizzle

const { useDrizzle, useDrizzleState } = drizzleReactHooks;

const RegisterButton = ({ submitRegister, registerText, keys }) => {
  const [visible, setVisible] = useState(false);
  const { drizzle } = useDrizzle();

  const registerSubmit = async (data) => {
    const body1 = {};
    keys.map((key) => {
      body1[key] = data[key];
    });

    const resp = await submitRegister(body1);
    if (resp) {
      console.log("submit =", resp);
      setVisible(false);
    }
  };

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setVisible(!visible)}
      >
        {registerText}
      </Button>

      <ModalForm
        title={registerText}
        visible={visible}
        toggleVisible={() => setVisible(!visible)}
        onSubmit={registerSubmit}
        keys={keys}
      />
    </div>
  );
};

export default RegisterButton;
