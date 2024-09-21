const mongoose = require("mongoose");
const { isAddress } = require("web3-validator");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please tell us your name!"],
    },
    tgHandle: {
      type: String,
      unique: true,
      required: [true, "Please give your teleggram handle"],
    },
    accountAddr: {
      type: String,
      unique: true,
      required: [true, "Account address not given"],
      validate: [isAddress, "Please provide a valid wallet address"],
    },
    multisigAddress: {
      type: String,
      unique: true,
      // required: [true, "Please give your wallet address"],
      validate: [isAddress, "Please provide a valid wallet address"],
    },
    ////
    balance: {
      type: Number,
      required: true,
    },
    ///
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
