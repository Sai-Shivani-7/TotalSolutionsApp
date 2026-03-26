// models/Holiday.js (or CalendarHoliday.js)

const mongoose = require('mongoose');

const HolidaySchema = new mongoose.Schema({
    // The name/occasion of the holiday (e.g., "Diwali", "Christmas")
    name: {
        type: String,
        required: [true, 'Holiday name is required.'],
        trim: true,
        maxlength: [100, 'Holiday name cannot exceed 100 characters.']
    },
    date: {
        type: Date,
        required: [true, 'Holiday date is required.'],
        unique: true // Ensures no two holidays are scheduled on the same exact date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Holiday', HolidaySchema);