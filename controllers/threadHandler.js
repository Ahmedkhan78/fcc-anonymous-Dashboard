const { Message } = require("../models/message");

exports.postThread = async (req, res) => {
  try {
    const board = req.params.board;
    const newThread = new Message({
      board,
      text: req.body.text,
      delete_password: req.body.delete_password,
    });
    await newThread.save();
    return res.redirect("/b/" + board);
  } catch {
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
      t.replies = t.replies
        .sort((a, b) => b.created_on - a.created_on)
        .slice(0, 3)
        .map((r) => ({
          _id: r._id,
          text: r.text,
          created_on: r.created_on,
        }));
      delete t.delete_password;
      delete t.reported;
    });

    res.json(threads);
  } catch {
    res.send("error");
  }
};

exports.deleteThread = async (req, res) => {
  try {
    const { thread_id, delete_password } = req.body;
    const thread = await Message.findById(thread_id);
    if (!thread) return res.send("error");
    if (thread.delete_password !== delete_password)
      return res.send("incorrect password");
    await thread.deleteOne();
    return res.send("success");
  } catch {
    res.send("error");
  }
};

exports.reportThread = async (req, res) => {
  try {
    const { thread_id } = req.body;
    await Message.findByIdAndUpdate(thread_id, { reported: true });
    return res.send("reported");
  } catch {
    res.send("error");
  }
};
