import axios from 'axios';
import { getDatabase } from '../db/database.js';

interface LiveVideo {
  id: string;
  channel: string;
  title: string;
  thumbnail_url?: string;
  viewer_count: number;
  status: 'live' | 'upcoming' | 'ended';
  url: string;
  started_at?: string;
}

export class VideoService {
  private youtubeApiKey = process.env.YOUTUBE_API_KEY;
  private liveNewsApiUrl = process.env.LIVE_NEWS_API_URL || 'https://live-news-api.tk.gg';

  async fetchLiveNews(): Promise<LiveVideo[]> {
    try {
      const response = await axios.get(`${this.liveNewsApiUrl}/query`, {
        timeout: 10000,
      });

      if (!response.data.data) return [];

      return response.data.data.map((stream: any) => ({
        id: stream.id || `${stream.channel}-${Date.now()}`,
        channel: stream.channel,
        title: stream.title,
        thumbnail_url: stream.image_url,
        viewer_count: stream.viewers || 0,
        status: 'live',
        url: stream.url,
        started_at: stream.started_at,
      }));
    } catch (error) {
      console.error('❌ Live news API fetch failed:', error);
      return [];
    }
  }

  async searchYouTubeLive(query: string, maxResults: number = 20): Promise<LiveVideo[]> {
    if (!this.youtubeApiKey) {
      console.warn('⚠️  YOUTUBE_API_KEY not configured. Using reliable fallback live streams.');
      // Fallback streams similar to World Monitor
      const fallbackStreams = [
        { id: 'kyiv', channel: 'DW News', title: 'DW News Live', thumbnail_url: '', viewer_count: 0, status: 'live' as const, url: 'https://www.youtube.com/watch?v=-Q7FuPINDjA', fallbackVideoId: '-Q7FuPINDjA' },
        { id: 'london', channel: 'Sky News', title: 'Sky News Live', thumbnail_url: '', viewer_count: 0, status: 'live' as const, url: 'https://www.youtube.com/watch?v=9Auq9mYxFEE', fallbackVideoId: '9Auq9mYxFEE' },
        { id: 'aljazeera', channel: 'Al Jazeera', title: 'Al Jazeera English Live', thumbnail_url: '', viewer_count: 0, status: 'live' as const, url: 'https://www.youtube.com/watch?v=bByXF-A2wKQ', fallbackVideoId: 'bByXF-A2wKQ' },
        { id: 'nasa', channel: 'NASA', title: 'NASA Live Stream', thumbnail_url: '', viewer_count: 0, status: 'live' as const, url: 'https://www.youtube.com/watch?v=21X5lGlDOfg', fallbackVideoId: '21X5lGlDOfg' }
      ];
      return fallbackStreams;
    }

    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: query,
          type: 'video',
          eventType: 'live',
          maxResults: maxResults,
          key: this.youtubeApiKey,
        },
        timeout: 10000,
      });

      if (!response.data.items) return [];

      return response.data.items.map((item: any) => ({
        id: item.id.videoId,
        channel: item.snippet.channelTitle,
        title: item.snippet.title,
        thumbnail_url: item.snippet.thumbnails.medium?.url,
        viewer_count: 0,
        status: 'live',
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        started_at: item.snippet.publishedAt,
      }));
    } catch (error) {
      console.error('❌ YouTube search failed:', error);
      return [];
    }
  }

  async cacheVideo(video: LiveVideo): Promise<void> {
    const db = getDatabase();

    try {
      await db.run(
        `INSERT OR REPLACE INTO live_videos
        (id, channel, title, thumbnail_url, viewer_count, status, url, started_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          video.id,
          video.channel,
          video.title,
          video.thumbnail_url || null,
          video.viewer_count,
          video.status,
          video.url,
          video.started_at || null,
        ]
      );
    } catch (error) {
      console.error('Failed to cache video:', error);
    }
  }

  async getLiveVideos(limit: number = 30): Promise<LiveVideo[]> {
    const db = getDatabase();

    const videos = await db.all(
      `SELECT * FROM live_videos WHERE status = 'live' ORDER BY viewer_count DESC LIMIT ?`,
      [limit]
    );

    return videos;
  }

  async resolveLiveVideoId(input: string): Promise<{ videoId: string, embeddable: boolean } | null> {
    let channelUrl = input;
    let preKnownId = null;

    if (input.includes('youtube.com/watch?v=')) {
      preKnownId = input.split('v=')[1].split('&')[0];
    } else if (input.includes('youtu.be/')) {
      preKnownId = input.split('youtu.be/')[1].split('?')[0];
    } else if (input.startsWith('@')) {
      channelUrl = `https://www.youtube.com/${input}/live`;
    } else if (input.includes('youtube.com/c/') || input.includes('youtube.com/channel/') || input.includes('youtube.com/@')) {
      channelUrl = input.endsWith('/live') ? input : `${input.split('?')[0]}/live`;
    } else if (!input.includes('http')) {
      channelUrl = `https://www.youtube.com/@${input}/live`;
    }

    try {
      console.log(`Resolving live stream for: ${channelUrl}`);
      const response = await axios.get(channelUrl, {
        timeout: 8000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
      });

      const html = response.data;
      
      // Check if the stream is active
      const isLive = html.includes('"isLive":true') || html.includes('"isLiveStream":true') || html.includes('LIVE');
      if (!isLive && !preKnownId) {
        console.warn(`Channel ${input} is not currently live.`);
        return null;
      }

      let isEmbeddable = !html.includes('"isEmbeddable":false');

      // Look for the videoId
      let extractedId = preKnownId;
      const match = html.match(/"liveStreamabilityRenderer":\{"videoId":"([^"]+)"/);
      if (match && match[1]) {
        extractedId = match[1];
      } else {
        const canonMatch = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([^"]+)">/);
        if (canonMatch && canonMatch[1]) {
          extractedId = canonMatch[1];
        }
      }

      if (extractedId) {
        // Hardcode known non-embeddable news streams that block playback
        if (input.includes('f39oHo6vFLg') || input.includes('business') || input.includes('HSImh9Pz_44')) {
          isEmbeddable = false;
        }
        return { videoId: extractedId, embeddable: isEmbeddable };
      }
      return null;
    } catch (error) {
      console.warn(`Could not resolve live stream for ${input}:`, (error as Error).message);
      return null;
    }
  }

  async fetchConfiguredVideos(): Promise<LiveVideo[]> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const { fileURLToPath } = await import('url');
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const SOURCES_FILE = path.resolve(__dirname, '../../data/sources.json');
      
      const data = await fs.readFile(SOURCES_FILE, 'utf-8');
      const config = JSON.parse(data);
      const videoSources = (config.sources || []).filter((s: any) => s.type === 'video' && s.enabled);
      
      const resultsData: LiveVideo[] = [];
      for (const source of videoSources) {
        try {
          const result = await this.resolveLiveVideoId(source.url);
          if (result && result.videoId) {
            resultsData.push({
              id: result.videoId,
              channel: source.name,
              title: source.name,
              thumbnail_url: `https://i.ytimg.com/vi/${result.videoId}/hqdefault.jpg`,
              viewer_count: 0,
              status: 'live' as const,
              url: `https://www.youtube.com/watch?v=${result.videoId}${!result.embeddable ? '&noembed=1' : ''}`,
            });
          }
          // Small delay to prevent YouTube rate-limiting
          await new Promise(r => setTimeout(r, 500));
        } catch (e) {
            console.error(`Error resolving configured source ${source.name}:`, e);
        }
      }
      
      return resultsData;
    } catch (err) {
      console.error('Error fetching configured video sources:', err);
      return [];
    }
  }


  async fetchAndCacheLive(): Promise<LiveVideo[]> {
    const [liveNews, youtubeStreams, aiNewsStreams, configuredVideos] = await Promise.all([
      this.fetchLiveNews(),
      this.searchYouTubeLive('news live', 10),
      this.searchYouTubeLive('ai news live', 10),
      this.fetchConfiguredVideos(),
    ]);

    // Priority: 1. Configured, 2. AI News Search, 3. Live News API, 4. General News Search
    const allVideos = [...configuredVideos, ...aiNewsStreams, ...liveNews, ...youtubeStreams];

    // Deduplicate by video ID or URL
    const uniqueMap = new Map<string, LiveVideo>();
    for (const v of allVideos) {
      if (!uniqueMap.has(v.id)) {
        uniqueMap.set(v.id, v);
      }
    }

    const uniqueVideos = Array.from(uniqueMap.values());

    for (const video of uniqueVideos) {
      await this.cacheVideo(video);
    }

    return uniqueVideos;
  }
}

export const videoService = new VideoService();
