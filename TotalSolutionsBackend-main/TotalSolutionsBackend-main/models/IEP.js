const mongoose = require('mongoose');

const GoalVersionSchema = new mongoose.Schema({
    month: { type: String, required: true },
    target: { type: String, required: true },
    goals: [{ type: String, required: true }],
    performance: [{ type: Number, default: 0 }],
    therapistFeedback: { type: String, default: '' },
    doctorFeedback: { type: String, default: '' },
    childVideo :{
        videoUrl: { type: String, default: '' },
        videoDescription: { type: String, default: '' },
        videoUploadDate: { type: Date, default: null},
    },
    updatedAt: { type: Date, default: Date.now } 
}, { _id: false });

const MonthlyGoalWrapperSchema = new mongoose.Schema({
    history: [GoalVersionSchema], 
    latest: GoalVersionSchema   
}, { _id: false });

const IEP = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    childId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Child',
        required: true
    },
    therapy: {
        type: String,
        required: true
    },
    therapistName: {
        type: String,
        ref: 'User',
        required: true
    },
    monthlyGoals: [MonthlyGoalWrapperSchema],
    selectedMonths: {
        type: [String],
        required: true
    },
    feedback: {
        type: String
    },
    startingMonth: {
        type: String,
        required: true
    },
    startingYear: {
        type: Number,
        required: true
    },
    selectedMonthsNames: {
        type: [String],
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('IEP', IEP);
