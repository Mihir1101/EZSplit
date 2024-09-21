const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const Group = require("./../models/groupModel");
const User = require("./../models/userModel");

exports.createGroup = catchAsync(async (req, res, next) => {
  const { grpName, user } = req.body;
  const userId = (await User.findOne({ tgHandle: user }))._id;
  const grp = await Group.create({
    name: grpName,
    users: [userId],
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

exports.getGroupMembers = catchAsync(async (req, res, next) => {
  const grpName = req.params.grpName;
  const grp = await Group.findOne({ name: grpName });

  if (!grp) {
    return new AppError("user is not created yet", 404);
  }

  const users = grp.users;
  let members = [];
  for (const user_id of users) {
    const user = await User.findById(user_id);
    const name = user.name;
    const tgHandle = user.tgHandle;
    members.push({ name, tgHandle });
  }
  console.log(grpName, grp, members);

  res.status(200).json({
    status: "success",
    data: members,
  });
});

exports.updateGroup = catchAsync(async (req, res, next) => {
  const { user, grpName } = req.body;

  const grp = await Group.findOne({ name: grpName });
  const user_detail = await User.findOne({ tgHandle: user });

  if (!grp.users.includes(user_detail._id)) {
    let users = grp.users;
    users.push(user_detail._id);

    let grpUpdated = await Group.findByIdAndUpdate(grp._id, {
      users,
    });
    if (grpUpdated) {
      res.status(200).json({
        message: "success",
        data: grpUpdated,
      });
    } else {
      return new AppError("group not updated", 404);
    }
  } else {
    res.status(200).json({
      message: "already added in group",
      data: grp,
    });
  }
});
