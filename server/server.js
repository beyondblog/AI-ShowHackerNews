const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const NodeCache = require('node-cache');

const app = express();
const PORT = process.env.PORT || 5001;  // 将端口改为 5001
const cache = new NodeCache({ stdTTL: 600 }); // 缓存10分钟

app.use(cors());

app.get('/api/showhn', async (req, res) => {
    try {
        const cachedItems = cache.get('showHNItems');
        if (cachedItems) {
            console.log('Returning cached data');
            return res.json(cachedItems);
        }

        console.log('Fetching data from Hacker News...');
        const response = await axios.get('https://news.ycombinator.com/show');
        const $ = cheerio.load(response.data);
        const items = [];

        $('tr.athing').each((index, element) => {
            const $element = $(element);
            const $subtext = $element.next('tr');

            const title = $element.find('span.titleline > a').first().text().trim();
            const url = $element.find('span.titleline > a').first().attr('href');
            const points = parseInt($subtext.find('span.score').text()) || 0;
            const author = $subtext.find('a.hnuser').text().trim();
            const commentsLink = 'https://news.ycombinator.com/' + $subtext.find('a:contains("comment")').attr('href');
            const commentsText = $subtext.find('a:contains("comment")').text();
            const comments = commentsText ? parseInt(commentsText.split('\xa0')[0]) : 0;

            if (title) {
                items.push({ title, url, points, author, comments, commentsLink });
            }
        });

        // Fetch summaries and images
        for (let item of items) {
            try {
                const cachedData = cache.get(item.url);
                if (cachedData) {
                    Object.assign(item, cachedData);
                } else {
                    const pageResponse = await axios.get(item.url);
                    const page$ = cheerio.load(pageResponse.data);
                    const summary = page$('meta[name="description"]').attr('content') || '';
                    const image = page$('meta[property="og:image"]').attr('content') || '';
                    Object.assign(item, { summary, image });
                    cache.set(item.url, { summary, image });
                }
            } catch (error) {
                console.error(`Error fetching additional data for ${item.url}:`, error.message);
                item.summary = '';
                item.image = '';
            }
        }

        console.log(`Fetched ${items.length} items`);
        cache.set('showHNItems', items);
        res.json(items);
    } catch (error) {
        console.error('Error fetching Show HN items:', error.message);
        res.status(500).json({ error: 'An error occurred while fetching data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}).on('error', (err) => {
    console.error('Failed to start server:', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});