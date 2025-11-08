const mongoose = require("mongoose");
const { Schema } = mongoose;

mongoose.connect(process.env.DB);

const replySchema = new Schema({
  text: String,
  created_on: { type: Date, default: Date.now },
  delete_password: String,
  reported: { type: Boolean, default: false },
});

const threadSchema = new Schema({
  board: String,
  text: String,
  created_on: { type: Date, default: Date.now },
  bumped_on: { type: Date, default: Date.now },
  reported: { type: Boolean, default: false },
  delete_password: String,
  replies: [replySchema],
});

const Message = mongoose.model("Message", threadSchema);
module.exports = { Message };
