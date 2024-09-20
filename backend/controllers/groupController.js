const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const Group = require("./../models/groupModel");

exports.createGroup = catchAsync(async (req, res, next) => {
  const { grpName } = req.body;
  const grp = await Group.create({
    name: grpName,
  });

  if (grp) {
    res.status(200).json({
      status: "success",
      data: grp,
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
