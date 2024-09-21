const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const User = require("./../models/userModel");

exports.createUser = catchAsync(async (req, res, next) => {
  const { name, tgHandle, multisigAddress, accountAddr, balance } = req.body;

  //create user in the database
  const user = await User.create({
    name,
    tgHandle,
    accountAddr,
    multisigAddress,
    balance,
  });

  if (user) {
    res.status(200).json({
      status: "success",
      data: user,
    });
  } else {
    return new AppError("user not created", 404);
  }
});

exports.getUser = catchAsync(async (req, res, next) => {
  const { tgHandle } = req.params;
  const user = await User.findOne({ tgHandle: tgHandle });
  if (!user) {
    return new AppError("user is not created  yet", 404);
  } else {
    res.status(200).json({
      status: "success",
      data: user,
    });
  }
});

exports.getUser2 = catchAsync(async (req, res, next) => {
  const { accountAddr } = req.params;
  const user = await User.findOne({ accountAddr: accountAddr });
  if (!user) {
    return new AppError("user is not created  yet", 404);
  } else {
    res.status(200).json({
      status: "success",
      data: user,
    });
  }
});

exports.getUserBalance = catchAsync(async (req, res, next) => {
  const { tgHandle } = req.params;
  const user = await User.findOne({ tgHandle: tgHandle });
  if (!user) {
    return new AppError("user is not created  yet", 404);
  } else {
    res.status(200).json({
      status: "success",
      data: user.balance,
    });
  }
});
