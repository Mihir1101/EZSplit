const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

//routers
const userRouter = require("./routes/userRouter");
const groupRouter = require("./routes/groupRouter");
const expenseRouter = require("./routes/expenseRouter");
dotenv.config({});

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB connection successful!");

    const port = `${process.env.PORT}`;

    app.listen(port || 5000, () => {
      console.log(`listening to the port ${port}`);
    });
  });

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Set security HTTP headers
app.use(helmet());

app.use("/api/user", userRouter);
app.use("/api/group", groupRouter);
app.use("/api/expenses", expenseRouter);

//handle other urls
app.all("*", (req, res, next) => {
  next();
  return res.status(500).json({
    message: "not handled on backend",
  });
});
