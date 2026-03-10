import express, { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCES_FILE = path.join(__dirname, '../../data/sources.json');

export const sourcesRouter = express.Router();

interface NewsSource {
  id: string;
  name: string;
  type: 'rss' | 'hackernews' | 'github' | 'video';
  url: string;
  enabled: boolean;
  category: string;
  pollInterval: number;
  lastPolled?: string | null;
  params?: Record<string, any>;
}

async function readSourcesConfig() {
  try {
    const data = await fs.readFile(SOURCES_FILE, 'utf-8');
    if (!data || data.trim() === '') {
      throw new Error('Empty file');
    }
    return JSON.parse(data);
  } catch (error) {
    console.warn('Sources file missing or invalid, initializing default...');
    const defaultConfig = {
      sources: [],
      settings: {
        refreshInterval: 300,
        maxArticlesPerSource: 50,
        mapZoom: 3,
        centerLat: 20,
        centerLng: 0,
        modules: ["map", "feed", "videos", "stats"]
      }
    };
    // Ensure directory exists
    await fs.mkdir(path.dirname(SOURCES_FILE), { recursive: true });
    await fs.writeFile(SOURCES_FILE, JSON.stringify(defaultConfig, null, 2));
    return defaultConfig;
  }
}

// Get all sources
sourcesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const config = await readSourcesConfig();
    res.json(config.sources);
  } catch (error) {
    console.error('Error reading sources:', error);
    res.status(500).json({ error: 'Failed to read sources' });
  }
});

// Add new source
sourcesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { name, type, url, category, enabled = true } = req.body;

    // Validation
    if (!name || !type || !url || !category) {
      return res.status(400).json({ error: 'Missing required fields: name, type, url, category' });
    }

    const config = await readSourcesConfig();

    // Generate ID from name
    const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Check for duplicate
    if (config.sources.some((s: NewsSource) => s.id === id)) {
      return res.status(400).json({ error: `Source with id "${id}" already exists` });
    }

    // Create new source
    const newSource: NewsSource = {
      id,
      name,
      type,
      url,
      category,
      enabled,
      pollInterval: 1800, // Default 30 minutes
      lastPolled: null,
    };

    config.sources.push(newSource);

    // Write back to file
    await fs.writeFile(SOURCES_FILE, JSON.stringify(config, null, 2));

    res.json({ success: true, source: newSource });
  } catch (error) {
    console.error('Error adding source:', error);
    res.status(500).json({ error: 'Failed to add source' });
  }
});

// Update source
sourcesRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const config = await readSourcesConfig();

    // Find and update source
    const sourceIndex = config.sources.findIndex((s: NewsSource) => s.id === id);
    if (sourceIndex === -1) {
      return res.status(404).json({ error: `Source "${id}" not found` });
    }

    config.sources[sourceIndex] = {
      ...config.sources[sourceIndex],
      ...updates,
      id, // Prevent ID changes
    };

    // Write back to file
    await fs.writeFile(SOURCES_FILE, JSON.stringify(config, null, 2));

    res.json({ success: true, source: config.sources[sourceIndex] });
  } catch (error) {
    console.error('Error updating source:', error);
    res.status(500).json({ error: 'Failed to update source' });
  }
});

// Delete source
sourcesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const config = await readSourcesConfig();

    // Find source
    const sourceIndex = config.sources.findIndex((s: NewsSource) => s.id === id);
    if (sourceIndex === -1) {
      return res.status(404).json({ error: `Source "${id}" not found` });
    }

    // Remove source
    const removed = config.sources.splice(sourceIndex, 1);

    // Write back to file
    await fs.writeFile(SOURCES_FILE, JSON.stringify(config, null, 2));

    res.json({ success: true, removed: removed[0] });
  } catch (error) {
    console.error('Error deleting source:', error);
    res.status(500).json({ error: 'Failed to delete source' });
  }
});

// Toggle source enabled/disabled
sourcesRouter.patch('/:id/toggle', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const config = await readSourcesConfig();

    // Find and toggle source
    const sourceIndex = config.sources.findIndex((s: NewsSource) => s.id === id);
    if (sourceIndex === -1) {
      return res.status(404).json({ error: `Source "${id}" not found` });
    }

    config.sources[sourceIndex].enabled = !config.sources[sourceIndex].enabled;

    // Write back to file
    await fs.writeFile(SOURCES_FILE, JSON.stringify(config, null, 2));

    res.json({ success: true, source: config.sources[sourceIndex] });
  } catch (error) {
    console.error('Error toggling source:', error);
    res.status(500).json({ error: 'Failed to toggle source' });
  }
});
