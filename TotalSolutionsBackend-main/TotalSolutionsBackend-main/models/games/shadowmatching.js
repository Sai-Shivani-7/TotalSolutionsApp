const mongoose = require('mongoose');
const GameSchema = new mongoose.Schema({
    name: { type: String, required: true },
    items: [
        {
            display: { type: String, required: true },
            images: [
                {
                    src: { type: String, required: true },
                    expected: { type: Boolean, required: true }
                }
            ]
        }
    ]
});

const ShadowMatching = mongoose.model('ShadowMatching', GameSchema);

module.exports = ShadowMatching;
