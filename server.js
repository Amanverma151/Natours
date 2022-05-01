// This file will run in script because this file is like a entry point that contains config, error handling, server etc.
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Uncaught Exceptions
process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception");
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: "./config.env" }); // this function takes object as arg with path in which the config file is present
const app = require("./app");

//replacing the password placeholder in the string with the original password string in the env var
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

// connecting with MONGODB , it will return a promise
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true, // options to deal with warnings always remains same.
    useFindAndModify: false,
  })
  .then(() => console.log("DB connection successful"));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Application running on port ${port}...`);
});

// Unhandled Rejection
process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection");
  console.log(err.name, err.message);

  // we should always close the server because there might be some pending request and after that we should end the process.
  server.close(() => {
    process.exit(1);
  });
});
