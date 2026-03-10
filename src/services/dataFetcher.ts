/**
 * Fetch news from free sources (no API keys required)
 * Optimized for speed with caching
 */

import axios from 'axios';
import Parser from 'rss-parser';

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
  author?: string;
}

const parser = new Parser({
  timeout: 5000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/rdf+xml, application/atom+xml, application/xml, text/xml, */*',
  }
});

let cachedArticles: NewsItem[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000;

export class DataFetcher {
  async fetchHackerNews(): Promise<NewsItem[]> {
    try {
      const response = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty', { timeout: 5000 });
      const storyIds = response.data.slice(0, 15);
      const items: NewsItem[] = [];
      for (const id of storyIds) {
        try {
          const story = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, { timeout: 2000 });
          if (story.data.title) {
            items.push({
              id: `hn-${id}`,
              title: story.data.title,
              description: story.data.title,
              url: story.data.url || `https://news.ycombinator.com/item?id=${id}`,
              source: 'Hacker News',
              publishedAt: new Date(story.data.time * 1000).toISOString(),
              author: story.data.by,
            });
          }
        } catch (e) { continue; }
      }
      return items;
    } catch (error) {
      console.error('HN fetch failed:', error);
      return [];
    }
  }

  async fetchArxiv(): Promise<NewsItem[]> {
    try {
      const feed = await parser.parseURL('http://arxiv.org/rss/cs.AI/recent');
      return (feed.items || []).slice(0, 15).map((item) => ({
        id: `arxiv-${item.link?.split('/').pop()}`,
        title: item.title || 'Untitled',
        description: item.contentSnippet || item.title || '',
        url: item.link || '',
        source: 'ArXiv',
        publishedAt: item.pubDate || new Date().toISOString(),
        author: item.creator,
      }));
    } catch (error) {
      console.error('ArXiv fetch failed:', error);
      return [];
    }
  }

  async fetchGitHubTrending(): Promise<NewsItem[]> {
    try {
      const response = await axios.get('https://api.github.com/search/repositories?q=topic:artificial-intelligence+language:python&sort=stars&order=desc', {
        headers: { Accept: 'application/vnd.github.v3+json' },
        timeout: 5000,
      });
      return (response.data.items || []).slice(0, 10).map((repo: any) => ({
        id: `github-${repo.id}`,
        title: `${repo.full_name}: ${repo.description || repo.name}`,
        description: repo.description || repo.name,
        url: repo.html_url,
        source: 'GitHub',
        publishedAt: repo.updated_at || new Date().toISOString(),
        author: repo.owner.login,
      }));
    } catch (error) {
      console.error('GitHub fetch failed:', error);
      return [];
    }
  }

  async fetchFromRSS(source: { id: string, name: string, url: string }): Promise<NewsItem[]> {
    try {
      const feed = await parser.parseURL(source.url);
      return (feed.items || []).slice(0, 10).map((item) => ({
        id: `rss-${source.id}-${(function (s) { let h = 0; for (let i = 0; i < s.length; i++)h = Math.imul(31, h) + s.charCodeAt(i) | 0; return Math.abs(h).toString(36); })(item.link || item.title || Math.random().toString())}`,
        title: item.title || 'Untitled',
        description: item.contentSnippet || item.title || '',
        url: item.link || '',
        source: source.name,
        publishedAt: item.pubDate || new Date().toISOString(),
        author: item.creator,
      }));
    } catch (error) {
      console.warn(`Failed to fetch from ${source.name}:`, error);
      return [];
    }
  }

  async fetchAll(): Promise<NewsItem[]> {
    if (cachedArticles.length > 0 && Date.now() - lastFetchTime < CACHE_DURATION) {
      return cachedArticles;
    }

    try {
      const { fileURLToPath } = await import('url');
      const fs = await import('fs/promises');
      const path = await import('path');
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const SOURCES_FILE = path.join(__dirname, '../../data/sources.json');

      const data = await fs.readFile(SOURCES_FILE, 'utf-8');
      const config = JSON.parse(data);
      const activeSources = (config.sources || []).filter((s: any) => s.enabled);

      const fetchTasks = activeSources.map(async (source: any) => {
        try {
          if (source.type === 'rss') {
            return this.fetchFromRSS(source);
          } else if (source.type === 'hackernews') {
            return this.fetchHackerNews();
          } else if (source.type === 'github') {
            return this.fetchGitHubTrending();
          }
        } catch (err) {
          console.error(`Error fetching source ${source.name}:`, err);
        }
        return [];
      });

      // Special case: ArXiv is sometimes missed or needs specific handling
      // but it's usually in the RSS config.

      const results = await Promise.allSettled(fetchTasks);
      const allItems: NewsItem[] = results.flatMap((r, idx) => {
        const sourceName = activeSources[idx]?.name || 'Unknown';
        if (r.status === 'fulfilled') {
          console.log(`✅ ${sourceName}: fetched ${r.value.length} items`);
          return r.value;
        } else {
          console.error(`❌ ${sourceName}: fetch failed - ${r.reason}`);
          return [];
        }
      });

      console.log(`📊 Total items before deduplication: ${allItems.length}`);

      const seen = new Set<string>();
      const unique = allItems.filter((item) => {
        const key = item.url.toLowerCase().trim();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      console.log(`✨ Total unique items: ${unique.length}`);

      const sorted = unique.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      cachedArticles = sorted.slice(0, 100);
      lastFetchTime = Date.now();
      return cachedArticles;
    } catch (error) {
      console.error('Failed to fetch all articles:', error);
      return cachedArticles;
    }
  }
}

export const dataFetcher = new DataFetcher();
