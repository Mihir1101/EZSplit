const {
  getGroup,
  createGroup,
  updateGroup,
} = require("./../controllers/groupController");
const express = require("express");
const router = express.Router();

router.route("/createGroup").post(createGroup);
router.route("/updateGroup").patch(updateGroup); // send user tgHandle to add in the group
router.route("/getGroup/:grpName").get(getGroup);

module.exports = router;
