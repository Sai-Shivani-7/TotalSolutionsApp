const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    childId: { type: mongoose.Schema.Types.ObjectId, ref: 'Child', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointmentDate: { type: Date, required: true },
    appointmentTime: {
        type: String,
        required: true
        // Removed enum to allow dynamic slots configured by superadmin
    },
    slotDuration: {
        type: Number, // Duration in minutes (30 for consultation, 60 for assessment)
        required: true,
        default: function() {
            return this.consultationType === 'New Consultation' ? 30 : 60;
        }
    },
    blockedSlots: [{
        type: String,
        // Additional time slots blocked by this appointment (for assessments)
    }],
    status: { type: String, enum: ['pending', 'rejected', 'approved'], default: 'pending' },
    prescription: { type: String, default: '' },
    centreNumber: { type: Number },
    centreId : { type: mongoose.Schema.Types.ObjectId, ref: 'Centre' },
    previousMedicalReports: [{ type: String }],
    consultationType: {
        type: String,
        enum: [
            'New Consultation',
            'Assessment(IQ)',
            'For IB board Assessment(IQ)'
        ],
        required: true
    },
    childConcerns: {
        type: String
    },
    referredBy: {
        type: String,
    },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);