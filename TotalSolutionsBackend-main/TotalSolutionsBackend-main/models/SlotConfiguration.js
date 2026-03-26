const mongoose = require('mongoose');

const SlotConfigurationSchema = new mongoose.Schema({
    doctorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    centreId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Centre', 
        required: true 
    },
    // Specific date for slot configuration
    date: {
        type: Date,
        required: true
    },
    availableSlots: [{
        time: {
            type: String,
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        // Slot can be temporarily blocked by superadmin
        isBlocked: {
            type: Boolean,
            default: false
        },
        blockReason: {
            type: String,
            default: ''
        }
    }],
    // Global settings for this doctor/center/date combination
    isOperational: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Compound index for efficient querying by doctor, center and date
SlotConfigurationSchema.index({ doctorId: 1, centreId: 1, date: 1 });

// Static method to get default time slots (fallback)
SlotConfigurationSchema.statics.getDefaultSlots = function() {
    return [
        '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', 
        '1:00 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', 
        '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'
    ];
};

// Method to get available slots for this specific date
SlotConfigurationSchema.methods.getAvailableSlots = function() {
    if (!this.isOperational) {
        return []; // No slots available on this date
    }
    
    return this.availableSlots
        .filter(slot => slot.isActive && !slot.isBlocked)
        .map(slot => slot.time);
};

module.exports = mongoose.model('SlotConfiguration', SlotConfigurationSchema);