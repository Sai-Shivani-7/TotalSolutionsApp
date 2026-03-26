const mongoose = require('mongoose');

const CentreSchema = new mongoose.Schema({
    centreNumber : { type : Number, required : true, unique : true },
    name : { type : String, required : true },
    address : { type : String, required : true },
    city : { type : String, required : true },
    state : { type : String, required : true },
    pincode : { type : Number, required : true },
    contactNumber : { type : Number, required : true },
    doctors : [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    therapists : [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    parents : [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    children : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Child' }],
    admins : [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true});

module.exports = mongoose.model('Centre', CentreSchema);