const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const historySchema = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    prediction_id: {
        type: String,
        required: true,
        unique: true
    },
    prediction: {
        type: Array, // Stores the YOLO output array
        default: []
    },
    result: {
        type: Object, // Stores aggregated stats like { prediction: 1, probability: 0.95 }
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('History', historySchema);
