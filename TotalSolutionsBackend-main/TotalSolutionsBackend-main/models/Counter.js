const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    field: { type: String, required: true, unique: true },
    value: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', counterSchema);
module.exports = Counter;
