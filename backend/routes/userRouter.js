const {
  getUser,
  createUser,
  getUser2,
} = require("./../controllers/userController.js");
const express = require("express");
const router = express.Router();

router.route("/createUser").post(createUser);
router.route("/getUser/:tgHandle").get(getUser);
router.route("/getUser/ui/:accountAddr").get(getUser2);

module.exports = router;
