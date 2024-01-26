const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passportConfig = require("./lib/passportConfig");
const cors = require("cors");
const fs = require("fs");

// MongoDB
mongoose
  .connect("mongodb://localhost:27017/vmWareCodeHouse", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then((res) => console.log("Connected to Mongo DB"))
  .catch((err) => console.log(err));

// initialising directories
if (!fs.existsSync("./public")) {
  fs.mkdirSync("./public");
}
if (!fs.existsSync("./public/resume")) {
  fs.mkdirSync("./public/resume");
}
if (!fs.existsSync("./public/profile")) {
  fs.mkdirSync("./public/profile");
}

const app = express();
const port = 4444;

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Setting up middlewares
app.use(cors());
app.use(express.json());
app.use(passportConfig.initialize());

// Routing
app.use("/auth", require("./routes/authRouters"));
app.use("/api", require("./routes/apiRoutes"));
app.use("/upload", require("./routes/uploadRouter"));
app.use("/host", require("./routes/downloadRouter"));

app.listen(port, () => {
  console.log(`Server started on port ${port}!`);
});
