# AI NewsBot Dashboard - Architecture Overview 🏗️

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                               │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   React Frontend (Vite)                      │  │
│  │                                                               │  │
│  │  ┌─────────────┬──────────────┬──────────────┐               │  │
│  │  │   News      │   Twitter    │   Videos     │   Dashboard  │  │
│  │  │   Panel     │   Panel      │   Panel      │   Overview   │  │
│  │  └─────────────┴──────────────┴──────────────┘               │  │
│  │           │          │              │                        │  │
│  │  ┌────────┴──────────┴──────────────┴────────────┐           │  │
│  │  │  Global Search Bar + Dark/Light Toggle       │           │  │
│  │  └─────────────────────────────────────────────┘            │  │
│  │           │                                                   │  │
│  │           └──────────────────┬──────────────────┐            │  │
│  │                              │                  │            │  │
│  │         HTTP REST API        │   WebSocket      │            │  │
│  └──────────────┬───────────────┼──────────────────┘            │  │
│                 │               │                                │  │
└─────────────────┼───────────────┼────────────────────────────────┘
                  │               │
     ┌────────────┴────┐    ┌─────┴──────────┐
     │                 │    │                │
     │  HTTP requests  │    │  WebSocket     │
     │                 │    │  connection    │
     │                 │    │                │
┌────┴─────────────────┴────┴────────────────┴─────────────────────┐
│                                                                    │
│                   EXPRESS SERVER (Node.js)                       │
│                        port 5000                                 │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  Route Handlers                          │   │
│  │                                                          │   │
│  │  GET /api/news/recent               NewsPanel           │   │
│  │  GET /api/news/category/:cat        requests            │   │
│  │  GET /api/news/search               articles            │   │
│  │  POST /api/news/refresh                                 │   │
│  │                                                          │   │
│  │  GET /api/twitter/recent            TwitterPanel        │   │
│  │  GET /api/twitter/search            requests            │   │
│  │  POST /api/twitter/stream           tweets              │   │
│  │                                                          │   │
│  │  GET /api/videos/live               VideoPanel          │   │
│  │  GET /api/videos/youtube/live       requests            │   │
│  │  GET /api/videos/cached             live streams        │   │
│  │                                                          │   │
│  │  GET /api/settings/*                Settings            │   │
│  │  POST /api/settings/*               management          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                      │
│  ┌────────────────────────┼────────────────────────────────┐    │
│  │                        │                                │    │
│  │    ┌────────────────────────────────────┐              │    │
│  │    │   Service Layer (Data Fetching)    │              │    │
│  │    │                                    │              │    │
│  │    │  • newsService.ts                  │              │    │
│  │    │  • twitterService.ts               │              │    │
│  │    │  • videoService.ts                 │              │    │
│  │    │                                    │              │    │
│  │    │  (fetch from external APIs,        │              │    │
│  │    │   format data, cache to DB)        │              │    │
│  │    └────────────────────────────────────┘              │    │
│  │                        │                                │    │
│  │    ┌────────────────────────────────────┐              │    │
│  │    │   SQLite Database Layer            │              │    │
│  │    │      data/newsbot.db                │              │    │
│  │    │                                    │              │    │
│  │    │  Tables:                           │              │    │
│  │    │  • articles (cached news)          │              │    │
│  │    │  • tweets (cached tweets)          │              │    │
│  │    │  • live_videos (cached streams)    │              │    │
│  │    │  • user_settings (preferences)     │              │    │
│  │    │  • user_preferences (filters)      │              │    │
│  │    └────────────────────────────────────┘              │    │
│  │                        │                                │    │
│  └────────────────────────┼────────────────────────────────┘    │
│                           │                                      │
└───────────────────────────┼──────────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
    ┌────▼──────┐    ┌─────▼────┐     ┌──────▼──────┐
    │  NewsAPI  │    │ Newsdata │     │ X/Twitter   │
    │  40k+     │    │ 84k+     │     │ API v2      │
    │  sources  │    │ sources  │     │  Streaming  │
    └───────────┘    └──────────┘     └─────────────┘

    ┌──────────────────┐           ┌────────────────┐
    │ YouTube Live API │           │  Live News API │
    │ Video Search     │           │  News Channels │
    └──────────────────┘           └────────────────┘
```

## Data Flow

### 1. News Article Flow
```
User clicks "News Panel"
         ↓
React component mounts, calls GET /api/news/recent
         ↓
Backend route handler calls newsService.getRecent()
         ↓
newsService queries SQLite database
         ↓
If cache empty or old:
  - Fetch from NewsAPI
  - Fetch from Newsdata.io (parallel)
  - Format and combine results
  - Store in database
         ↓
Return cached articles to frontend
         ↓
React renders ArticleCard components
         ↓
User clicks article → opens original source in new tab
```

### 2. Twitter Feed Flow
```
User clicks "Twitter Panel"
         ↓
React component calls GET /api/twitter/recent
         ↓
Backend fetches from SQLite cache
         ↓
If cache empty or search query:
  - Connect to X/Twitter API v2
  - Search tweets matching keywords
  - Extract metrics (likes, retweets)
  - Cache in database
         ↓
Return tweets to frontend
         ↓
React renders TweetCard components
         ↓
User clicks tweet → opens on Twitter.com
```

### 3. Live Video Flow
```
User clicks "Live Videos Panel"
         ↓
React component calls GET /api/videos/live
         ↓
Backend service calls:
  - YouTube Live API (search "news live")
  - Live News API (fetches active streams)
         ↓
Results combined and cached in database
         ↓
Return to frontend with viewer counts and thumbnails
         ↓
React renders VideoCard components
         ↓
User clicks video → opens stream (YouTube/channel)
```

### 4. Search Flow
```
User types "Bitcoin" in search bar
         ↓
React calls appropriate API based on active tab:
  - News: GET /api/news/search?q=Bitcoin
  - Twitter: GET /api/twitter/search?q=Bitcoin
         ↓
Backend searches database + external APIs
         ↓
Results returned to frontend
         ↓
React updates panel with search results
         ↓
User can filter, sort, or click items
```

### 5. WebSocket Real-time Updates Flow
```
Page loads → React WebSocket client connects to ws://localhost:5000
         ↓
Client sends: {"type": "subscribe", "data": {"source": "news"}}
         ↓
Server broadcasts news updates every 5 minutes
         ↓
Client receives: {"type": "news_update", "data": [...]}
         ↓
React updates state automatically
         ↓
UI refreshes with latest articles
```

## Component Hierarchy

```
App
├── Sidebar
│   ├── Navigation items (Dashboard, News, Twitter, Videos)
│   ├── Theme toggle (dark/light)
│   └── Settings button
├── SearchBar
│   ├── Search input
│   └── Filter chips (Today, This Week, Trending)
└── Main Content
    ├── Dashboard (overview, stats, features)
    ├── NewsPanel
    │   ├── Category filter buttons
    │   ├── ArticleCard[]
    │   └── Pagination
    ├── TwitterPanel
    │   ├── TweetCard[]
    │   └── Engagement stats
    └── VideoPanel
        ├── VideoCard[]
        └── Live indicator
```

## Service Architecture

### NewsService
```typescript
class NewsService {
  fetchNewsAPI(query) → Article[]      // NewsAPI.org
  fetchNewsdata(query) → Article[]     // Newsdata.io
  fetchAndCache(query) → Article[]     // Parallel fetch + cache
  getRecent(category) → Article[]      // Get cached
  searchArticles(term) → Article[]     // Search cache
}
```

### TwitterService
```typescript
class TwitterService {
  searchTweets(query) → Tweet[]        // X API v2
  streamTweets(keywords) → void        // Real-time stream
  cacheTweet(tweet) → void             // Store to DB
  getRecentTweets() → Tweet[]          // Get cached
}
```

### VideoService
```typescript
class VideoService {
  fetchLiveNews() → LiveVideo[]        // Live news API
  searchYouTubeLive(query) → LiveVideo[]  // YouTube API
  cacheVideo(video) → void             // Store to DB
  getLiveVideos() → LiveVideo[]        // Get cached
  fetchAndCacheLive() → LiveVideo[]    // Parallel + cache
}
```

## Database Schema

```sql
-- News Articles
CREATE TABLE articles (
  id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  content TEXT,
  source TEXT,
  url TEXT UNIQUE,
  image_url TEXT,
  published_at DATETIME,
  fetched_at DATETIME,
  category TEXT,
  relevance_score REAL,
  saved_by_user INTEGER
);

-- Tweets
CREATE TABLE tweets (
  id TEXT PRIMARY KEY,
  author TEXT,
  text TEXT,
  created_at DATETIME,
  fetched_at DATETIME,
  likes INTEGER,
  retweets INTEGER,
  has_media INTEGER,
  keywords TEXT
);

-- Live Videos
CREATE TABLE live_videos (
  id TEXT PRIMARY KEY,
  channel TEXT,
  title TEXT,
  thumbnail_url TEXT,
  viewer_count INTEGER,
  status TEXT ('live'|'upcoming'|'ended'),
  url TEXT UNIQUE,
  started_at DATETIME,
  fetched_at DATETIME
);

-- User Settings
CREATE TABLE user_settings (
  id INTEGER PRIMARY KEY,
  setting_key TEXT UNIQUE,
  setting_value TEXT
);

-- User Preferences
CREATE TABLE user_preferences (
  id INTEGER PRIMARY KEY,
  user_id TEXT,
  categories TEXT,          -- JSON array
  sources TEXT,             -- JSON array
  keywords TEXT,            -- JSON array
  refresh_interval INTEGER
);
```

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/news/recent` | Latest articles |
| GET | `/api/news/category/:cat` | By category |
| GET | `/api/news/search?q=...` | Search articles |
| POST | `/api/news/refresh/:cat` | Force refresh |
| GET | `/api/twitter/recent` | Latest tweets |
| GET | `/api/twitter/search?q=...` | Search tweets |
| POST | `/api/twitter/stream` | Start streaming |
| GET | `/api/videos/live` | Current live streams |
| GET | `/api/videos/youtube/live` | YouTube search |
| GET | `/api/videos/cached` | Cached videos |
| GET | `/api/settings/preferences` | User prefs |
| POST | `/api/settings/preferences` | Save prefs |

## Rate Limiting Strategy

```
API Service          | Free Tier        | Strategy
─────────────────────────────────────────────────────
NewsAPI.org         | 100/day          | 1 request per 15 mins
Newsdata.io         | 200/day          | 1 request per 7 mins
X/Twitter API       | Variable         | Uses Bearer token (app-level)
YouTube API         | 10k quota/day    | ~200 queries/day
Live News API       | Unlimited        | No auth needed
─────────────────────────────────────────────────────
SQLite Database     | Unlimited        | Caches all responses
```

## Caching Strategy

1. **Database Caching**: All fetched data stored in SQLite
2. **Smart Refresh**: Only fetch new data if cache is stale
3. **Parallel Requests**: Multiple APIs queried simultaneously
4. **Browser Caching**: Frontend prefs stored in localStorage
5. **HTTP Caching**: Vite handles static assets

## Security Considerations

1. **API Keys**: Stored in `.env`, never committed
2. **CORS**: Frontend & backend on different ports (Vite proxy)
3. **Input Validation**: Search queries sanitized
4. **No Authentication**: Single-user dashboard (add auth later)
5. **HTTPS Ready**: Can be deployed with SSL

## Performance Optimizations

1. **Lazy Loading**: Images load on demand
2. **Pagination**: Large result sets paginated
3. **Database Indexes**: Query optimization
4. **WebSocket**: Real-time updates without polling
5. **Vite**: Fast HMR in development, optimized bundle

## Deployment Architecture

```
Local Development:
  Frontend: http://localhost:5173 (Vite server)
  Backend: http://localhost:5000 (Express)
  Database: ./data/newsbot.db (SQLite)

Production (Single server):
  Frontend: Built & served by Express at :5000
  Backend: Express API at :5000/api/*
  Database: /data/newsbot.db

Production (Docker):
  Frontend: Built in Docker image
  Backend: Same image serves both
  Database: Volume mount for persistence
```

## Future Architecture Enhancements

```
Enhanced System:
┌─────────────────────────────────────────────────┐
│  Web App (current)                              │
│  Mobile App (React Native)                      │
│  Browser Extension                              │
│  Telegram Bot Integration                       │
│  Slack Bot                                      │
└──────────────────┬────────────────────────────┘
                   │
            ┌──────▼───────┐
            │  GraphQL API │
            │  (optional)  │
            └──────┬───────┘
                   │
        ┌──────────┴──────────┐
        │                     │
   ┌────▼────┐         ┌──────▼────┐
   │ MongoDB  │         │ Redis     │
   │ (history)│         │ (cache)   │
   └──────────┘         └───────────┘

        ┌──────────────────────┐
        │ ML/AI Services       │
        │ • Summarization      │
        │ • Sentiment Analysis │
        │ • Topic Clustering   │
        └──────────────────────┘
```

---

**Architecture designed for:**
- ✅ Fast load times
- ✅ Scalable to millions of articles
- ✅ Easy to add new sources
- ✅ Simple to understand and modify
- ✅ Production-ready deployment
