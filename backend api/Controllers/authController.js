const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const authKeys = {
  jwtSecretKey: "jwt_secret",
};

const User = require("../Models/UserModel");
const JobApplicant = require("../Models/JobApplicantModel");
const Recruiter = require("../Models/RecruiterModel");

const router = express.Router();

const signUp = (req, res) => {
  const data = req.body;
  let user = new User({
    email: data.email,
    password: data.password,
    type: data.type,
  });
  console.log(data);

  user
    .save()
    .then(() => {
      const userDetails =
        user.type == "recruiter"
          ? new Recruiter({
              userId: user._id,
              name: data.name,
              contactNumber: data.contactNumber,
              bio: data.bio,
            })
          : new JobApplicant({
              userId: user._id,
              name: data.name,
              education: data.education,
              skills: data.skills,
              rating: data.rating,
              resume: data.resume,
            profile: data.profile,
            gapYear: data.workGap,
            gapReason: data.workGapReason,
            });

      userDetails
        .save()
        .then(() => {
          
          const token = jwt.sign({ _id: user._id }, authKeys.jwtSecretKey);
          res.json({
            token: token,
            type: user.type,
          });
        })
        .catch((err) => {
          user
            .delete()
            .then(() => {
              res.status(400).json(err);
            })
            .catch((err) => {
              res.json({ error: err });
            });
          err;
        });
    })
    .catch((err) => {
      res.status(400).json(err);
    });
}

const login =  (req, res, next) => {
  passport.authenticate(
    "local",
    { session: false },
    function (err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        res.status(401).json(info);
        return;
      }
      // Token
      const token = jwt.sign({ _id: user._id }, authKeys.jwtSecretKey);
      res.json({
        token: token,
        type: user.type,
      });
    }
  )(req, res, next);
}

const Auth_Controller = { signUp, login };

module.exports = Auth_Controller;
