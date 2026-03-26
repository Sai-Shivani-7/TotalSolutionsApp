const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gameSchema = new Schema({
    gameId: { type: Number, required: true },
    tries: { type: Number, required: true },
    timer: { type: Number, required: true },
    status: { type: String, required: true, enum : ['completed', 'incomplete'], default: 'incomplete' },
    childId: { type: Schema.Types.ObjectId, ref: 'Child', required: true },
    therapistId: { type: Schema.Types.ObjectId, ref: 'Therapist', required: true },
    datePlayed: { type: Date, required: true }
}, {timestamps: true});

module.exports = mongoose.models.Game || mongoose.model('Game', gameSchema);
