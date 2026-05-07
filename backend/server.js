const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, './src/token.env')});

const Item = require('./Item');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URL = "mongodb+srv://Kael:aA1bB211022005@test.gqqiiqc.mongodb.net/?appName=TEST";
const OLLAMA_URL = "http://localhost:11434/api/embeddings";

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(MONGO_URL)
    .then(() => console.log("🚀 Connected to MongoDB"))
    .catch(err => console.error("❌ Connection Error:", err));

/**
 * Helper: Fetch Embeddings from Ollama
 */
const getEmbedding = async (text) => {
    const response = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({model: "mxbai-embed-large", prompt: text}),
    });
    if (!response.ok) throw new Error('Ollama embedding failed');
    const data = await response.json();
    return data.embedding;
};

// Routes
app.get('/', (req, res) => res.send("Chikupixels API Running"));

// Get Single Blog Post
// This tells the server: "When someone asks for /items/[ID], find that specific story"
app.get('/items/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ error: "Story not found in the database" });
        }
        res.json(item); // Send the blog data back to the frontend
    } catch (err) {
        console.error("Database fetch error:", err);
        res.status(500).json({ error: "Server error fetching the story" });
    }
});

// Add New Story
app.post('/add-item', async (req, res) => {
    try {
        const {title, content} = req.body;
        const embedding = await getEmbedding(content);

        const newItem = new Item({title, content, embedding});
        await newItem.save();

        res.status(201).json({message: "Story added successfully"});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: err.message});
    }
});

// Semantic Search
app.post('/search', async (req, res) => {
    try {
        const {query} = req.body;
        const queryVector = await getEmbedding(query);

        const results = await Item.aggregate([
            {
                $vectorSearch: {
                    index: "vector_index",
                    path: "embedding",
                    queryVector,
                    numCandidates: 10,
                    limit: 3
                }
            },
            {
                $project: {
                    title: 1,
                    content: 1,
                    score: {$meta: "vectorSearchScore"}
                }
            }
        ]);
        res.json(results);
    } catch (err) {
        console.error("Search error:", err);
        res.status(500).json({error: "Search execution failed"});
    }
});

app.listen(PORT, () => console.log(`📡 Server live at http://localhost:${PORT}`));