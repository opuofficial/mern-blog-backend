require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.use(express.static("public"));

app.use(morgan("tiny"));

const connectToDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler.middleware");

const authRoute = require("./routes/auth.route");
const userRoute = require("./routes/user.route");
const topicRoute = require("./routes/topic.route");
const postRoute = require("./routes/post.route");
const authorRoute = require("./routes/author.route");

app.use("/auth", authRoute);
app.use("/user", userRoute);
app.use("/topic", topicRoute);
app.use("/posts", postRoute);
app.use("/author", authorRoute);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

app.use(errorHandler);

connectToDB()
  .then(() => {
    console.log("Connected to database");
    app.listen(process.env.PORT, () => {
      console.log(`Server started on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Error connecting to database: ${err}`);
  });
