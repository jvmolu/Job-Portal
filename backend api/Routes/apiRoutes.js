const express = require("express");
const router = express.Router();

const Api_Controller = require("../Controllers/apiController");
const jwtAuth = require("../lib/jwtAuth");

// console.log("apiRoutes.js");
router.post("/jobs", jwtAuth, Api_Controller.postJobs);
router.get("/jobs", jwtAuth, Api_Controller.getJobs);
router.get("/jobs/:id", jwtAuth, Api_Controller.getJobById);
router.put("/jobs/:id", jwtAuth, Api_Controller.updateJobById);
router.delete("/jobs/:id", jwtAuth, Api_Controller.deleteJobById);
router.get("/user", jwtAuth, Api_Controller.getUser);
router.get("/user/:id", jwtAuth, Api_Controller.getUserById);
router.put("/user", jwtAuth, Api_Controller.updateUser);
router.post("/jobs/:id/applications", jwtAuth, Api_Controller.postJobApplicationsById);
router.get("/jobs/:id/applications", jwtAuth, Api_Controller.getJobApplicationsById);
router.get("/applications", jwtAuth, Api_Controller.getApplications);
router.put("/applications/:id", jwtAuth, Api_Controller.updateApplicationById);
router.get("/applicants", jwtAuth, Api_Controller.getApplicants);
router.put("/rating", jwtAuth, Api_Controller.updateRating);
router.get("/rating", jwtAuth, Api_Controller.getRating);
router.post("/training", Api_Controller.postTraining);
router.get("/training", jwtAuth, Api_Controller.getTraining);


module.exports = router;
