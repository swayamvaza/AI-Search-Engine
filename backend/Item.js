const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    title: String,
    content: String,
    embedding: [Number]
});

module.exports = mongoose.model('Item', itemSchema);