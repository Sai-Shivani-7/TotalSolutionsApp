// Slot management utilities for appointments
const SlotConfiguration = require('../models/SlotConfiguration');
const { logger } = require('./logger');

// Define default time slots (30-minute intervals) - used as fallback
const DEFAULT_TIME_SLOTS = [
    '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', 
    '12:30 PM', '1:00 PM', '2:00 PM', '2:30 PM', 
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', 
    '5:00 PM', '5:30 PM'
];

// Convert time string to minutes for calculation
function timeToMinutes(timeStr) {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0;
    }
    
    return hours * 60 + minutes;
}

// Convert minutes back to time string
function minutesToTime(minutes) {
    let hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    
    return `${hours}:${mins.toString().padStart(2, '0')} ${period}`;
}

// Get consultation slots (30-minute intervals)
function getConsultationSlots() {
    return DEFAULT_TIME_SLOTS;
}

// Get assessment slots (1-hour intervals, starting at 30-minute marks)
function getAssessmentSlots() {
    return getAssessmentSlotsFromList(DEFAULT_TIME_SLOTS, [], []);
}

// Get slots that would be blocked by an assessment appointment
function getBlockedSlotsByAssessment(appointmentTime) {
    const appointmentMinutes = timeToMinutes(appointmentTime);
    const nextSlotMinutes = appointmentMinutes + 30;
    const nextSlotTime = minutesToTime(nextSlotMinutes);
    
    // Return both the main slot and the next 30-minute slot
    const blockedSlots = [appointmentTime];
    if (DEFAULT_TIME_SLOTS.includes(nextSlotTime)) {
        blockedSlots.push(nextSlotTime);
    }
    
    return blockedSlots;
}

// Check if a slot is available for booking
function isSlotAvailable(requestedTime, consultationType, bookedSlots, existingBlockedSlots = []) {
    const allBlockedSlots = [...bookedSlots, ...existingBlockedSlots];
    
    if (consultationType === 'New Consultation') {
        // For consultation (30 min), just check if the slot is free
        return !allBlockedSlots.includes(requestedTime);
    } else {
        // For assessment (60 min), check if both the slot and next slot are free
        const wouldBlock = getBlockedSlotsByAssessment(requestedTime);
        return wouldBlock.every(slot => !allBlockedSlots.includes(slot));
    }
}

// Get dynamic slots for a doctor/date combination
async function getDynamicSlots(doctorId, targetDate) {
    try {
        // Normalize target date to start of day in UTC to avoid timezone issues
        const normalizedDate = typeof targetDate === 'string' 
            ? new Date(targetDate + 'T00:00:00.000Z')
            : new Date(targetDate.toISOString().split('T')[0] + 'T00:00:00.000Z');
        
        // Try to find existing slot configuration for this specific date
        const slotConfig = await SlotConfiguration.findOne({
            doctorId,
            date: normalizedDate
        });
        
        if (slotConfig) {
            // Return slots from MongoDB configuration
            if (!slotConfig.isOperational) {
                return []; // No slots available if not operational
            }
            
            // Return only active, non-blocked slots
            return slotConfig.availableSlots
                .filter(slot => slot.isActive && !slot.isBlocked)
                .map(slot => slot.time);
        }
        
        // No configuration exists, return default slots
        return DEFAULT_TIME_SLOTS;
    } catch (error) {
        logger.error('Error fetching dynamic slots:', error);
        return DEFAULT_TIME_SLOTS;
    }
}

// Get available slots for a specific appointment type (now supports dynamic slots)
async function getAvailableSlots(consultationType, bookedSlots, existingBlockedSlots = [], doctorId = null, targetDate = null) {
    let baseSlots;
    
    if (doctorId && targetDate) {
        // Use dynamic slots if parameters provided
        baseSlots = await getDynamicSlots(doctorId, targetDate);
    } else {
        // Fallback to static slots
        baseSlots = consultationType === 'New Consultation' 
            ? getConsultationSlots() 
            : getAssessmentSlots();
    }
    
    // For assessment appointments, we need to check consecutive slot availability
    if (consultationType !== 'New Consultation') {
        return getAssessmentSlotsFromList(baseSlots, bookedSlots, existingBlockedSlots);
    }
    
    // For consultation appointments, just filter out booked and blocked slots
    return baseSlots.filter(slot => 
        isSlotAvailable(slot, consultationType, bookedSlots, existingBlockedSlots)
    );
}

// Helper function to get assessment-compatible slots from available slot list
function getAssessmentSlotsFromList(availableSlots, bookedSlots = [], blockedSlots = []) {
    const unavailable = new Set([...bookedSlots, ...blockedSlots]);

    // Remove booked/blocked slots
    const freeSlots = availableSlots.filter(s => !unavailable.has(s));

    // Sort slots by time
    freeSlots.sort((a, b) => timeToMinutes(a) - timeToMinutes(b));

    const result = [];
    const usedSlots = new Set();

    for (const slot of freeSlots) {
        if (usedSlots.has(slot)) continue;

        const slotMinutes = timeToMinutes(slot);
        const nextSlotTime = minutesToTime(slotMinutes + 30);

        // For assessment appointments, we need to ensure:
        // 1. Current slot is free
        // 2. Next 30-minute slot is also free (for 1-hour duration)
        // 3. No conflicts with other assessment appointments
        
        // Check if the next 30 minutes are available
        if (freeSlots.includes(nextSlotTime)) {
            // Both current and next slot are free, this can be used for assessment
            usedSlots.add(slot);
            usedSlots.add(nextSlotTime); // Mark next slot as used so it's not offered separately
            result.push(slot);
        } else {
            // Next slot is not free, check if we can still use this slot
            // Only if there's no appointment in the next 30 minutes
            if (!unavailable.has(nextSlotTime)) {
                // The next slot doesn't exist in available slots but is not booked
                // This means it's either not configured or blocked for other reasons
                // We can still use this slot for assessments if it's the last slot of the day
                // or if the next configured slot is more than 60 minutes away
                
                const nextAvailableSlot = freeSlots.find(s => timeToMinutes(s) > slotMinutes);
                if (!nextAvailableSlot || timeToMinutes(nextAvailableSlot) >= slotMinutes + 60) {
                    result.push(slot);
                }
            }
        }
    }

    return result;
}

// Check if two slots are consecutive (30 minutes apart)
function isConsecutiveSlots(slot1, slot2) {
    const time1Minutes = timeToMinutes(slot1);
    const time2Minutes = timeToMinutes(slot2);
    return time2Minutes - time1Minutes === 30;
}

// Check if adding a new slot would create conflicts with existing slots
function checkSlotTimeConflicts(newSlotTime, existingSlots, appointments = []) {
    const newSlotMinutes = timeToMinutes(newSlotTime);
    const conflicts = [];
    
    // Create a set of all existing slot times
    const existingTimes = new Set(existingSlots.map(slot => slot.time));
    
    // Get appointment details mapped by time
    const appointmentMap = new Map();
    appointments.forEach(apt => {
        appointmentMap.set(apt.appointmentTime, apt);
    });
    
    // Check each existing slot for potential conflicts
    for (const slot of existingSlots) {
        const slotMinutes = timeToMinutes(slot.time);
        const timeDiff = Math.abs(newSlotMinutes - slotMinutes);
        
        // Skip if it's the same slot
        if (timeDiff === 0) continue;
        
        // Check for conflicts based on appointment types
        const appointment = appointmentMap.get(slot.time);
        
        if (appointment) {
            // If there's an appointment at this slot
            if (appointment.consultationType !== 'New Consultation') {
                // Assessment appointment - blocks 1 hour
                const assessmentEndMinutes = slotMinutes + 60;
                if (newSlotMinutes > slotMinutes && newSlotMinutes < assessmentEndMinutes) {
                    conflicts.push({
                        conflictingSlot: slot.time,
                        reason: `Conflicts with assessment appointment (${slot.time} - ${minutesToTime(assessmentEndMinutes)})`,
                        appointmentType: 'Assessment'
                    });
                }
                // Also check if new slot would block the assessment
                const newSlotEndMinutes = newSlotMinutes + 60;
                if (slotMinutes > newSlotMinutes && slotMinutes < newSlotEndMinutes) {
                    conflicts.push({
                        conflictingSlot: slot.time,
                        reason: `New slot would conflict with existing assessment at ${slot.time}`,
                        appointmentType: 'Assessment'
                    });
                }
            } else {
                // Consultation appointment - blocks 30 minutes
                if (timeDiff < 30) {
                    conflicts.push({
                        conflictingSlot: slot.time,
                        reason: `Too close to consultation appointment (${timeDiff} minutes apart, minimum 30 required)`,
                        appointmentType: 'Consultation'
                    });
                }
            }
        } else {
            // No appointment, but check for general slot spacing
            if (timeDiff < 30) {
                // Check if either slot could be used for assessments
                const newSlotNext30 = minutesToTime(newSlotMinutes + 30);
                const slotNext30 = minutesToTime(slotMinutes + 30);
                
                if (existingTimes.has(newSlotNext30) || existingTimes.has(slotNext30)) {
                    conflicts.push({
                        conflictingSlot: slot.time,
                        reason: `Slots too close for assessment appointments (${timeDiff} minutes apart)`,
                        appointmentType: 'Assessment Spacing'
                    });
                }
            }
        }
    }
    
    return conflicts;
}

// Validate if a requested slot can be booked
function validateSlotBooking(requestedTime, consultationType, bookedSlots, existingBlockedSlots = []) {
    // Get valid slots for the consultation type
    const validSlots = consultationType === 'New Consultation' 
        ? getConsultationSlots() 
        : getAssessmentSlots();
    
    // Check if the requested time is valid for the consultation type
    if (!validSlots.includes(requestedTime)) {
        return {
            valid: false,
            error: `${requestedTime} is not a valid slot for ${consultationType}. Available slots: ${validSlots.join(', ')}`
        };
    }
    
    // Check if the slot is available
    if (!isSlotAvailable(requestedTime, consultationType, bookedSlots, existingBlockedSlots)) {
        return {
            valid: false,
            error: `${requestedTime} is not available. This slot conflicts with existing appointments.`
        };
    }
    
    return { valid: true };
}

// Create default slot configuration for a specific date
async function createDefaultSlotConfiguration(doctorId, targetDate) {
    try {
        const normalizedDate = typeof targetDate === 'string' 
            ? new Date(targetDate + 'T00:00:00.000Z')
            : new Date(targetDate.toISOString().split('T')[0] + 'T00:00:00.000Z');
        
        // Check if configuration already exists
        const existingConfig = await SlotConfiguration.findOne({
            doctorId,
            date: normalizedDate
        });
        
        if (existingConfig) {
            return existingConfig;
        }
        
        // Create new configuration with default slots
        const slotConfig = new SlotConfiguration({
            doctorId,
            date: normalizedDate,
            availableSlots: DEFAULT_TIME_SLOTS.map(time => ({
                time,
                isActive: true,
                isBlocked: false,
                blockReason: ''
            })),
            isOperational: true
        });
        
        await slotConfig.save();
        return slotConfig;
    } catch (error) {
        logger.error('Error creating default slot configuration:', error);
        throw error;
    }
}

// Ensure slot configuration exists and add a used slot if it's not in default slots
async function ensureSlotInConfiguration(doctorId, targetDate, usedSlot) {
    try {
        const normalizedDate = typeof targetDate === 'string' 
            ? new Date(targetDate + 'T00:00:00.000Z')
            : new Date(targetDate.toISOString().split('T')[0] + 'T00:00:00.000Z');
        
        // Find or create slot configuration
        let slotConfig = await SlotConfiguration.findOne({
            doctorId,
            date: normalizedDate
        });
        
        if (!slotConfig) {
            // Create new configuration
            const allSlots = [...DEFAULT_TIME_SLOTS];
            
            // Add the used slot if it's not in default slots
            if (!DEFAULT_TIME_SLOTS.includes(usedSlot)) {
                allSlots.push(usedSlot);
            }
            
            slotConfig = new SlotConfiguration({
                doctorId,
                date: normalizedDate,
                availableSlots: allSlots.map(time => ({
                    time,
                    isActive: true,
                    isBlocked: false,
                    blockReason: ''
                })),
                isOperational: true
            });
            
            await slotConfig.save();
        } else {
            // Check if the used slot exists in configuration
            const existingSlot = slotConfig.availableSlots.find(s => s.time === usedSlot);
            
            if (!existingSlot) {
                // Add the new slot
                slotConfig.availableSlots.push({
                    time: usedSlot,
                    isActive: true,
                    isBlocked: false,
                    blockReason: ''
                });
                await slotConfig.save();
            }
        }
        
        return slotConfig;
    } catch (error) {
        logger.error('Error ensuring slot in configuration:', error);
        throw error;
    }
}

// Block slots when appointment is booked
async function blockSlotsForAppointment(doctorId, targetDate, appointmentTime, consultationType, centreId) {
    try {
        const normalizedDate = typeof targetDate === 'string' 
            ? new Date(targetDate + 'T00:00:00.000Z')
            : new Date(targetDate.toISOString().split('T')[0] + 'T00:00:00.000Z');
        
        // Get all slots that should be blocked for this appointment
        const slotsToBlock = consultationType === 'New Consultation' 
            ? [appointmentTime] 
            : getBlockedSlotsByAssessment(appointmentTime);
        
        // Find or create slot configuration
        let slotConfig = await SlotConfiguration.findOne({
            doctorId,
            date: normalizedDate
        });
        
        if (!slotConfig) {
            // Create new configuration with all default slots
            slotConfig = new SlotConfiguration({
                doctorId,
                centreId,
                date: normalizedDate,
                availableSlots: DEFAULT_TIME_SLOTS.map(time => ({
                    time,
                    isActive: true,
                    isBlocked: slotsToBlock.includes(time),
                    blockReason: slotsToBlock.includes(time) ? 'Booked appointment' : '',
                })),
                isOperational: true
            });
        } else {
            // Update existing configuration to block the slots
            for (const slotTime of slotsToBlock) {
                let slot = slotConfig.availableSlots.find(s => s.time === slotTime);
                if (!slot) {
                    // Add the slot if it doesn't exist
                    slotConfig.availableSlots.push({
                        time: slotTime,
                        isActive: true,
                        isBlocked: true,
                        blockReason: 'Booked appointment'
                    });
                } else {
                    // Mark existing slot as blocked
                    slot.isBlocked = true;
                    slot.blockReason = 'Booked appointment';
                }
            }
        }
        
        await slotConfig.save();
        return slotConfig;
    } catch (error) {
        logger.error('Error blocking slots for appointment:', error);
        throw error;
    }
}

// Superadmin slot management functions
async function createOrUpdateSlotConfiguration(doctorId, targetDate, slots) {
    try {
        const normalizedDate = typeof targetDate === 'string' 
            ? new Date(targetDate + 'T00:00:00.000Z')
            : new Date(targetDate.toISOString().split('T')[0] + 'T00:00:00.000Z');
        
        const slotConfig = await SlotConfiguration.findOneAndUpdate(
            { doctorId, date: normalizedDate },
            {
                doctorId,
                date: normalizedDate,
                availableSlots: slots.map(time => ({
                    time,
                    isActive: true,
                    isBlocked: false,
                    blockReason: ''
                })),
                isOperational: true
            },
            { upsert: true, new: true }
        );
        return slotConfig;
    } catch (error) {
        logger.error('Error creating/updating slot configuration:', error);
        throw error;
    }
}

async function blockSlot(doctorId, targetDate, slotTime, blockReason = '') {
    try {
        const normalizedDate = typeof targetDate === 'string' 
            ? new Date(targetDate + 'T00:00:00.000Z')
            : new Date(targetDate.toISOString().split('T')[0] + 'T00:00:00.000Z');
        
        // First ensure the slot configuration exists
        await createDefaultSlotConfiguration(doctorId, normalizedDate);
        
        const result = await SlotConfiguration.updateOne(
            {
                doctorId,
                date: normalizedDate,
                'availableSlots.time': slotTime
            },
            {
                $set: {
                    'availableSlots.$.isBlocked': true,
                    'availableSlots.$.blockReason': blockReason
                }
            }
        );
        return result;
    } catch (error) {
        logger.error('Error blocking slot:', error);
        throw error;
    }
}

async function unblockSlot(doctorId, targetDate, slotTime) {
    try {
        const normalizedDate = typeof targetDate === 'string' 
            ? new Date(targetDate + 'T00:00:00.000Z')
            : new Date(targetDate.toISOString().split('T')[0] + 'T00:00:00.000Z');
        
        // First ensure the slot configuration exists
        await createDefaultSlotConfiguration(doctorId, normalizedDate);
        
        const result = await SlotConfiguration.updateOne(
            {
                doctorId,
                date: normalizedDate,
                'availableSlots.time': slotTime
            },
            {
                $set: {
                    'availableSlots.$.isBlocked': false,
                    'availableSlots.$.blockReason': ''
                }
            }
        );
        return result;
    } catch (error) {
        logger.error('Error unblocking slot:', error);
        throw error;
    }
}

// Set operational status for a specific doctor/date
async function setOperationalStatus(doctorId, targetDate, isOperational) {
    try {
        const normalizedDate = typeof targetDate === 'string' 
            ? new Date(targetDate + 'T00:00:00.000Z')
            : new Date(targetDate.toISOString().split('T')[0] + 'T00:00:00.000Z');
        
        // First ensure the slot configuration exists
        await createDefaultSlotConfiguration(doctorId, normalizedDate);
        
        const result = await SlotConfiguration.updateOne(
            { doctorId, date: normalizedDate },
            {
                $set: {
                    isOperational: isOperational
                }
            }
        );
        return result;
    } catch (error) {
        logger.error('Error setting operational status:', error);
        throw error;
    }
}

async function removeSlotFromConfiguration(doctorId, targetDate, slotTime) {
    try {
        const normalizedDate = typeof targetDate === 'string' 
            ? new Date(targetDate + 'T00:00:00.000Z')
            : new Date(targetDate.toISOString().split('T')[0] + 'T00:00:00.000Z');
        
        const result = await SlotConfiguration.updateOne(
            { doctorId, date: normalizedDate },
            {
                $pull: {
                    availableSlots: { time: slotTime }
                }
            }
        );
        return result;
    } catch (error) {
        logger.error('Error removing slot:', error);
        throw error;
    }
}

async function addSlotToConfiguration(doctorId, targetDate, slotTime) {
    try {
        const normalizedDate = typeof targetDate === 'string' 
            ? new Date(targetDate + 'T00:00:00.000Z')
            : new Date(targetDate.toISOString().split('T')[0] + 'T00:00:00.000Z');
        
        const result = await SlotConfiguration.updateOne(
            { doctorId, date: normalizedDate },
            {
                $push: {
                    availableSlots: {
                        time: slotTime,
                        isActive: true,
                        isBlocked: false
                    }
                }
            },
            { upsert: true }
        );
        return result;
    } catch (error) {
        logger.error('Error adding slot:', error);
        throw error;
    }
}

module.exports = {
    DEFAULT_TIME_SLOTS,
    getConsultationSlots,
    getAssessmentSlots,
    getAssessmentSlotsFromList,
    getBlockedSlotsByAssessment,
    isSlotAvailable,
    getAvailableSlots,
    getDynamicSlots,
    validateSlotBooking,
    timeToMinutes,
    minutesToTime,
    isConsecutiveSlots,
    checkSlotTimeConflicts,
    // Superadmin functions
    createDefaultSlotConfiguration,
    ensureSlotInConfiguration,
    blockSlotsForAppointment,
    createOrUpdateSlotConfiguration,
    blockSlot,
    unblockSlot,
    setOperationalStatus,
    removeSlotFromConfiguration,
    addSlotToConfiguration
};