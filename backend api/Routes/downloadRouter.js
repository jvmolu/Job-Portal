const express = require("express");
const router = express.Router();

const Download_Controller = require("../Controllers/downloadController");

router.get("/resume/:file", Download_Controller.getResume);
router.get("/profile/:file", Download_Controller.getprofile);

module.exports = router;