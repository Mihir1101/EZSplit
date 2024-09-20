const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const Expense = require("./../models/expenseModel");
const Group = require("../models/groupModel");
const User = require("../models/userModel");

exports.addExpense = catchAsync(async (req, res, next) => {
  const { addedByhandle, fromUserhandle, toUserhandle, amount, grpName } =
    req.body;
  const addedBy = await User.findOne({ tgHandle: addedByhandle })._id;
  const fromUser = await User.findOne({ tgHandle: fromUserhandle })._id;
  const toUser = await User.findOne({ tgHandle: toUserhandle })._id;
  const inGroup = await Group.findOne({ name: grpName })._id;
  if (fromUser == toUser) {
    res.status(200).json({
      message: "cannot add expense ",
    });
  }
  // if (A,B) already exists
  let ex = await Expense.find({
    fromUser: fromUser,
    toUser: toUser,
    inGroup: inGroup,
  });

  // if (B,A) already exists
  let ex2 = await Expense.find({
    fromUser: toUser,
    toUser: fromUser,
    inGroup: inGroup,
  });

  if (ex) {
    let prevAmt = ex.amount;
    let updatedAmt = prevAmt + amount;
    const updatedData = {
      addedBy,
      fromUser,
      toUser,
      amount: updatedAmt,
      inGroup,
    };

    let exUpdated = await Expense.findByIdAndUpdate(ex._id, updatedData, {
      new: true, // Returns the updated document
      runValidators: true, // Enforces schema validation
    });

    if (exUpdated) {
      res.status(200).json({
        status: "success",
        data: exUpdated,
      });
    }
  } else if (ex2) {
    let prevAmt = ex2.amount;
    let updatedAmt = prevAmt - amount;
    const updatedData = {
      addedBy,
      toUser, //B
      fromUser, //A
      amount: updatedAmt,
      inGroup,
    };

    let ex = await Expense.findByIdAndUpdate(ex._id, updatedData, {
      new: true, // Returns the updated document
      runValidators: true, // Enforces schema validation
    });

    if (ex) {
      res.status(200).json({
        status: "success",
        data: ex,
      });
    }
  } else {
    const expense = await Expense.create({
      addedBy,
      fromUser,
      toUser,
      amount,
      inGroup,
    });

    if (expense) {
      res.status(200).json({
        status: "success",
        data: expense,
      });
    }
  }

  return new AppError("expense not created", 404);
});

exports.addExpenseAll = catchAsync(async (req, res, next) => {
  const { addedByhandle, fromUserhandle, amount, grpName } = req.body;
  const addedBy = await User.findOne({ tgHandle: addedByhandle })._id;
  const fromUser = await User.findOne({ tgHandle: fromUserhandle })._id;
  const inGroup = await Group.findOne({ name: grpName })._id;
  //create expense in the database
  let expenses = [];

  const grp = await Group.findById(inGroup);
  const toUsers = grp.users;
  const n = grp.users.length;

  for (let user in toUsers) {
    if (user != fromUser) {
      let ex = await Expense.find({
        fromUser: fromUser,
        toUser: user,
        inGroup: inGroup,
      });
      let ex2 = await Expense.find({
        fromUser: user,
        toUser: fromUser,
        inGroup: inGroup,
      });
      if (ex) {
        let prevAmt = ex.amount;
        let updatedAmt = prevAmt + amount / n;
        const updatedData = {
          addedBy,
          fromUser,
          user,
          amount: updatedAmt,
          inGroup,
        };

        let ex = await Expense.findByIdAndUpdate(ex._id, updatedData, {
          new: true, // Returns the updated document
          runValidators: true, // Enforces schema validation
        });

        expenses.push(ex);
      } else if (ex2) {
        let prevAmt = ex2.amount;
        let updatedAmt = prevAmt - amount;
        const updatedData = {
          addedBy,
          user, //B
          fromUser, //A
          amount: updatedAmt,
          inGroup,
        };

        let ex = await Expense.findByIdAndUpdate(ex._id, updatedData, {
          new: true, // Returns the updated document
          runValidators: true, // Enforces schema validation
        });
      } else {
        const expense = await Expense.create({
          addedBy,
          fromUser,
          toUser: user,
          amount,
          inGroup,
        });
        expenses.push(expense);
      }
    }
  }

  if (expenses) {
    res.status(200).json({
      status: "success",
      data: expenses,
    });
  } else {
    return new AppError("expense not created", 404);
  }
});

exports.getExpensesForGroup = catchAsync(async (req, res, next) => {
  const { grpName } = req.params;
  const grp = await Group.findOne({ name: grpName }).populate("expenses");
  res.status(200).json({
    message: "success",
    data: grp.expenses,
  });
});

exports.getExpensesForGroupAndUser = catchAsync(async (req, res, next) => {
  const { grpName, tgHandle } = req.params;
  const userId = await User.findOne({ tgHandle })._id;
  const expensesOfGroupAndUser = await Expense.findOne({
    name: grpName,
    toUser: userId,
  });

  res.status(200).json({
    message: "success",
    data: expensesOfGroupAndUser,
  });
});

//add transaction
exports.settleExpense = catchAsync(async (req, res, next) => {});
