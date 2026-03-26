const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    childId: { type: mongoose.Schema.Types.ObjectId, ref: 'Child', required: true },
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User Id who generated the report
    role: { type: String, required: true, enum: ['parent','doctor', 'therapist', 'admin'] },
    reportUrl: { type: String, required: true }, // AWS Url
    reportName : { type: String, required: true },
    reportType: { type: String, required: true, enum: ["MISIC", "BKT", "WISC", "WAIS", "CAS", "Other"] },
    generatedAt: { type: Date, default: Date.now },
},
{ timestamps: true });

module.exports = mongoose.model('Report', reportSchema);