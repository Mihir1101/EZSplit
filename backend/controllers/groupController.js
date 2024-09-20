const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const Group = require("./../models/groupModel");

exports.createGroup = catchAsync(async (req, res, next) => {
  //create user in the database
  const user = await User.create({
    name: name,
    tgHandle: tgHandle,
    multisigAddress: safeAddress,
  });

  if (user) {
    res.status(200).json({
      status: "success",
      data: user,
    });
  }
  return new AppError("user not created", 404);
});

exports.getGroup = catchAsync(async (req, res, next) => {
  const grpName = req.params.grpName;
  const grp = await Group.findOne({ name: grpName }).populate(
    "users",
    "expenses"
  );
  if (!grp) {
    return new AppError("user is not created  yet", 404);
  }

  res.status(200).json({
    status: "success",
    data: grp,
  });
});

exports.updateGroup = catchAsync(async (req, res, next) => {
  const { user } = req.body;
});
