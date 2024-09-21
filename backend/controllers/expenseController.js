const Web3 = require("web3");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const Expense = require("./../models/expenseModel");
const Group = require("../models/groupModel");
const User = require("../models/userModel");
const group = require("../models/groupModel");
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
    let updatekdAmt = prevAmt - amount;
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
    const exps = await Expense.find({ inGroup: inGroup });
    const updatedgrps = { expenses: exps };
    await Group.findByIdAndUpdate(inGroup, updatedgrps);
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
  const { addedByhandle, fromUserhandle, amt, grpName } = req.body;
  const addedBy = (await User.findOne({ tgHandle: addedByhandle }))._id;
  const fromUser = (await User.findOne({ tgHandle: fromUserhandle }))._id;
  const inGroup = (await Group.findOne({ name: grpName }))._id;
  const amount = Number(amt);
  const grp = await Group.findById(inGroup);
  const toUsers = grp.users;
  const n = toUsers.length;

  for (const user of toUsers) {
    const userhandle = (await User.findById(user)).tgHandle;
    const fromhandle = (await User.findById(fromUser)).tgHandle;

    if (userhandle != fromhandle) {
      console.log(user, fromUser);
      const ex = await Expense.findOne({
        fromUser: fromUser,
        toUser: user,
        inGroup: inGroup,
      });
      const ex2 = await Expense.findOne({
        fromUser: user,
        toUser: fromUser,
        inGroup: inGroup,
      });
      if (ex) {
        let prevAmt = ex.amount;
        //console.log(prevAmt, amount);
        let updatedAmt = prevAmt + amount / n;
        const updatedData = {
          addedBy,
          fromUser,
          toUser: user,
          amount: updatedAmt,
          inGroup,
        };

        const exUpdated = await Expense.findByIdAndUpdate(ex._id, updatedData, {
          new: true, // Returns the updated document
          runValidators: true, // Enforces schema validation
        });
      } else if (ex2) {
        let prevAmt = ex2.amount;
        //console.log(amount, prevAmt);

        let updatedAmt = prevAmt - amount / n;
        console.log(updatedAmt);
        if (updatedAmt > 0) {
          const updatedData = {
            addedBy,
            toUser: user, //B
            fromUser, //A
            amount: updatedAmt,
            inGroup,
          };
          let exUpdated = await Expense.findByIdAndUpdate(
            ex2._id,
            updatedData,
            {
              new: true, // Returns the updated document
              runValidators: true, // Enforces schema validation
            }
          );
        } else if (updatedAmt == 0) {
          //remove the expense
          const deleted = await Expense.deleteOne({ _id: ex2._id });
          const exps = await Expense.find({ inGroup: inGroup });
          const updatedgrps = { expenses: exps };
          await Group.findByIdAndUpdate(inGroup, updatedgrps);
        } else {
          const deleted = await Expense.deleteOne({ _id: ex2._id });
          const exps = await Expense.find({ inGroup: inGroup });
          const updatedgrps = { expenses: exps };
          await Group.findByIdAndUpdate(inGroup, updatedgrps);

          updatedAmt = -1 * updatedAmt;
          const expense = await Expense.create({
            addedBy,
            fromUser,
            toUser: user,
            amount: updatedAmt,
            inGroup,
          });
          const exps2 = await Expense.find({ inGroup: inGroup });
          const updatedgrps2 = { expenses: exps2 };
          await Group.findByIdAndUpdate(inGroup, updatedgrps2);
        }
      } else {
        const updatedAmt = amount / n;
        const group = await Group.findById(inGroup);
        const expense = await Expense.create({
          addedBy,
          fromUser,
          toUser: user,
          amount: updatedAmt,
          inGroup,
        });
        const exps = await Expense.find({ inGroup: inGroup });
        const updatedgrps = { expenses: exps };
        await Group.findByIdAndUpdate(inGroup, updatedgrps);
      }
    }
  }
  const expenses = [];

  return res.status(200).json({
    status: "success",
    data: expenses,
  });
});

exports.getExpensesForGroup = catchAsync(async (req, res, next) => {
  const { grpName } = req.params;
  const grp = (await Group.findOne({ name: grpName })).populate("expenses");
  res.status(200).json({
    message: "success",
    data: grp.expenses,
  });
});

exports.getExpensesForGroupAndUser = catchAsync(async (req, res, next) => {
  const { grpName, tgHandle } = req.params;
  // console.log(grpName, tgHandle);
  const grp = await Group.findOne({ name: grpName });
  const user = await User.findOne({ tgHandle: tgHandle });
  // console.log(user);
  const expensesOfGroupAndUser = await Expense.find({
    inGroup: grp._id,
    toUser: user._id,
  });

  console.log(expensesOfGroupAndUser);

  let final_expenses = [];
  let owe = false;

  if (expensesOfGroupAndUser) {
    const promises = expensesOfGroupAndUser.map(async (expenses) => {
      // Wait for the user to be fetched
      const fromUser = await User.findById(expenses.fromUser);

      // Extract the necessary fields
      const { name, tgHandle } = fromUser;
      const amount = expenses.amount;

      // Push to the final_expenses array
      final_expenses.push({ name, tgHandle, amount, owe });
    });

    // Wait for all promises to resolve
    await Promise.all(promises);
  }

  // Now it's safe to log final_expenses
  console.log(final_expenses);

  const expensesOfGroupAndUser2 = await Expense.find({
    inGroup: grp._id,
    fromUser: user._id,
  });
  console.log(expensesOfGroupAndUser2);

  if (expensesOfGroupAndUser2) {
    owe = true;
    const promises = expensesOfGroupAndUser2.map(async (expenses) => {
      // Wait for the user to be fetched
      const toUser = await User.findById(expenses.toUser);

      // Extract the necessary fields
      const { name, tgHandle } = toUser;
      const amount = expenses.amount;

      // Push to the final_expenses array
      final_expenses.push({ name, tgHandle, amount, owe });
    });

    // Wait for all promises to resolve
    await Promise.all(promises);
  }

  console.log(final_expenses);

  res.status(200).json({
    message: "success",
    data: final_expenses,
  });
});

exports.settle = catchAsync(async (req, res, next) => {
  const { amt, to, grpname, tgHandle } = req.body;
  senderAddress = PROCESS.env.SENDER_ADDRESS;
  receiverAddress = PROCESS.env.RECEIVE_ADDRESS;
  senderPrivateKey = PROCESS.env.PRIVATE_KEY;
  valueToSend = amt;
  const nonce = await web3.eth.getTransactionCount(senderAddress, "latest"); // Get the nonce

  const tx = {
    from: senderAddress,
    to: receiverAddress,
    value: valueToSend,
    gas: 21000,
    nonce: nonce,
    chainId: 11155111, // Mainnet chain ID. Use 3 for Ropsten testnet, 5 for Goerli, etc.
  };

  const signedTransaction = await web3.eth.accounts.signTransaction(
    tx,
    senderPrivateKey
  );
  const rawTransaction = signedTransaction.rawTransaction;
  const receipt = await web3.eth.sendSignedTransaction(rawTransaction);
  console.log("Transaction successful with receipt:", receipt);
  
  const grp = await Group.findOne({name: grpname});
  const exps = await Expense.find({inGroup: group._id, })
});
