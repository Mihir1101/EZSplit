const {
  getUser,
  createUser,
  getUser2,
  getUserBalance,
} = require("./../controllers/userController.js");
const express = require("express");
const router = express.Router();

router.route("/createUser").post(createUser);
router.route("/ui/:accountAddr").get(getUser2);
router.route("/getUser/:tgHandle").get(getUser);
router.route("/getBalance/:tgHandle").get(getUserBalance);

module.exports = router;
