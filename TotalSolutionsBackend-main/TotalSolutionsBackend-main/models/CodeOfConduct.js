const mongoose = require('mongoose');

const CodeOfConduct = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CodeOfConduct', CodeOfConduct);