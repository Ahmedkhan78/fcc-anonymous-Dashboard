"use strict";
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");

const apiRoutes = require("./routes/api.js");
const fccTestingRoutes = require("./routes/fcctesting.js");
const runner = require("./test-runner");

const app = express();

// ✅ FCC security tests
app.use(
  helmet({
    frameguard: { action: "sameorigin" },
    dnsPrefetchControl: { allow: false },
    referrerPolicy: { policy: "same-origin" },
  })
);

app.use("/public", express.static(process.cwd() + "/public"));
app.use(cors({ origin: "*" })); // For FCC testing only
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Frontend pages
app.route("/b/:board/").get((req, res) => {
  res.sendFile(process.cwd() + "/views/board.html");
});
app.route("/b/:board/:threadid").get((req, res) => {
  res.sendFile(process.cwd() + "/views/thread.html");
});

// Index
app.route("/").get((req, res) => {
  res.sendFile(process.cwd() + "/views/index.html");
});

// FCC Testing routes
fccTestingRoutes(app);

// API routes
apiRoutes(app);

// 404
app.use((req, res) => {
  res.status(404).type("text").send("Not Found");
});

// Start Server + Tests
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port " + listener.address().port);
  if (process.env.NODE_ENV === "test") {
    console.log("Running Tests...");
    setTimeout(() => {
      try {
        runner.run();
      } catch (e) {
        console.log("Tests are not valid:");
        console.error(e);
      }
    }, 1500);
  }
});

module.exports = app;
