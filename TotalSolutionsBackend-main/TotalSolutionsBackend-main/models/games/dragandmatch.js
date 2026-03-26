const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const dragandmatch = new Schema({
  questionset: [
    {
      question: [
        {
          type: String,
          required: true,
        },
      ],
    },
  ],
  setNo: {
    type: Number,
    required: true,
  },
});
module.exports =
  mongoose.models.dragandmatch ||
  mongoose.model("dragandmatch", dragandmatch);