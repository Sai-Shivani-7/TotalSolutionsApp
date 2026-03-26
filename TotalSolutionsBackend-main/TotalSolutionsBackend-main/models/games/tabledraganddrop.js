const mongoose = require('mongoose');

const Gameschema = new mongoose.Schema({
    name: { type: String, required: true },
    data: {
        type: Map,
        of: new mongoose.Schema({
            category: { type: Map, of: [String], required: true }
        })
    }
});
module.exports = mongoose.model('Tabledraganddrop', Gameschema);

