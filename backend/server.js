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
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Connection Error:", err));

/**
 * AI Logic: Get Vector Embedding
 */
// Update the function signature to accept 'options'
const getEmbedding = async (text, options = {}) => {
    try {
        const response = await fetch(OLLAMA_URL, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            // Pass the signal into the fetch call here!
            signal: options.signal,
            body: JSON.stringify({
                model: "mxbai-embed-large",
                prompt: text.toString().substring(0, 1800)
            }),
        });
        if (!response.ok) throw new Error(`Ollama error: ${response.status}`);
        const data = await response.json();
        return data.embedding;
    } catch (err) {
        // Don't log error if it was just a deliberate timeout/abort
        if (err.name !== 'AbortError') {
            console.error("❌ Ollama connection failed:", err.message);
        }
        throw err;
    }
};

/**
 * Hunter Logic: Real-time Scraper
 */
/**
 * Hunter Logic: Enhanced Scraper with Resilience
 */
const scrapeAndIndex = async (url) => {
    try {
        console.log(`Starting crawl: ${url}`);

        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
            },
            timeout: 10000
        });

        const $ = cheerio.load(data);
        const title = $('#firstHeading').text().trim();

        // 1. ROBUST DISAMBIGUATION CHECK
        // We check the first few paragraphs for "refer to" instead of just the first one.
        let isActuallyAmbiguous = title.toLowerCase().includes('(disambiguation)');

        $('#mw-content-text .mw-parser-output p').slice(0, 3).each((i, el) => {
            if ($(el).text().toLowerCase().includes('refer to:')) {
                isActuallyAmbiguous = true;
            }
        });

        if (isActuallyAmbiguous) {
            console.log("Skipping: Page is a list of options (Disambiguation).");
            return null;
        }

        // 2. SMART CONTENT EXTRACTION
        // Instead of slice(0,5), we loop until we have 5 solid paragraphs.
        let rawContent = '';
        let paragraphCount = 0;

        $('#mw-content-text .mw-parser-output p').each((i, el) => {
            const text = $(el).text().trim();
            // Ignore tiny paragraphs, coordinates, or empty strings
            if (text.length > 50 && paragraphCount < 5) {
                rawContent += text + ' ';
                paragraphCount++;
            }
        });

        if (rawContent.length < 200) {
            console.log("Skipping: Content too thin for a quality vector.");
            return null;
        }

        // 3. FLAG & MEDIA SELECTION
        let thumbnail = $('.infobox img[alt*="Flag"]').first().attr('src') ||
            $('.infobox .mw-file-description img').first().attr('src') ||
            $('.infobox img').first().attr('src') ||
            $('meta[property="og:image"]').attr('content');

        if (thumbnail && thumbnail.startsWith('//')) thumbnail = 'https:' + thumbnail;

        if (thumbnail && thumbnail.includes('/thumb/')) {
            thumbnail = thumbnail.replace(/\/thumb\//, '/').replace(/\/(\d+)px-.*$/, '');
        }

        const isUiIcon = !thumbnail ||
            thumbnail.includes('magnify') ||
            thumbnail.includes('Red_p_check') ||
            thumbnail.includes('Wiki_letter') ||
            thumbnail.includes('Edit-clear') ||
            thumbnail.includes('Ambox_'); // Filter out system alert icons

        const finalThumb = isUiIcon ? null : thumbnail;

        // 4. DATA NORMALIZATION
        const cleanContent = rawContent.replace(/\[\d+\]|\[edit\]/g, '').substring(0, 1800);

        // 5. DUPLICATE CHECK
        const existing = await Item.findOne({ title });
        if (existing) {
            console.log("Result already cached in DB:", title);
            return { ...existing._doc, score: 0.99 };
        }

        // 6. RESILIENT EMBEDDING CALL
        console.log(`Requesting vector for: ${title}...`);
        let embedding;
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 12000);

            // Pass options as second argument
            embedding = await getEmbedding(cleanContent, { signal: controller.signal });
            clearTimeout(timeoutId);
        } catch (e) {
            console.error("Vector Service Timeout. Crawl canceled.");
            return null;
        }

        if (!embedding) return null;

        // 7. SAVE
        const newItem = new Item({
            title,
            content: cleanContent,
            embedding,
            thumbnail: finalThumb,
            url
        });

        await newItem.save();
        console.log("Successfully Indexed:", title);
        return { ...newItem._doc, score: 0.99 };

    } catch (err) {
        console.error("Crawl failed:", err.message);
        return null;
    }
};/**
 * Main Search Route
 */
app.post('/search', async (req, res) => {
    try {
        let {query} = req.body;

        // AI Correction Layer
        try {
            const aiCorrection = await fetch("http://127.0.0.1:11434/api/generate", {
                method: "POST",
                body: JSON.stringify({
                    model: "gemma2:2b",
                    prompt: `You are a Wikipedia Search Query Optimizer.
Rules:
1. Fix typos and resolve the intended entity.
2. Identify the official Wikipedia article title.
3. Replace all spaces with underscores (_).
4. Return ONLY the formatted string. No quotes, no intro, no conversational text.

Examples:
- "lui hamilto" -> "Lewis_Hamilton"
- "dante from dmc" -> "Dante_(Devil_May_Cry)"
- "tallest building dubai" -> "Burj_Khalifa"
- "india country" -> "India"
- "vergil gamecharacter" -> "Vergil_(Devil_May_Cry)"

User searched: "${query}"
Wiki Query:`,
                    stream: false
                })
            });
            const correctionData = await aiCorrection.json();
            const cleanedQuery = correctionData.response.trim();

            if (cleanedQuery.length < 50) {
                console.log("AI Corrected:", query, "->", cleanedQuery);
                query = cleanedQuery;
            }
        } catch (err) {
            console.log("Correction model offline, using raw query.");
        }

        const queryVector = await getEmbedding(query);

        let results = await Item.aggregate([{
            $vectorSearch: {
                index: "vector_index",
                path: "embedding",
                queryVector,
                numCandidates: 15,
                limit: 5
            }
        }, {
            $project: {
                title: 1,
                content: 1,
                thumbnail: 1,
                url: 1,
                score: {$meta: "vectorSearchScore"}
            }
        }]);

        // Keyword Boost Logic for Specificity
        results = results.map(item => {
            const queryLower = query.toLowerCase();
            const titleLower = item.title.toLowerCase();

            // If main name is in title, boost score
            const mainName = queryLower.split(' ')[0];
            if (mainName.length > 2 && titleLower.includes(mainName)) {
                item.score += 0.1;
            }
            return item;
        });

        // Dynamic Threshold: Strict for long specific queries
        const threshold = query.length < 10 ? 0.67 : 0.82;
        const highQualityMatch = results.length > 0 && results[0].score > threshold;

        if (!highQualityMatch) {
            console.log("Hunting Wikipedia for:", query);

            try {
                const searchRes = await axios.get(`https://en.wikipedia.org/w/api.php`, {
                    params: {
                        action: 'query',
                        list: 'search',
                        srsearch: query,
                        format: 'json',
                        origin: '*'
                    },
                    headers: {
                        'User-Agent': 'Chikupixels-AI-Engine/1.0 (contact: your-email@example.com)'
                    }
                });

                const bestMatch = searchRes.data.query.search[0];

                if (bestMatch) {
                    const officialTitle = bestMatch.title.replace(/ /g, '_');
                    const wikiUrl = `https://en.wikipedia.org/wiki/${officialTitle}`;

                    const duplicateCheck = await Item.findOne({url: wikiUrl});

                    if (duplicateCheck) {
                        results = [{...duplicateCheck._doc, score: 0.99}, ...results];
                    } else {
                        const autoData = await scrapeAndIndex(wikiUrl);
                        if (autoData) {
                            results = [autoData, ...results];
                        }
                    }
                }
            } catch (err) {
                console.error("Hunter API error:", err.message);
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
    const item = await Item.findById(req.params.id);
    res.json(item);
});

app.listen(PORT, () => console.log(`Server live at http://localhost:${PORT}`));