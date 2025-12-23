const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CarbonSchema = new Schema({
    title: String,
    footprint: Number,
});

module.exports = mongoose.model('Carbon', CarbonSchema);