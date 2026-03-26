const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  sessionNumber: { type: Number, required: true },
  words: [{ type: String, required: true }],
});

const wordSessionSchema = new mongoose.Schema({
  sessions: [sessionSchema], 
});

const WordSession = mongoose.model('Windowsequencing', wordSessionSchema);

module.exports = WordSession;
