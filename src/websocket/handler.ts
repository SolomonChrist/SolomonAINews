import { WebSocketServer, WebSocket } from 'ws';
import { newsService } from '../services/newsService.js';
import { twitterService } from '../services/twitterService.js';
import { videoService } from '../services/videoService.js';

interface ClientMessage {
  type: 'subscribe' | 'search' | 'refresh' | 'unsubscribe';
  data: any;
}

export function setupWebSocketServer(wss: WebSocketServer): void {
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws: WebSocket) => {
    console.log('🔌 WebSocket client connected');
    clients.add(ws);

    // Send initial connection message
    ws.send(
      JSON.stringify({
        type: 'connected',
        message: 'Connected to AI Newsbot Dashboard',
        timestamp: new Date().toISOString(),
      })
    );

    ws.on('message', async (data: string) => {
      try {
        const message: ClientMessage = JSON.parse(data);

        switch (message.type) {
          case 'subscribe':
            await handleSubscribe(ws, message.data);
            break;
          case 'search':
            await handleSearch(ws, message.data);
            break;
          case 'refresh':
            await handleRefresh(ws, message.data);
            break;
          default:
            ws.send(JSON.stringify({ error: 'Unknown message type' }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ error: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      console.log('🔌 WebSocket client disconnected');
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  // Broadcast function for server-initiated updates
  async function broadcast(message: any): Promise<void> {
    const data = JSON.stringify(message);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  // Auto-refresh news every 5 minutes
  setInterval(async () => {
    try {
      const news = await newsService.getRecent(undefined, 20);
      await broadcast({
        type: 'news_update',
        data: news,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Auto-refresh error:', error);
    }
  }, 300000); // 5 minutes
}

async function handleSubscribe(ws: WebSocket, data: any): Promise<void> {
  const { source, category } = data;

  try {
    if (source === 'news') {
      const articles = await newsService.getRecent(category, 50);
      ws.send(JSON.stringify({ type: 'news', data: articles }));
    } else if (source === 'twitter') {
      const tweets = await twitterService.getRecentTweets(50);
      ws.send(JSON.stringify({ type: 'twitter', data: tweets }));
    } else if (source === 'videos') {
      const videos = await videoService.getLiveVideos(30);
      ws.send(JSON.stringify({ type: 'videos', data: videos }));
    }
  } catch (error) {
    ws.send(JSON.stringify({ error: 'Subscribe failed', details: String(error) }));
  }
}

async function handleSearch(ws: WebSocket, data: any): Promise<void> {
  const { query, source } = data;

  try {
    if (source === 'news') {
      const results = await newsService.searchArticles(query, 50);
      ws.send(JSON.stringify({ type: 'search_results', data: results }));
    } else if (source === 'twitter') {
      const results = await twitterService.searchTweets(query, 50);
      ws.send(JSON.stringify({ type: 'search_results', data: results }));
    }
  } catch (error) {
    ws.send(JSON.stringify({ error: 'Search failed', details: String(error) }));
  }
}

async function handleRefresh(ws: WebSocket, data: any): Promise<void> {
  const { source, category } = data;

  try {
    if (source === 'news') {
      const articles = await newsService.fetchAndCache(category, category);
      ws.send(JSON.stringify({ type: 'refresh_complete', data: articles.slice(0, 20) }));
    } else if (source === 'videos') {
      const videos = await videoService.fetchAndCacheLive();
      ws.send(JSON.stringify({ type: 'refresh_complete', data: videos }));
    }
  } catch (error) {
    ws.send(JSON.stringify({ error: 'Refresh failed', details: String(error) }));
  }
}
