import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import usersRouter from "./routes/users.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(helmet());

const port = process.env.PORT;

let database = process.env.MONGO_URI;

if (process.env.NODE_ENV === "testing") {
  database = process.env.MONGO_URI_TEST;
}

mongoose
  .connect(database, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("Database connection established");
  })
  .catch((err) => {
    console.error(`ERROR: ${err}`);
  });

app.use("/users", usersRouter);

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});

export default app;
