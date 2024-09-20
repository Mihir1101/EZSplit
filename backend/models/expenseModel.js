const mongoose = require("mongoose");
const expenseSchema = new mongoose.Schema(
  {
    addedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    isSettled: {
      type: Boolean,
      default: false,
    },
    inGroup: {
      type: mongoose.Schema.ObjectId,
      ref: "Group",
    },
    fromUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    toUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense;
