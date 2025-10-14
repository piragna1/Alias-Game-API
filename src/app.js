import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";

const app = express();

// middlewares
dotenv.config({ quiet: true });
app.use(express.json());
app.use(cookieParser());
// ...

app.get("/", (req, res) => {
  res.send("Welcome to the Alias Game API");
});

export default app;
