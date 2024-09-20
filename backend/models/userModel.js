const mongoose = require("mongoose");
const { isAddress } = require("web3-validator");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name!"],
  },
  tgHandle: {
    type: String,
    unique: true,
    required: [true, "Please give your wallet address"],
  },
  multisigAddress: {
    type: String,
    unique: true,
    required: [true, "Please give your wallet address"],
    validate: [isAddress, "Please provide a valid wallet address"],
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
