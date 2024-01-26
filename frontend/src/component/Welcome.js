import { Grid, Typography } from "@material-ui/core";

const Welcome = (props) => {
  // const myStyle = {
  //   backgroundImage:
  //     "url('https://static.vecteezy.com/system/resources/previews/004/786/929/original/woman-sitting-with-laptop-concept-illustration-for-working-studying-education-work-from-home-healthy-lifestyle-can-use-for-backgrounds-infographics-hero-images-flat-illustration-vector.jpg')",
  //   height: "100vh",
  //   marginTop: "-50px",
  //   fontSize: "50px",
  //   backgroundSize: "cover",
  //   backgroundRepeat: "no-repeat",
  //   marginLeft: "-650px",
  // };
  return (
    // <div style={myStyle}>
    <Grid
      container
      item
      direction="row"
      alignItems="center"
      // position="fixed"
      justify="center"
      style={{
        padding: "30px",
        minHeight: "93vh",
        backgroundImage:
          "url('https://static.vecteezy.com/system/resources/previews/004/786/929/original/woman-sitting-with-laptop-concept-illustration-for-working-studying-education-work-from-home-healthy-lifestyle-can-use-for-backgrounds-infographics-hero-images-flat-illustration-vector.jpg')",
        height: "100vh",
        marginTop: "-100px",
        fontSize: "50px",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        marginLeft: "-650px",
      }}
    >
      <div
        style={{
          marginLeft: "1300px",
          marginTop: "80px",
        }}
      >
        <Grid item>
          <Typography variant="h2" align="center">
            Welcome to She Jobs
          </Typography>
        </Grid>
      </div>
    </Grid>
    // </div>
  );
};

export const ErrorPage = (props) => {
  return (
    <Grid
      container
      item
      direction="column"
      alignItems="center"
      justify="center"
      style={{ padding: "30px", minHeight: "93vh" }}
    >
      <Grid item>
        <Typography variant="h2">Error 404</Typography>
      </Grid>
    </Grid>
  );
};

export default Welcome;
