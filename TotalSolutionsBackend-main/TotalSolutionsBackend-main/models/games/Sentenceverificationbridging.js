const mongoose = require('mongoose');

const section1Schema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    caption: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    options: {
        type: [String],
        required: true,
    },
    correctanswer: {
        type: String,
        required: true,
    },
    attempts: {
        type: Number,
        default: 0,
    },
    timetaken: {
        type: Number,
        default: 0,
    },
    section: {
        type: String,
        required: true,
    },
});
const section2Schema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    caption: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    options: {
        type: [String],
        required: true,
    },
    correctanswer: {
        type: String,
        required: true,
    },
    attempts: {
        type: Number,
        default: 0,
    },
    timetaken: {
        type: Number,
        default: 0,
    },
    section: {
        type: String,
        required: true,
    },
});

const section1 = mongoose.model('section1', section1Schema);
const section2 = mongoose.model('section2', section2Schema);
module.exports =  {
    section1,
    section2,
};