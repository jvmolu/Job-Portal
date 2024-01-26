const express = require("express");
const router = express.Router();

const Auth_Controller = require("../Controllers/authController");

router.post("/signup", Auth_Controller.signUp);
router.post("/login", Auth_Controller.login);


module.exports = router;