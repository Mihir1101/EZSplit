const {
  getGroup,
  createGroup,
  updateGroup,
} = require("./../controllers/groupController");
const express = require("express");
const router = express.Router();

router.route("/getGroup/:grpName").get(getGroup);
router.route("/createGroup").post(createGroup);
router.route("/updateGroup").patch(updateGroup); // send user tgHandle to add in the group

module.exports = router;
