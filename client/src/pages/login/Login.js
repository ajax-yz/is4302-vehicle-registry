// import { useSelector } from 'react-redux';
import {
  Grid
} from "@material-ui/core";
import React from "react";
// styles
import useStyles from "./styles";


const Login = (props) => {
  var classes = useStyles();
  const { isLoggedIn } = props;
  return (
    <Grid container className={classes.container}>
      
      <div className="pure-g" className={classes.loginContainer}>
        <div style={{width: '30%'}}>
          <div style={{display: 'flex', justifyContent: 'center', fontSize: '32px'}}>🦊</div>
          <h3>
            <div style={{display: 'flex', justifyContent: 'center'}}><strong>{"We can't find any Ethereum accounts!"}</strong></div>
            <div style={{display: 'flex', justifyContent: 'center', textAlign: 'center'}}>
              {!isLoggedIn?
                "Please log in to your wallet on Metamask."
              :
                "Please check and make sure Metamask or your browser Ethereum wallet is pointed at the correct network and your account is unlocked. Please also check that your account has been registered on our Vehicle Registry Network."
              }
            </div>
          </h3>
        </div>
      </div>
    </Grid>
  );
}

export default Login;
