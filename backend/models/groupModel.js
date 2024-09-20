const mongoose = require("mongoose");
const { isAddress } = require("web3-validator");
const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please tell us your name!"],
    },
    users: {
      type: [mongoose.Schema.ObjectId],
      required: [true, "Please give your wallet address"],
    },
    expenses: {
      type: [mongoose.Schema.ObjectId],
      ref: "Expense",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const group = mongoose.model("group", groupSchema);

module.exports = group;
