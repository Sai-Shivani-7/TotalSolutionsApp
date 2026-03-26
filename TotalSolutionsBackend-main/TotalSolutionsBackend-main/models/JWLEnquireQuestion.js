const mongoose = require("mongoose");

const enquireQuestionSchema = new mongoose.Schema({
  number:{
    type: Number,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  example: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
});

const JWLEnquireQuestion = mongoose.model("JWLEnquireQuestion", enquireQuestionSchema);
module.exports = JWLEnquireQuestion;
