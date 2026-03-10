import express, { Request, Response } from 'express';
import { twitterService } from '../services/twitterService.js';

export const twitterRouter = express.Router();

// Search tweets
twitterRouter.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, limit } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const tweets = await twitterService.searchTweets(
      q as string,
      parseInt(limit as string) || 50
    );

    // Cache tweets
    for (const tweet of tweets) {
      await twitterService.cacheTweet(tweet);
    }

    res.json(tweets);
  } catch (error) {
    console.error('Error searching tweets:', error);
    res.status(500).json({ error: 'Failed to search tweets' });
  }
});

// Get recent cached tweets
twitterRouter.get('/recent', async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;
    const tweets = await twitterService.getRecentTweets(parseInt(limit as string) || 50);
    res.json(tweets);
  } catch (error) {
    console.error('Error fetching tweets:', error);
    res.status(500).json({ error: 'Failed to fetch tweets' });
  }
});

// Stream tweets for a hashtag or keyword (endpoint to trigger streaming)
twitterRouter.post('/stream', async (req: Request, res: Response) => {
  try {
    const { keywords } = req.body;

    if (!keywords || keywords.length === 0) {
      return res.status(400).json({ error: 'Keywords required' });
    }

    // Start streaming
    twitterService.streamTweets(keywords);

    res.json({
      success: true,
      message: 'Tweet streaming started',
      keywords,
    });
  } catch (error) {
    console.error('Error starting stream:', error);
    res.status(500).json({ error: 'Failed to start streaming' });
  }
});
