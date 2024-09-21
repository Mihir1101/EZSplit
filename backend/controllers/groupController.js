const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const Group = require("./../models/groupModel");
const User = require("./../models/userModel");

exports.createGroup = catchAsync(async (req, res, next) => {
  const { grpName, users } = req.body;
  const final_users = [];

  for (const userName of users) {
    const user = await User.findOne({ tgHandle: userName });
    if (user) {
      const user_id = user._id;
      //console.log(user_id, user.name);
      final_users.push(user_id);
    }
  }
  const grp = await Group.create({
    name: grpName,
    users: final_users,
  });

  if (grp) {
    res.status(200).json({
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
    return next(new AppError("user is not created  yet", 404));
  }

  res.status(200).json({
    status: "success",
    data: grp,
  });
});

exports.updateGroup = catchAsync(async (req, res, next) => {
  const { user } = req.body;
});
