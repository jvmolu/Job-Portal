const passport = require("passport");

const jwtAuth = (req, res, next) => {
  console.log("jwtAuth");
  passport.authenticate("jwt", { session: false }, function (err, user, info) {
    if (err) {
      console.log(err);
      return next(err);
    }
    if (!user) {
      console.log(info);
      res.status(401).json(info);
      return;
    }
    req.user = user;
    next();
  })(req, res, next);
};

module.exports = jwtAuth;
