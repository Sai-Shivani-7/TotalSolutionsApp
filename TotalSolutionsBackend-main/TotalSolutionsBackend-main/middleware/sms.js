const axios = require('axios');
require('dotenv').config();
const { logger } = require('../utils/logger');
const API_KEY = process.env.SMS_API_KEY;
const SMS_SENDER = process.env.SMS_SENDER_ID;

// Base SMS sending function
async function sendSMS(number, message) {
    if (!API_KEY || !SMS_SENDER) {
        throw new Error('SMS_API_KEY or SMS_SENDER_ID not configured in .env');
    }

    if (!number || !message) {
        throw new Error('Number and message are required');
    }

    if (!/^\d{10}$/.test(number)) {
        throw new Error('Invalid phone number format. Must be 10 digits.');
    }

    let mobileNumberWithCountryCode = '91' + number; // Assuming country code '91' for India

    try {
        const url = `http://www.bulksmsapps.com/api/apismsv2.aspx?apikey=${API_KEY}&sender=${SMS_SENDER}&number=${mobileNumberWithCountryCode}&message=${encodeURIComponent(message)}`;
        const response = await axios.get(url);
        // console.log('SMS sent successfully:', response.data);
        return response.data;
    } catch (error) {
        logger.error('SMS sending failed:', error.message);
        throw error;
    }
}

// Send OTP SMS
async function sendOtpSMS(number, otp) {
    const message = `Your One-Time Password (OTP) for mobile verification in Total solution rehabilitation society is: ${otp}. Please enter this code to verify your mobile number.`;
    return sendSMS(number, message);
}

// Send Appointment SMS based on centre
async function sendAppointmentSMS(params) {
    const {
        mobilenumber,
        parentName,
        doctorName,
        appointmentDate,
        appointmentTime,
        consultationType
    } = params;

    let consultationFee;

    if (consultationType === 'New Consultation') {
        consultationFee = 'Rs. 700';
    } else if (consultationType === 'Assessment(IQ)') {
        consultationFee = 'Rs. 6000';
    }
    else{
        consultationFee = 'Rs. 12000';
    }

    const message = `Dear ${parentName} your appointment with ${doctorName} is ${appointmentTime} at #Total solution Rehabilitation society, 3-4-495/B, 1st Floor, YMCA, Near More Supermarket, Barkatpura, Hyderabad - 27${appointmentDate} Consultation/assessment ${consultationFee} If you are unable to make it on time session would be considered as cancelled after 10 min of wait period. Please pay the fee by cash only card payment is not available.`;

    // console.log(message);
    // console.log(mobilenumber);

    return sendSMS(mobilenumber, message);
}

// Send Appointment Acknowledgement
async function sendAppointmentAcknowledge(params) {
    const {
        mobilenumber,
        parentName,
        appointmentDate,
        time
    } = params;

    const message = `Dear ${parentName}, This SMS acknowledges your appointment request with Dr. Pooja Jha scheduled for ${appointmentDate} ${time}. A follow-up confirmation will be sent once approved by our administration team. -Total solution Rehabilitation society`;
    return sendSMS(mobilenumber, message);
}

module.exports = {
    sendOtpSMS,
    sendAppointmentSMS,
    sendAppointmentAcknowledge
};