const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const Group = require("./../models/groupModel");
const User = require("./../models/userModel");

exports.createGroup = catchAsync(async (req, res, next) => {
  const { grpName, user } = req.body;
  user = (await User.findOne({ tgHandle: user }))._id;
  const grp = await Group.create({
    name: grpName,
    users: [user],
  });

  if (grp) {
    return res.status(200).json({
      status: "success",
      data: grp,
    });
  } else {
    return next(new AppError("group not created", 404));
  }
});

exports.getGroup = catchAsync(async (req, res, next) => {
  const grpName = req.params.grpName;
  const grp = await Group.findOne({ name: grpName }).populate(
    "users",
    "expenses"
  );
  if (!grp) {
    return next(new AppError("user is not created yet", 404));
  }

  return res.status(200).json({
    status: "success",
    data: grp,
  });
});

exports.updateGroup = catchAsync(async (req, res, next) => {
  const { user } = req.body;
  const grpName = req.params.grpName;

  const grp = await Group.findOne({ name: grpName });
  user = await User.findOne({ tgHandle: user });

  let users = grp.users;
  users.push(user._id);

  let grpUpdated = await Group.findByIdAndUpdate(grp._id, {
    users,
  });
  if (grpUpdated) {
    return res.status(200).json({
      message: "success",
      data: grpUpdated,
    });
  } else {
    return next(new AppError("group not updated", 404));
  }
});
