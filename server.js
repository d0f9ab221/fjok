// Server-side YouTube Channel Profiler
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// YouTube API Key - Replace with your actual API key or use environment variable
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'YOUR_API_KEY_HERE';

// Helper function to extract channel ID from URL
function extractChannelId(url) {
    try {
        const parsed = new URL(url);
        if (parsed.hostname === 'www.youtube.com' || parsed.hostname === 'youtube.com' || parsed.hostname === 'm.youtube.com') {
            const path = parsed.pathname;
            if (path.startsWith('/channel/')) {
                return path.split('/channel/')[1].split('?')[0];
            } else if (path.startsWith('/user/')) {
                return path.split('/user/')[1].split('?')[0];
            }
        }
    } catch (e) {
        // Ignore invalid URL parsing
    }
    return null;
}

// API endpoint to generate YouTube channel profile
app.post('/api/generate-profile', async (req, res) => {
    try {
        const { channelUrl } = req.body;
        
        if (!channelUrl || typeof channelUrl !== 'string') {
            return res.status(400).json({ error: 'Channel URL is required' });
        }
        
        const channelId = extractChannelId(channelUrl);
        if (!channelId) {
            return res.status(400).json({ error: 'Invalid YouTube channel URL' });
        }
        
        // Fetch channel data from YouTube Data API
        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${YOUTUBE_API_KEY}`;
        
        const response = await fetch(channelUrl);
        
        if (!response.ok) {
            throw new Error(`YouTube API error: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
            return res.status(404).json({ error: 'Channel not found' });
        }
        
        const channel = data.items[0];
        const snippet = channel.snippet;
        const title = snippet.title;
        const logoUrl = snippet.thumbnails.high.url;
        const channelIdValue = channel.id;
        
        // Generate subscribe button HTML
        const subscribeButton = `
            <div class="g-ytsubscribe" data-channelid="${channelIdValue}" data-layout="default" data-count="default"></div>
            <script src="https://apis.google.com/js/platform.js" async></script>
        `;
        
        res.json({
            success: true,
            channel: {
                name: title,
                logo: logoUrl,
                id: channelIdValue
            },
            subscribeButton: subscribeButton
        });
        
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Failed to generate profile. Please check the channel URL and try again.' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
