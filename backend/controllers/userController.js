const { SafeFactory, SafeAccountConfig } = require("@safe-global/protocol-kit");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const User = require("./../models/userModel");

// const provider = "https://rpc-holesky.morphl2.io"; // rpc url
// const signer = "0x4E238321ed92d96AcEe377EB607FAc8C845aAC75"; // signer address

// const safeFactory = SafeFactory.init({
//   provider,
//   signer,
// }).then(() => console.log("safe address initiated"));

exports.createUser = catchAsync(async (req, res, next) => {
  const { name, tgHandle, userAddr } = req.body;

  //create a multisig 1-in-2 for this user , add in database
  // global helper Address, local user Address
  // const owners = [userAddr, helperAddr];
  // const threshold = 1;
  // const safeAccountConfig = {
  //   owners,
  //   threshold,
  // };

  // const protocolKit = await safeFactory.deploySafe({ safeAccountConfig });
  // const safeAddress = await protocolKit.getAddress();

  // const addr= /**/

  //create user in the database
  const user = await User.create({
    name: name,
    tgHandle: tgHandle,
    multisigAddress: "", //safeAddress
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

exports.getBalancesOfUser = catchAsync(async (req, res, next) => {
  const { user, toUser } = req.body;
});
