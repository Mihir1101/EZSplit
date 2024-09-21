const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const Expense = require("./../models/expenseModel");
const Group = require("../models/groupModel");
const User = require("../models/userModel");

exports.addExpense = catchAsync(async (req, res, next) => {
  const { addedByhandle, fromUserhandle, toUserhandle, amt, grpName } =
    req.body;

  //error handling for null condition
  const addedBy = (await User.findOne({ tgHandle: addedByhandle }))._id;
  const fromUser = (await User.findOne({ tgHandle: fromUserhandle }))._id;
  const toUser = (await User.findOne({ tgHandle: toUserhandle }))._id;
  const inGroup = (await Group.findOne({ name: grpName }))._id;
  const amount = Number(amt);
  if (fromUser == toUser) {
    return res.status(200).json({
      message: "cannot add expense ",
    });
  }

  // if (A,B) already exists
  const ex = await Expense.findOne({
    fromUser: fromUser,
    toUser: toUser,
    inGroup: inGroup,
  });

  // if (B,A) already exists
  const ex2 = await Expense.findOne({
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
      return res.status(200).json({
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

    let exUpdated = await Expense.findByIdAndUpdate(ex._id, updatedData, {
      new: true, // Returns the updated document
      runValidators: true, // Enforces schema validation
    });

    if (exUpdated) {
      return res.status(200).json({
        status: "success",
        data: exUpdated,
      });
    }
  } else {
    const group = await Group.findById(inGroup);
    const expense = await Expense.create({
      addedBy,
      fromUser,
      toUser,
      amount,
      inGroup,
    });
    const updatedExpenses = group.expenses;
    updatedExpenses.push(expense);
    const updatedGroup = {
      expenses: updatedExpenses,
    };

    const newGroup = await Group.findByIdAndUpdate(group._id, updatedGroup);
    if (expense) {
      return res.status(200).json({
        status: "success",
        data: expense,
      });
    }
  }

  return next(new AppError("expense not created", 404));
});

exports.addExpenseAll = catchAsync(async (req, res, next) => {
  //error handling for null condition
  const { addedByhandle, fromUserhandle, amount, grpName } = req.body;
  const addedBy = (await User.findOne({ tgHandle: addedByhandle }))._id;
  const fromUser = (await User.findOne({ tgHandle: fromUserhandle }))._id;
  const inGroup = (await Group.findOne({ name: grpName }))._id;

  const grp = await Group.findById(inGroup);
  const toUsers = grp.users;
  const n = grp.users.length;

  for (let user in toUsers) {
    if (user != fromUser) {
      const ex = await Expense.find({
        fromUser: fromUser,
        toUser: user,
        inGroup: inGroup,
      });
      const ex2 = await Expense.find({
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

        const exUpdated = await Expense.findByIdAndUpdate(ex._id, updatedData, {
          new: true, // Returns the updated document
          runValidators: true, // Enforces schema validation
        });

        expenses.push(exUpdated);
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

        let exUpdated = await Expense.findByIdAndUpdate(ex._id, updatedData, {
          new: true, // Returns the updated document
          runValidators: true, // Enforces schema validation
        });
      } else {
        const group = await Group.findById(inGroup);
        const expense = await Expense.create({
          addedBy,
          fromUser,
          toUser: user,
          amount,
          inGroup,
        });
        if (not(expense)) {
          return next(new AppError("expense not created!", 404));
        }
        const updatedExpenses = group.expenses;
        updatedExpenses.push(expense);
        const updatedGroup = {
          expenses: updatedExpenses,
        };

        const newGroup = await Group.findByIdAndUpdate(group._id, updatedGroup);
      }
    }
  }

  return res.status(200).json({
    status: "success",
    data: expenses,
  });
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
