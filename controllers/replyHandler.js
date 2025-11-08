"use strict";
const mongoose = require("mongoose");
const Message = require("../models/message").Message;

exports.postReply = async (req, res) => {
  try {
    const board = req.params.board;
    const thread = await Message.findById(req.body.thread_id);
    if (!thread) return res.send("error");

    thread.bumped_on = new Date();
    thread.replies.push({
      text: req.body.text,
      created_on: new Date(),
      delete_password: req.body.delete_password,
      reported: false,
    });

    await thread.save();
    return res.redirect("/b/" + board + "/" + req.body.thread_id);
  } catch (err) {
    return res.send("error");
  }
};

exports.getReply = async (req, res) => {
  try {
    const thread = await Message.findById(req.query.thread_id).lean();
    if (!thread) return res.send("error");

    delete thread.delete_password;
    delete thread.reported;
    thread.replies.forEach((r) => {
      delete r.delete_password;
      delete r.reported;
    });

    return res.json(thread);
  } catch (err) {
    return res.send("error");
  }
};

exports.deleteReply = async (req, res) => {
  try {
    const thread = await Message.findById(req.body.thread_id);
    if (!thread) return res.send("error");

    for (let reply of thread.replies) {
      if (String(reply._id) === req.body.reply_id) {
        if (reply.delete_password === req.body.delete_password) {
          reply.text = "[deleted]";
          await thread.save();
          return res.send("success");
        } else {
          return res.send("incorrect password");
        }
      }
    }

    return res.send("error");
  } catch (err) {
    return res.send("error");
  }
};

exports.putReply = async (req, res) => {
  try {
    const thread = await Message.findById(req.body.thread_id);
    if (!thread) return res.send("error");

    for (let reply of thread.replies) {
      if (String(reply._id) === req.body.reply_id) {
        reply.reported = true;
        await thread.save();
        return res.send("success");
      }
    }

    return res.send("error");
  } catch (err) {
    return res.send("error");
  }
};
