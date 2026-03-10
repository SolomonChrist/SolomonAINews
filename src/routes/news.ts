import express, { Request, Response } from 'express';
import { newsService } from '../services/newsService.js';

export const newsRouter = express.Router();

// Get top stories by category
newsRouter.get('/category/:category', async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const { limit } = req.query;

    const articles = await newsService.getRecent(category, parseInt(limit as string) || 50);
    res.json(articles);
  } catch (error) {
    console.error('Error fetching category news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Search articles
newsRouter.get('/search', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const articles = await newsService.searchArticles(q as string);
    res.json(articles);
  } catch (error) {
    console.error('Error searching news:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Fetch and cache fresh news
newsRouter.post('/refresh/:category', async (req: Request, res: Response) => {
  try {
    const { category } = req.params;

    const articles = await newsService.fetchAndCache(category, category);
    res.json({
      success: true,
      count: articles.length,
      articles: articles.slice(0, 20),
    });
  } catch (error) {
    console.error('Error refreshing news:', error);
    res.status(500).json({ error: 'Failed to refresh news' });
  }
});

// Get all recent articles
newsRouter.get('/recent', async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;
    const articles = await newsService.getRecent(undefined, parseInt(limit as string) || 100);
    res.json(articles);
  } catch (error) {
    console.error('Error fetching recent news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Get articles with locations for dashboard
newsRouter.get('/feed', async (req: Request, res: Response) => {
  try {
    // Dynamically import the dataFetcher and locationExtractor
    const { dataFetcher } = await import('../services/dataFetcher.js');
    const { locationExtractor } = await import('../services/locationExtractor.js');

    // Fetch all articles from unified dataFetcher (handles both defaults and config)
    const articles = await dataFetcher.fetchAll();
    
    // Extract locations for each article
    const articlesWithLocations = articles.map((article) => {
      const location = locationExtractor.extract(article.title, article.description);
      return {
        ...article,
        location,
      };
    });

    res.json({
      articles: articlesWithLocations,
      total: articles.length,
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({
      articles: [],
      unlocated: [],
      total: 0,
      error: 'Failed to fetch feed',
    });
  }
});
