const {
  createGroup,
  updateGroup,
  getGroupMembers,
} = require("./../controllers/groupController");
const express = require("express");
const router = express.Router();

router.route("/getGroup/:grpName").get(getGroupMembers);
router.route("/createGroup").post(createGroup);
router.route("/updateGroup").patch(updateGroup); // send user tgHandle to add in the group

module.exports = router;
