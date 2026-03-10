import axios from 'axios';
import { getDatabase } from '../db/database.js';

interface Tweet {
  id: string;
  author: string;
  text: string;
  created_at: string;
  likes: number;
  retweets: number;
  has_media: boolean;
}

export class TwitterService {
  private bearerToken = process.env.X_BEARER_TOKEN;

  async searchTweets(query: string, maxResults: number = 50): Promise<Tweet[]> {
    if (!this.bearerToken) {
      console.warn('⚠️  X_BEARER_TOKEN not configured');
      return [];
    }

    try {
      const url = `https://api.twitter.com/2/tweets/search/recent`;
      const params = {
        query: query,
        max_results: Math.min(maxResults, 100),
        'tweet.fields': 'created_at,public_metrics',
        'user.fields': 'username',
        expansions: 'author_id',
      };

      const response = await axios.get(url, {
        params,
        headers: {
          Authorization: `Bearer ${this.bearerToken}`,
        },
        timeout: 15000,
      });

      if (!response.data.data) return [];

      const userMap = new Map();
      if (response.data.includes?.users) {
        response.data.includes.users.forEach((user: any) => {
          userMap.set(user.id, user.username);
        });
      }

      return response.data.data.map((tweet: any) => ({
        id: tweet.id,
        author: userMap.get(tweet.author_id) || 'unknown',
        text: tweet.text,
        created_at: tweet.created_at,
        likes: tweet.public_metrics?.like_count || 0,
        retweets: tweet.public_metrics?.retweet_count || 0,
        has_media: !!tweet.attachments?.media_keys?.length,
      }));
    } catch (error) {
      console.error('❌ Twitter search failed:', error);
      return [];
    }
  }

  async streamTweets(keywords: string[]): Promise<void> {
    if (!this.bearerToken) {
      console.warn('⚠️  X_BEARER_TOKEN not configured for streaming');
      return;
    }

    try {
      const query = keywords.join(' OR ');
      const url = 'https://api.twitter.com/2/tweets/search/stream';

      // This is simplified - real streaming requires more complex setup
      console.log(`🐦 Would stream tweets for: ${query}`);
    } catch (error) {
      console.error('❌ Twitter stream failed:', error);
    }
  }

  async cacheTweet(tweet: Tweet): Promise<void> {
    const db = getDatabase();

    try {
      await db.run(
        `INSERT OR IGNORE INTO tweets
        (id, author, text, created_at, likes, retweets, has_media)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [tweet.id, tweet.author, tweet.text, tweet.created_at, tweet.likes, tweet.retweets, tweet.has_media ? 1 : 0]
      );
    } catch (error) {
      console.error('Failed to cache tweet:', error);
    }
  }

  async getRecentTweets(limit: number = 50): Promise<Tweet[]> {
    const db = getDatabase();

    const tweets = await db.all(
      `SELECT * FROM tweets ORDER BY created_at DESC LIMIT ?`,
      [limit]
    );

    return tweets;
  }
}

export const twitterService = new TwitterService();
