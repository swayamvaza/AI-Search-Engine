const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, './src/token.env')}); // FIXED PATH

const Item = require('./Item');

const app = express();
app.use(cors());
app.use(express.json());

// 1. CONFIGURATION
const MONGO_URL = "mongodb+srv://Kael:aA1bB211022005@test.gqqiiqc.mongodb.net/?appName=TEST";
const HF_API_URL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2";

// SILLY MISTAKE CHECK: Fail fast if token is missing
if (!process.env.HF_TOKEN) {
    console.error("❌ ERROR: HF_TOKEN is missing! Check your src/.env file.");
    process.exit(1);
}

// 2. DATABASE CONNECTION
mongoose.connect(MONGO_URL)
    .then(() => console.log("✅ Connected to MongoDB!"))
    .catch(err => console.error("❌ Could not connect to MongoDB", err));

// 3. ROUTES
app.get('/', (req, res) => {
    res.send("AI Search Backend is Running!");
});

// ADD ITEM ROUTE

app.post('/add-item', async (req, res) => {
    console.log("--- Debug Check ---");
    console.log("Token exists:", !!process.env.HF_TOKEN);
    console.log("Request Body:", req.body);
    try {
        const {title, content} = req.body;

        const response = await fetch(HF_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.HF_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({inputs: content}),
        });

        // 1. Get the raw response first
        const result = await response.json();

        // 2. Check if the AI returned an error instead of numbers
        if (result.error) {
            console.log("AI Model Status:", result.error);
            return res.status(503).json({
                message: "AI is waking up, please wait 20 seconds and try again.",
                details: result.error
            });
        }

        // 3. If we got numbers, save to MongoDB
        const newItem = new Item({title, content, embedding: result});
        await newItem.save();

        res.status(201).json({message: "Success! Item saved."});

    } catch (err) {
        console.error("CRASH LOG:", err);
        res.status(500).json({error: "Server crashed. Check terminal."});
    }
});

// SEARCH ROUTE
app.post('/search', async (req, res) => {
    try {
        const {query} = req.body;

        const response = await fetch(HF_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.HF_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({inputs: query}),
        });

        const queryVector = await response.json();

        if (queryVector.error) {
            return res.status(500).json({error: queryVector.error});
        }

        const results = await Item.aggregate([
            {
                "$vectorSearch": {
                    "index": "vector_index",
                    "path": "embedding",
                    "queryVector": queryVector,
                    "numCandidates": 10,
                    "limit": 3
                }
            }
        ]);

        res.json(results);
    } catch (err) {
        console.error("Search Crash Log:", err);
        res.status(500).json({error: "Search failed."});
    }
});

// 4. START SERVER
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is moving on http://localhost:${PORT}`);
});