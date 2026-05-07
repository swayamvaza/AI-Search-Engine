const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config({path: path.resolve(__dirname, './src/token.env')});

const Item = require('./Item');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URL = "mongodb+srv://Kael:aA1bB211022005@test.gqqiiqc.mongodb.net/?appName=TEST";
const OLLAMA_URL = "http://127.0.0.1:11434/api/embeddings";

app.use(cors());
app.use(express.json());

mongoose.connect(MONGO_URL)
    .then(() => console.log("🚀 Connected to MongoDB"))
    .catch(err => console.error("❌ Connection Error:", err));

/**
 * AI Logic: Get Vector Embedding
 */
const getEmbedding = async (text) => {
    try {
        const response = await fetch(OLLAMA_URL, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                model: "mxbai-embed-large",
                prompt: text.toString().substring(0, 1800)
            }),
        });
        if (!response.ok) throw new Error(`Ollama error: ${response.status}`);
        const data = await response.json();
        return data.embedding;
    } catch (err) {
        console.error("❌ Ollama connection failed.");
        throw err;
    }
};

/**
 * Hunter Logic: Real-time Scraper
 */
const scrapeAndIndex = async (url) => {
    try {
        const {data} = await axios.get(url, {
            headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/122.0.0.0'},
            timeout: 5000
        });
        const $ = cheerio.load(data);
        const title = $('#firstHeading').text().trim();
        if (title.includes('(disambiguation)') || title.includes('Search results')) {
            console.log("⚠️ Hit a disambiguation page. Skipping...");
            return null;
        }
        let rawContent = '';
        $('#mw-content-text .mw-parser-output p').slice(0, 5).each((i, el) => {
            rawContent += $(el).text().trim() + ' ';
        });

        // 1. Better Image Extraction
        let thumbnail = $('.infobox img').first().attr('src') ||
            $('meta[property="og:image"]').attr('content') ||
            $('#mw-content-text img').first().attr('src');

        if (thumbnail && thumbnail.startsWith('//')) thumbnail = 'https:' + thumbnail;

        // 2. High-Res Patch: Wikipedia serves tiny 200px thumbs by default.
        // This regex tries to get the original file.
        if (thumbnail && thumbnail.includes('thumb')) {
            thumbnail = thumbnail.replace(/\/thumb\//, '/').replace(/\/(\d+)px-.*$/, '');
        }

        const isJunk = !thumbnail || thumbnail.includes('svg') || thumbnail.includes('icon');
        const finalThumb = isJunk ? null : thumbnail;

        if (!title || !rawContent) return null;

        const cleanContent = rawContent.replace(/\[\d+\]|\[edit\]/g, '').substring(0, 1800);
        const embedding = await getEmbedding(cleanContent);

        // Inside scrapeAndIndex, before const newItem = new Item({...})
        const existingItem = await Item.findOne({url: url});
        if (existingItem) {
            console.log(`♻️ Item already exists in DB: ${title}`);
            return {...existingItem._doc, score: 0.99};
        }

        const newItem = new Item({
            title,
            content: cleanContent,
            embedding,
            thumbnail: finalThumb,
            url
        });

        await newItem.save();
        console.log(`✅ Auto-Indexed: ${title}`);

        // Add a fake score so it displays at the top
        return {...newItem._doc, score: 0.99};
    } catch (err) {
        console.error("❌ Real-time scrape failed:", err.message);
        return null;
    }
};

/**
 * Main Search Route (Hybrid)
 */
app.post('/search', async (req, res) => {
    try {
        const {query} = req.body;
        const queryVector = await getEmbedding(query);

        // CHANGE: Use 'let' instead of 'const' so we can update results
        let results = await Item.aggregate([
            {
                $vectorSearch: {
                    index: "vector_index",
                    path: "embedding",
                    queryVector,
                    numCandidates: 10,
                    limit: 5
                }
            },
            {
                $project: {
                    title: 1,
                    content: 1,
                    thumbnail: 1,
                    url: 1,
                    score: {$meta: "vectorSearchScore"}
                }
            }
        ]);

        const highQualityMatch = results.length > 0 && results[0].score > 0.8;

        if (!highQualityMatch) {
            console.log(`🕵️ Hunting Wikipedia for "${query}"...`);

            const formattedQuery = query
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join('_');

            const wikiUrl = `https://en.wikipedia.org/wiki/${formattedQuery}`;
            const autoData = await scrapeAndIndex(wikiUrl);

            if (autoData) {
                // Prepend the new data to existing results
                results = [autoData, ...results];
            }
        }

        res.json(results);
    } catch (err) {
        console.error("Search error:", err);
        res.status(500).json({error: "Search failed"});
    }
});

app.post('/add-item', async (req, res) => {
    try {
        const {title, content, url, thumbnail} = req.body;
        const embedding = await getEmbedding(content);
        const newItem = new Item({title, content, url, thumbnail, embedding});
        await newItem.save();
        res.status(201).json({message: "Story added successfully", item: newItem});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

app.get('/items/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        res.json(item);
    } catch (err) {
        res.status(404).json({error: "Not found"});
    }
});

app.listen(PORT, () => console.log(`📡 Server live at http://localhost:${PORT}`));