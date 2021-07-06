const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const key = require("../config/key");

const validateUserReg = require("../validation/signUp");
const validateUserLogin = require("../validation/signIn");

const User = require("../models/user").users;

router.post("/signup", (req, res) => {
  const { errors, isValid } = validateUserReg(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      return res.status(400).json({
        email: "E-mail already exits",
      });
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then((user) => {
              res.json(user);
              // console.log(user);
            })
            .catch((err) => console.log(err));
        });
      });
    }
  });
});

router.post("/signin", (req, res) => {
  const { errors, isValid } = validateUserLogin(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email }).then((user) => {
    if (!user) {
      return res.status(404).json({
        emailNotFound: "E-mail not found",
      });
    }

    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        const payload = {
          name: user.name,
          email: user.email,
        };
        // console.log(payload);
        jwt.sign(
          payload,
          key.secret,
          {
            expiresIn: "1h",
          },
          (err, token) => {
            res.json({
              successful_login: true,
              token: "Bearer " + token,
            });
          }
        );
      } else {
        return res.status(400).json({
          passwordIncorrect: "Password incorrect",
        });
      }
    });
  });
});
module.exports = router;
