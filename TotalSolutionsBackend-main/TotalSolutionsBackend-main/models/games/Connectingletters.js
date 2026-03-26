const mongoose = require('mongoose');
const ConnectingLettersSchema =  new mongoose.Schema({
    level: {
        type: Number,
        required: true
    },
    item: {
        type: Number,
        required: true
    },
    content:{
        type:mongoose.Schema.Types.Mixed,
        required: true
    }
    
});

module.exports = mongoose.model('ConnectingLetter', ConnectingLettersSchema);