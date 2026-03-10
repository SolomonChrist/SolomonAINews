import express, { Request, Response } from 'express';
import { videoService } from '../services/videoService.js';

export const videosRouter = express.Router();

// Get current live news streams
videosRouter.get('/live', async (req: Request, res: Response) => {
  try {
    const videos = await videoService.fetchAndCacheLive();
    res.json(videos);
  } catch (error) {
    console.error('Error fetching live videos:', error);
    res.status(500).json({ error: 'Failed to fetch live videos' });
  }
});

// Search for live streams on YouTube
videosRouter.get('/youtube/live', async (req: Request, res: Response) => {
  try {
    const { q, limit } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const videos = await videoService.searchYouTubeLive(
      q as string,
      parseInt(limit as string) || 20
    );

    // Cache videos
    for (const video of videos) {
      await videoService.cacheVideo(video);
    }

    res.json(videos);
  } catch (error) {
    console.error('Error searching YouTube:', error);
    res.status(500).json({ error: 'Failed to search YouTube' });
  }
});

// Get cached live videos
videosRouter.get('/cached', async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;
    const videos = await videoService.getLiveVideos(parseInt(limit as string) || 30);
    res.json(videos);
  } catch (error) {
    console.error('Error fetching cached videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});
