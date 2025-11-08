const { Message } = require("../models/message");

exports.postReply = async (req, res) => {
  try {
    const board = req.params.board;
    const { thread_id, text, delete_password } = req.body;
    const thread = await Message.findById(thread_id);
    if (!thread) return res.send("error");
    thread.replies.push({
      text,
      delete_password,
    });
    thread.bumped_on = new Date();
    await thread.save();
    res.redirect("/b/" + board + "/" + thread_id);
  } catch {
    res.send("error");
  }
};

exports.getReply = async (req, res) => {
  try {
    const thread = await Message.findById(req.query.thread_id).lean();
    if (!thread) return res.send("error");
    delete thread.delete_password;
    delete thread.reported;
    thread.replies = thread.replies.map((r) => ({
      _id: r._id,
      text: r.text,
      created_on: r.created_on,
    }));
    res.json(thread);
  } catch {
    res.send("error");
  }
};

exports.deleteReply = async (req, res) => {
  try {
    const { thread_id, reply_id, delete_password } = req.body;
    const thread = await Message.findById(thread_id);
    if (!thread) return res.send("error");
    const reply = thread.replies.id(reply_id);
    if (!reply) return res.send("error");
    if (reply.delete_password !== delete_password)
      return res.send("incorrect password");
    reply.text = "[deleted]";
    await thread.save();
    res.send("success");
  } catch {
    res.send("error");
  }
};

exports.reportReply = async (req, res) => {
  try {
    const { thread_id, reply_id } = req.body;
    const thread = await Message.findById(thread_id);
    if (!thread) return res.send("error");
    const reply = thread.replies.id(reply_id);
    if (!reply) return res.send("error");
    reply.reported = true;
    await thread.save();
    res.send("reported");
  } catch {
    res.send("error");
  }
};
