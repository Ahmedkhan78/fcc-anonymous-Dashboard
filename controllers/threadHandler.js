"use strict";
const mongoose = require("mongoose");
const Message = require("../models/message").Message;

exports.postThread = async (req, res) => {
  try {
    const board = req.params.board;

    await Message.create({
      board: board,
      text: req.body.text,
      created_on: new Date(),
      bumped_on: new Date(),
      reported: false,
      delete_password: req.body.delete_password,
      replies: [],
    });

    return res.redirect("/b/" + board);
  } catch (err) {
    return res.send("error");
  }
};

exports.getThread = async (req, res) => {
  try {
    const board = req.params.board;
    const threads = await Message.find({ board })
      .sort({ bumped_on: -1 })
      .limit(10)
      .lean();

    threads.forEach((t) => {
      t.replycount = t.replies.length;
      t.replies = t.replies
        .sort((a, b) => new Date(b.created_on) - new Date(a.created_on))
        .slice(0, 3);
      t.replies.forEach((r) => {
        delete r.delete_password;
        delete r.reported;
      });
      delete t.delete_password;
      delete t.reported;
    });

    return res.json(threads);
  } catch (err) {
    return res.send("error");
  }
};

exports.deleteThread = async (req, res) => {
  try {
    const thread = await Message.findById(req.body.thread_id);
    if (!thread) return res.send("error");

    if (req.body.delete_password === thread.delete_password) {
      await thread.deleteOne();
      return res.send("success");
    } else {
      return res.send("incorrect password");
    }
  } catch (err) {
    return res.send("error");
  }
};

exports.putThread = async (req, res) => {
  try {
    const thread = await Message.findById(req.body.thread_id);
    if (!thread) return res.send("error");
    thread.reported = true;
    await thread.save();
    return res.send("reported");
  } catch (err) {
    return res.send("error");
  }
};
