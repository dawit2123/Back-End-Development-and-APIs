const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});
//connect to the mongodb
const connectToMongoDB = async () =>
  await mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(console.log("Connected to MongoDB"))
    .catch((err) => {
      console.log("Error is " + err);
    });
connectToMongoDB();
//userSchema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
});
const User = mongoose.model("User", userSchema);

// exercise Schema
const exerciseSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: false,
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});
const Exercise = mongoose.model("Exercise", exerciseSchema);

//post method to the /api/users
app.post("/api/users", async (req, res, next) => {
  let username = req.body.username;
  const user = await User.create({ username: username });
  res.json({
    username: user.username,
    _id: user._id,
  });
});

//get request ot the /api/users
app.get("/api/users", async (req, res, next) => {
  const data = await User.find({});
  res.json({
    users: data,
  });
});

//post request to the /api/users/:_id/exercises
app.post("/api/users/:_id/exercises", async (req, res, next) => {
  const data = await Exercise.create({
    id: req.params._id,
    description: req.body.description,
    duration: req.body.duration,
    date: new Date(req.body.date),
  });
  const userData = await User.findById(req.params._id);
  console.log("user data is " + userData);
  res.json({
    username: userData.username,
    description: data.description,
    duration: data.duration,
    date: data.date.toDateString(),
    _id: data._id,
  });
});

//get request to the /api/users/:_id/logs endpoint
app.get("/api/users/:_id/logs", async (req, res, next) => {
  const fromDate = new Date(req.query.from);
  const toDate = new Date(req.query.to);
  const limit = req.query.limit;
  const data = await Exercise.find({ id: req.params._id });
  console.log("The data is " + data);
  let log = data;
  console.log(fromDate + "and" + toDate + "and" + limit);
  if (fromDate && toDate) {
    console.log("from date");
    let logTemp = data.filter((exercise) => {
      exercise.date > fromDate && exercise.date < toDate;
    });
    log = logTemp;
  }
  if (limit) {
    console.log("limit");
    log = log.slice(0, limit);
  }
  let logData = log.map((val) => {
    val.date = val.date.toDateString();
  });
  res.json({
    count: data.length,
    log: logData,
    _id: data._id,
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
