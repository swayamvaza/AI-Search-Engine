const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, './src/token.env')});
const Item = require('./Item');
const MONGO_URL = "mongodb+srv://Kael:aA1bB211022005@test.gqqiiqc.mongodb.net/?appName=TEST";
const OLLAMA_URL = "http://localhost:11434/api/embeddings";
const express = require('express');

if (!process.env.HF_TOKEN) {
    process.exit(1);
}

mongoose.connect(MONGO_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Connection Error", err));

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send("Running");
});

app.post('/add-item', async (req, res) => {
    try {
        const { title, content } = req.body;
        const response = await fetch(OLLAMA_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "mxbai-embed-large",
                prompt: content
            }),
        });
        const data = await response.json();
        const embedding = data.embedding;
        const newItem = new Item({ title, content, embedding });
        await newItem.save();
        res.status(201).json({ message: "Success" });
    } catch (err) {
        res.status(500).json({ error: "Ollama Error" });
    }
});

app.post('/search', async (req, res) => {
    try {
        const {query} = req.body;
        const response = await fetch(OLLAMA_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "mxbai-embed-large",
                prompt: query
            }),
        });
        const data = await response.json();
        const queryVector = data.embedding;

        const results = await Item.aggregate([
            {
                "$vectorSearch": {
                    "index": "vector_index",
                    "path": "embedding",
                    "queryVector": queryVector,
                    "numCandidates": 10,
                    "limit": 3
                }
            },
            {
                "$project": {
                    "title": 1,
                    "content": 1,
                    "score": { "$meta": "vectorSearchScore" }
                }
            }
        ]);
        res.json(results);
    } catch (err) {
        res.status(500).json({error: "Search failed"});
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server at ${PORT}`);
});