import { useContext, useState } from "react";
import {
  Grid,
  TextField,
  Button,
  Typography,
  makeStyles,
  Paper,
} from "@material-ui/core";
import axios from "axios";
import { Redirect } from "react-router-dom";

import PasswordInput from "../lib/PasswordInput";
import EmailInput from "../lib/EmailInput";
import { SetPopupContext } from "../App";

import apiList from "../lib/apiList";
import isAuth from "../lib/isAuth";
import "./Login.css";

const useStyles = makeStyles((theme) => ({
  // backgroundImage:
  //   "url('http://www.clker.com/cliparts/4/8/8/9/1516741003903724436woman-working-hard-clipart.hi.png')",
  // height: "100vh",
  // marginTop: "-70px",
  // fontSize: "50px",
  // backgroundSize: "cover",
  // backgroundRepeat: "no-repeat",
  body: {
    width: "400px",
    marginLeft: "120px",
    height: "80vh",
    backgroundSize: "contain",
    backgroundImage: `url("http://www.clker.com/cliparts/4/8/8/9/1516741003903724436woman-working-hard-clipart.hi.png")`,
    backgroundRepeat: "no-repeat",
  },
  inputBox: {
    width: "280px"
  },
  submitButton: {
    width: "280px",
  },
  loginBox: {
    marginTop: "80px",
    marginRight: "100px",
  },
}));

const Login = (props) => {
  const classes = useStyles();
  const setPopup = useContext(SetPopupContext);

  const [loggedin, setLoggedin] = useState(isAuth());

  const [loginDetails, setLoginDetails] = useState({
    email: "",
    password: "",
  });

  const [inputErrorHandler, setInputErrorHandler] = useState({
    email: {
      error: false,
      message: "",
    },
    password: {
      error: false,
      message: "",
    },
  });

  const handleInput = (key, value) => {
    setLoginDetails({
      ...loginDetails,
      [key]: value,
    });
  };

  const handleInputError = (key, status, message) => {
    setInputErrorHandler({
      ...inputErrorHandler,
      [key]: {
        error: status,
        message: message,
      },
    });
  };

  const handleLogin = () => {
    const verified = !Object.keys(inputErrorHandler).some((obj) => {
      return inputErrorHandler[obj].error;
    });
    if (verified) {
      axios
        .post(apiList.login, loginDetails)
        .then((response) => {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("type", response.data.type);
          setLoggedin(isAuth());
          setPopup({
            open: true,
            severity: "success",
            message: "Logged in successfully",
          });
          console.log(response);
        })
        .catch((err) => {
          setPopup({
            open: true,
            severity: "error",
            message: err.response.data.message,
          });
          console.log(err.response);
        });
    } else {
      setPopup({
        open: true,
        severity: "error",
        message: "Incorrect Input",
      });
    }
  };

  return loggedin ? (
    <Redirect to="/" />
  ) : (
    <Grid container>
      <Grid item xs={6} className={classes.body}></Grid>
      <Grid item xs={3} className={classes.loginBox}>
        <Paper elevation={3}>
          <Grid container direction="column" spacing={4} alignItems="center">
            <Grid item>
              <Typography variant="h3" component="h2">
                Login
              </Typography>
            </Grid>
            <Grid item>
              <EmailInput
                label="Email"
                value={loginDetails.email}
                onChange={(event) => handleInput("email", event.target.value)}
                inputErrorHandler={inputErrorHandler}
                handleInputError={handleInputError}
                className={classes.inputBox}
              />
            </Grid>
            <Grid item>
              <PasswordInput
                label="Password"
                value={loginDetails.password}
                onChange={(event) =>
                  handleInput("password", event.target.value)
                }
                className={classes.inputBox}
              />
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleLogin()}
                className={classes.submitButton}
              >
                Login
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Login;
