const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lettersSchema = new Schema({
    [String]: [String] // This allows for dynamic keys with an array of strings as values
});

const levelSchema = new Schema({
    words: {
        type: Object,
        default: {} // Ensure it's initialized as an object
    }
});

const gameSchema = new Schema({
    words: {
        type: Map,
        of: lettersSchema // Use a Map to allow dynamic levels
    }
});

module.exports = mongoose.model('memorygame', gameSchema);
