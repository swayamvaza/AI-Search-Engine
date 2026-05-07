const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, 'token.env')});
const Item = require('./Item');

const MONGO_URL = "mongodb+srv://Kael:aA1bB211022005@test.gqqiiqc.mongodb.net/?appName=TEST";
const OLLAMA_URL = "http://localhost:11434/api/embeddings";

// 1. YOUR DATA DUMP HERE
const myPhotographyData = [
    {
        title: "Golden Hour Street",
        content: "Long shadows and warm orange light hitting a busy intersection in the city, urban aesthetic."
    },
    {
        title: "Minimalist Portrait",
        content: "Clean white background with a subject in dark clothing, high-key lighting and sharp focus."
    },
    {
        title: "Night Trails",
        content: "Long exposure of car headlights on a mountain road, streaks of red and white light."
    },
    // Add 50 more here if you want!
];

async function seedData() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to MongoDB...");

        for (const photo of myPhotographyData) {
            console.log(`Generating embedding for: ${photo.title}`);

            const response = await fetch(OLLAMA_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "mxbai-embed-large",
                    prompt: photo.content
                }),
            });

            const data = await response.json();

            const newItem = new Item({
                title: photo.title,
                content: photo.content,
                embedding: data.embedding
            });

            await newItem.save();
        }

        console.log("✅ All data seeded successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding Error:", err);
        process.exit(1);
    }
}

seedData();