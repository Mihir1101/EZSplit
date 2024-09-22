const {
  addExpense,
  addExpenseAll,
  getExpensesForGroup,
  getExpensesForGroupAndUser,
  settle
} = require("./../controllers/expenseController");
const express = require("express");
const router = express.Router();

router.route("/get/:grpName/:tgHandle").get(getExpensesForGroupAndUser);
router.route("/get/:grpName").get(getExpensesForGroup);
router.route("/create").post(addExpense);
router.route("/create/all").post(addExpenseAll);
router.route("/settle").post(settle);

module.exports = router;
