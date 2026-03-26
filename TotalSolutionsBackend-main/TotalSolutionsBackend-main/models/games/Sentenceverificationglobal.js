const mongoose = require('mongoose');

// Define the schema
const gameSchema = new mongoose.Schema({
  screen: {
    type: Number,
    required: true
  },
  images: {
    type: [String],
    required: true
  },
  sentence: {
    type: String,
    required: true
  },
  correctAnswer: {
    type: String,
    required: true
  }
});

// Create the model
const GameData = mongoose.model('Sentenceverificationglobal', gameSchema);

// Export the model so it can be used in other files
module.exports = GameData;
