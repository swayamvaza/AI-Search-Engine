const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    title: String,
    content: String,
    embedding: [Number] // This must be an array of numbers
});

module.exports = mongoose.model('Item', itemSchema);