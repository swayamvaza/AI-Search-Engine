const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    title: String,
    content: String,
    url: String,
    thumbnail: String, // <--- MAKE SURE THIS LINE EXISTS
    embedding: [Number]
});

module.exports = mongoose.model('Item', itemSchema);