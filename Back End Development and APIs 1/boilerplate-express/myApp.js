let express = require("express");
//requiring the dotenv file and configuring it.
require("dotenv").config({ path: ".env" });
let app = express();
// let folderPath= __dirname+"/public";
// app.use(express.static(folderPath));
// app.use("/public", express.static(folderPath));
// Normal usage
app.use((req, res, next) => {
  let string = req.method + " " + req.path + " - " + req.ip;
  console.log(string);
  next();
});
app.use(express.static(__dirname + "/public"));
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => {
  let absolutePath = __dirname + "/views/index.html";
  // console.log(absolutePath);
  res.sendFile(absolutePath);
});
app.get("/json", (req, res) => {
  if (process.env.MESSAGE_STYLE == "uppercase") {
    res.json({ message: "HELLO JSON" });
  } else {
    res.json({ message: "Hello json" });
  }
});
app.get(
  "/now",
  (req, res, next) => {
    req.time = new Date().toString();
    next();
  },
  (req, res) => {
    res.json({
      time: req.time,
    });
  }
);
module.exports = app;
