const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 600 }); // 缓存10分钟

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

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
                    const pageResponse = await axios.get(item.url, { timeout: 5000 }); // 5 seconds timeout
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
};