const express = require("express");
const router = express.Router();
const axios = require("axios");
const Property = require("../models/property").Property;
const Comment = require("../models/property").Comment;
const sentimentAPI = require("../config/key").sentimentAPI;

// Add Property
router.post("/addprop", (req, res) => {
  Property.findOne({ uid: req.body.uid }).then((property) => {
    if (property) {
      return res.status(400).json({
        uid: "Property already exists",
      });
    } else {
      const newProperty = new Property({
        uid: req.body.uid,
        code: req.body.code,
        name: req.body.name,
        location: req.body.location,
        comments: [],
      });
      newProperty
        .save()
        .then((property) => res.json(property))
        .catch((err) => console.log(err));
    }
  });
});

// All the property
router.post("/getprop", (req, res) => {
  Property.find()
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

// Add Comments
router.post("/addcomment", (req, res) => {
  var dup = 0;

  Property.findOne({ uid: req.body.uid }, (err, property) => {
    var rating_final;
    var score = 0;
    var count = 0;
    async function getRating() {
      return axios
        .post(sentimentAPI, {
          comment: req.body.comment,
        })
        .then((result) => {
          return result.data.comment_code;
        })
        .catch((err) => {
          res.send(err);
        });
    }
    async function setRating() {
      rating_final = await getRating();
      let comment = new Comment({
        comment: req.body.comment,
        email: req.body.email,
        rating: rating_final,
      });

      if (property.comments == null) {
        property.comments = [comment];
      }
      property.comments.forEach((comment) => {
        count++;
        if (comment.rating === 1) {
          score++;
        }
        if (comment.email === req.body.email) {
          dup++;
        }
      });
      dup > 0
        ? res.send({ err: "Already commented" })
        : property.comments.push(comment);

      if (count >= 0) {
        (property.prop_rating =
          ((score + rating_final) / (count + 1)) * 100).toFixed(2);
      } else {
        property.prop_rating = 0;
      }

      property
        .save()
        .then((prop) =>
          res.send({
            success: true,
          })
        )
        .catch((err) => console.log(err));
    }
    setRating();
  });
});

router.post("/getRating", (req, res) => {
  Property.findOne({ uid: req.body.uid }, (err, property) => {
    if (!property) {
      return res.send({
        err: "Nothing to display",
      });
    } else {
      // ratings = property.prop_rating.toString();
      return res.send({
        rating: property.prop_rating,
      });
    }
  });
});
// Delete Comments
router.post("/deletecomment", (req, res) => {
  Property.findOne({ uid: req.body.uid }, (err, property) => {
    var rating_to_be_deleted;
    var score = 0;
    var count = 0;

    if (property.comments == null) {
      return res.send({
        err: "No comment to delete",
      });
    }
    property.comments.forEach((cmt) => {
      count++;
      if (cmt.rating === 1) {
        score++;
      }
      if (cmt.email == req.body.email) {
        rating_to_be_deleted = cmt.rating;
        if (count <= 1) {
          property.prop_rating = 0;
        }
        if (count === 1);
        property.prop_rating = (
          ((score - rating_to_be_deleted) / count) *
          100
        ).toFixed(2);
        if (count > 1) {
          property.prop_rating = (
            ((score - rating_to_be_deleted) / (count - 1)) *
            100
          ).toFixed(2);
        }
      }
    });
    property.comments.forEach((comment) => {
      property.comments = property.comments.filter((ele) => {
        if (ele.email == req.body.email) {
          return false;
        } else return true;
      });

    });
    property
      .save()
      .then((result) =>
        res.send({
          success: true,
        })
      )
      .catch((err) => console.log(err));
  });
});
// Get Comments
router.post("/getcomment", (req, res) => {
  Property.findOne({ uid: req.body.uid }, (err, property) => {
    if (!property) {
      return res.send({
        err: "No such property exists",
      });
    } else {
      return res.send(property.comments);
    }
  });
});

// Get user's comment

router.post("/getusercomment", (req, res) => {
  let target = [];
  Property.findOne({ uid: req.body.uid }, (err, property) => {
    if (!property) {
      return;
    }

    property.comments.forEach((e) => {
      if (e.email == req.body.email) {
        target.push(e);
      }
    });

    if (target.length == 0) {
      return;
    } else {
      return res.send(target[0].comment);
    }
  });
});

module.exports = router;
