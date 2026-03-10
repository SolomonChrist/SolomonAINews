import axios from 'axios';
import { getDatabase } from '../db/database.js';

interface Article {
  id: string;
  title: string;
  description?: string;
  content?: string;
  source: string;
  url: string;
  image_url?: string;
  published_at: string;
  category?: string;
}

export class NewsService {
  private newsApiKey = process.env.NEWSAPI_KEY;
  private newsdataKey = process.env.NEWSDATA_KEY;

  async fetchNewsAPI(query: string, category?: string): Promise<Article[]> {
    if (!this.newsApiKey) {
      console.warn('⚠️  NEWSAPI_KEY not configured');
      return [];
    }

    try {
      const endpoint = category
        ? `https://newsapi.org/v2/top-headlines?category=${category}&apiKey=${this.newsApiKey}`
        : `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&apiKey=${this.newsApiKey}&pageSize=50`;

      const response = await axios.get(endpoint, { timeout: 10000 });

      return response.data.articles.map((article: any, idx: number) => ({
        id: `newsapi-${Date.now()}-${idx}`,
        title: article.title,
        description: article.description,
        content: article.content,
        source: article.source.name,
        url: article.url,
        image_url: article.urlToImage,
        published_at: article.publishedAt,
        category: category || 'general',
      }));
    } catch (error) {
      console.error('❌ NewsAPI fetch failed:', error);
      return [];
    }
  }

  async fetchNewsdata(query: string, category?: string): Promise<Article[]> {
    if (!this.newsdataKey) {
      console.warn('⚠️  NEWSDATA_KEY not configured');
      return [];
    }

    try {
      const endpoint = `https://newsdata.io/api/1/news?q=${query}&apikey=${this.newsdataKey}&language=en`;
      const response = await axios.get(endpoint, { timeout: 10000 });

      return response.data.results.map((article: any, idx: number) => ({
        id: `newsdata-${Date.now()}-${idx}`,
        title: article.title,
        description: article.description,
        content: article.content,
        source: article.source_id,
        url: article.link,
        image_url: article.image_url,
        published_at: article.pubDate,
        category: article.category?.[0] || 'general',
      }));
    } catch (error) {
      console.error('❌ Newsdata fetch failed:', error);
      return [];
    }
  }

  async fetchAndCache(query: string, category?: string): Promise<Article[]> {
    // Fetch from both sources in parallel
    const [newsApiArticles, newsdataArticles] = await Promise.all([
      this.fetchNewsAPI(query, category),
      this.fetchNewsdata(query, category),
    ]);

    const allArticles = [...newsApiArticles, ...newsdataArticles];

    // Cache articles to database
    const db = getDatabase();
    for (const article of allArticles) {
      try {
        await db.run(
          `INSERT OR IGNORE INTO articles
          (id, title, description, content, source, url, image_url, published_at, category)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            article.id,
            article.title,
            article.description || null,
            article.content || null,
            article.source,
            article.url,
            article.image_url || null,
            article.published_at,
            article.category || 'general',
          ]
        );
      } catch (error) {
        // Ignore duplicate key errors
      }
    }

    return allArticles;
  }

  async getRecent(category?: string, limit: number = 50): Promise<Article[]> {
    const db = getDatabase();

    const query = category
      ? 'SELECT * FROM articles WHERE category = ? ORDER BY published_at DESC LIMIT ?'
      : 'SELECT * FROM articles ORDER BY published_at DESC LIMIT ?';

    const params = category ? [category, limit] : [limit];
    const articles = await db.all(query, params);

    return articles;
  }

  async searchArticles(searchTerm: string, limit: number = 30): Promise<Article[]> {
    const db = getDatabase();

    const articles = await db.all(
      `SELECT * FROM articles
       WHERE title LIKE ? OR description LIKE ?
       ORDER BY published_at DESC LIMIT ?`,
      [`%${searchTerm}%`, `%${searchTerm}%`, limit]
    );

    return articles;
  }
}

export const newsService = new NewsService();
