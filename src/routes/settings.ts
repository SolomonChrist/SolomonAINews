import express, { Request, Response } from 'express';
import { getDatabase } from '../db/database.js';

export const settingsRouter = express.Router();

// Get user preferences
settingsRouter.get('/preferences', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const prefs = await db.get(`SELECT * FROM user_preferences LIMIT 1`);

    res.json(
      prefs || {
        categories: ['business', 'technology', 'health'],
        sources: [],
        keywords: [],
        refresh_interval: 300,
      }
    );
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// Update user preferences
settingsRouter.post('/preferences', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const { categories, sources, keywords, refresh_interval } = req.body;

    await db.run(
      `INSERT OR REPLACE INTO user_preferences
      (user_id, categories, sources, keywords, refresh_interval)
      VALUES ('default', ?, ?, ?, ?)`,
      [
        JSON.stringify(categories || []),
        JSON.stringify(sources || []),
        JSON.stringify(keywords || []),
        refresh_interval || 300,
      ]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Get all settings
settingsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const settings = await db.all(`SELECT * FROM user_settings`);

    const settingsObj: Record<string, string> = {};
    settings.forEach((s: any) => {
      settingsObj[s.setting_key] = s.setting_value;
    });

    res.json(settingsObj);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update a setting
settingsRouter.post('/:key', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const { key } = req.params;
    const { value } = req.body;

    await db.run(
      `INSERT OR REPLACE INTO user_settings (setting_key, setting_value)
       VALUES (?, ?)`,
      [key, value]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});
