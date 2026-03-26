const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['therapist', 'parent', 'doctor', 'admin', 'superadmin'] },
    name: { type: String, required: true },
    mobilenumber: { type: Number, required: true, unique: true },
    profilePhoto: { type: String, default: null }
}, { discriminatorKey: 'role', timestamps: true });

const User = mongoose.model('User', userSchema);

const therapistSchema = new Schema({
    assignedChildren: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Child' }],
    centreId: { type: mongoose.Schema.Types.ObjectId, ref: 'Centre' },
    designation: { type: String, default: null },
    qualification: { type: String, default: null },
    rciNumber: { type: String, default: null },
    feedback: [{
    content: { type: String, required: true },
    // Assumes the Superadmin/Admin writing the feedback is also a 'User'
    date: { type: Date, default: Date.now }
}]
});
const Therapist = User.discriminator('therapist', therapistSchema);

const parentSchema = new Schema({
    children: { type: [mongoose.Schema.Types.ObjectId], ref: 'Child', default: [] },
    address: {
        type: String,
        required: true
    },
    referenceId : { type : String, unique : true, required : true }
});
const Parent = User.discriminator('parent', parentSchema);

const doctorSchema = new Schema({
    patients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Child' }],
    centreIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Centre' }]
});
const Doctor = User.discriminator('doctor', doctorSchema);

const adminSchema = new Schema({
    centreId: { type: mongoose.Schema.Types.ObjectId, ref: 'Centre', default: null },
});
const Admin = User.discriminator('admin', adminSchema);

const superAdminSchema = new Schema({
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const SuperAdmin = User.discriminator('superadmin', superAdminSchema);

module.exports = { User, Therapist, Parent, Doctor, Admin, SuperAdmin };
