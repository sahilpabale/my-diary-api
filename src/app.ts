require("dotenv").config();

import express, { Application } from "express";
import router from "./routes/index";
import pool from "./config/db";
import cors from "cors";

const PORT = process.env.PORT || 8000;

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

pool
  .connect()
  .then((res) => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log("Error connecting to DB\n", err);
  });

app.use("/api", router);

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
