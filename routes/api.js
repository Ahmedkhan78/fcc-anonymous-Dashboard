"use strict";
const threadHandler = require("../controllers/threadHandler");
const replyHandler = require("../controllers/replyHandler");

module.exports = function (app) {
  app
    .route("/api/threads/:board")
    .post(threadHandler.postThread)
    .get(threadHandler.getThread)
    .delete(threadHandler.deleteThread)
    .put(threadHandler.reportThread);

  app
    .route("/api/replies/:board")
    .post(replyHandler.postReply)
    .get(replyHandler.getReply)
    .delete(replyHandler.deleteReply)
    .put(replyHandler.reportReply);
};
