const { getUser, createUser } = require("./../controllers/userController.js");
const express = require("express");
const router = express.Router();

router.route("/createUser").post(createUser);
router.route("/getUser/:tgHandle").get(getUser);

module.exports = router;
