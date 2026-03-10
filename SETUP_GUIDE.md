# AI NewsBot Dashboard - Complete Setup Guide 🚀

## Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Get API Keys (Free)

**NewsAPI.org** (~2 minutes)
- Go to https://newsapi.org
- Click "Get API Key"
- Enter email, agree to terms
- Copy your free API key

**Newsdata.io** (~2 minutes)
- Go to https://newsdata.io
- Sign up with email
- Go to dashboard
- Copy your free API key

**X/Twitter API** (Optional - more complex)
- Go to https://developer.twitter.com
- Apply for developer access (describe use case)
- Create an app
- Get API keys & Bearer token

**YouTube API** (Optional)
- Go to https://console.cloud.google.com
- Create new project
- Enable YouTube Data API v3
- Create API key under Credentials

### 3. Configure Environment
```bash
# Copy template
cp .env.example .env

# Edit with your keys (use any text editor)
# NEWSAPI_KEY=your_key_here
# NEWSDATA_KEY=your_key_here
# (optionally add X/YouTube keys)
```

### 4. Create Data Directory
```bash
mkdir -p data
```

### 5. Start Servers

**Terminal 1: Backend**
```bash
npm run server
# Wait for: "✅ Database initialized successfully"
# Then: "🚀 AI Newsbot Dashboard running on http://localhost:5000"
```

**Terminal 2: Frontend**
```bash
npm run client
# Will automatically open http://localhost:5173
```

### 6. Start Using!
- Click on "📰 News" to see articles
- Click on "𝕏 Twitter" to see tweets
- Click on "📹 Live Videos" for live streams
- Use search bar to search all sources
- Toggle 🌙 for dark mode

---

## Detailed Configuration

### NewsAPI.org Setup

1. Visit https://newsapi.org
2. Click "Register" → Enter email
3. Check your email for confirmation link
4. Click link to verify account
5. You'll see your API key dashboard
6. Copy the key under "Your API Key"
7. Add to `.env`:
   ```
   NEWSAPI_KEY=your_key_from_newsapi
   ```

**Free Tier Limits:**
- 100 requests per day
- Up to 50 articles per request
- Coverage: 40,000+ sources
- Historical data: ~1 month

### Newsdata.io Setup

1. Visit https://newsdata.io/register
2. Sign up with email/password
3. Check email for verification link
4. Log in to dashboard
5. Copy API key from settings
6. Add to `.env`:
   ```
   NEWSDATA_KEY=your_key_from_newsdata
   ```

**Free Tier Limits:**
- 200 requests per day
- Up to 100 articles per request
- Coverage: 84,000+ sources
- 7 years of historical data

### Twitter/X API Setup (Optional)

For real-time tweet streaming, you need elevated access:

1. Go to https://developer.twitter.com/en/portal/dashboard
2. Sign in (create account if needed)
3. Click "Create an app"
4. Give it a name like "NewsBot"
5. Describe use case: "News aggregation dashboard"
6. Accept terms and create
7. Go to "Keys and tokens" tab
8. Copy these 3 values:
   - API Key → `X_API_KEY`
   - API Secret Key → `X_API_SECRET`
   - Bearer Token (scroll down) → `X_BEARER_TOKEN`

9. Add to `.env`:
   ```
   X_API_KEY=your_api_key
   X_API_SECRET=your_api_secret
   X_BEARER_TOKEN=your_bearer_token
   ```

**Note:** New accounts have basic access. Real-time streaming requires applying for elevated access (takes a few hours).

### YouTube API Setup (Optional)

For live video search on YouTube:

1. Go to https://console.cloud.google.com
2. Click "Create Project"
3. Name: "NewsBot"
4. Create
5. Go to "APIs & Services" → "Enable APIs"
6. Search "YouTube Data API v3"
7. Click and enable it
8. Go back to "APIs & Services"
9. Click "Credentials" → "Create Credentials" → "API Key"
10. Copy the API key
11. Add to `.env`:
    ```
    YOUTUBE_API_KEY=your_youtube_api_key
    ```

**Free Tier:**
- 10,000 quota units per day
- About 100-200 API calls for search

---

## Running the Application

### Development Mode
```bash
# Terminal 1: Backend (auto-restarts on file changes)
npm run server

# Terminal 2: Frontend (Vite dev server with hot reload)
npm run client
```

### Production Mode
```bash
# Build frontend
npm run build

# Start server (serves built frontend)
npm run start
# Backend includes frontend on port 5000
```

---

## API Testing

### Using curl/PowerShell

**Get recent news:**
```bash
curl http://localhost:5000/api/news/recent?limit=5
```

**Search news:**
```bash
curl "http://localhost:5000/api/news/search?q=AI"
```

**Get tweets:**
```bash
curl http://localhost:5000/api/twitter/recent?limit=5
```

**Get live videos:**
```bash
curl http://localhost:5000/api/videos/live
```

### Using JavaScript (in browser console)
```javascript
fetch('/api/news/recent?limit=5')
  .then(r => r.json())
  .then(d => console.log(d))
```

---

## Troubleshooting

### "Cannot find module" errors
```bash
# Clear dependencies and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port already in use
```bash
# Backend (default 5000)
# Frontend (default 5173)
# Change in vite.config.ts or .env:
PORT=3000
```

### No articles showing
1. Check API keys in `.env`
2. Verify keys are active
3. Check API rate limits at:
   - https://newsapi.org/account/usage
   - https://newsdata.io/dashboard

### Database errors
```bash
# Reset database
rm -rf data/newsbot.db
# Restart server (recreates empty db)
npm run server
```

### Frontend won't load
1. Check terminal output for errors
2. Try hard refresh: Ctrl+Shift+R (or Cmd+Shift+R)
3. Clear browser cache
4. Check http://localhost:5173 is accessible

### WebSocket connection fails
- Backend must be running on port 5000
- Frontend connects to ws://localhost:5000
- Check browser console for specific error

---

## Project Structure Walkthrough

```
ai-newsbot/
├── src/
│   ├── server.ts              ← Express app entry point
│   │
│   ├── db/
│   │   └── database.ts        ← SQLite setup & tables
│   │
│   ├── services/
│   │   ├── newsService.ts     ← Fetches from NewsAPI & Newsdata
│   │   ├── twitterService.ts  ← Fetches tweets from X API
│   │   └── videoService.ts    ← Fetches YouTube & live streams
│   │
│   ├── routes/
│   │   ├── news.ts            ← /api/news endpoints
│   │   ├── twitter.ts         ← /api/twitter endpoints
│   │   ├── videos.ts          ← /api/videos endpoints
│   │   └── settings.ts        ← /api/settings endpoints
│   │
│   ├── websocket/
│   │   └── handler.ts         ← WebSocket server logic
│   │
│   └── client/                ← React frontend
│       ├── main.tsx           ← React entry
│       ├── App.tsx            ← Main component
│       ├── components/
│       │   ├── Sidebar.tsx
│       │   ├── SearchBar.tsx
│       │   ├── Dashboard.tsx
│       │   └── panels/
│       │       ├── NewsPanel.tsx
│       │       ├── TwitterPanel.tsx
│       │       └── VideoPanel.tsx
│       └── utils/
│           └── api.ts         ← Frontend API client
│
├── data/                      ← SQLite database & logs
├── public/                    ← Built frontend (after npm run build)
├── .env.example               ← Copy to .env
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── README.md
```

---

## Environment Variables Reference

```env
# Required (get from newsapi.org)
NEWSAPI_KEY=demo

# Required (get from newsdata.io)
NEWSDATA_KEY=demo

# Optional (for tweets)
X_API_KEY=
X_API_SECRET=
X_BEARER_TOKEN=

# Optional (for YouTube live)
YOUTUBE_API_KEY=

# Optional (live news channels)
LIVE_NEWS_API_URL=https://live-news-api.tk.gg

# Optional (server config)
PORT=5000
NODE_ENV=development
```

---

## Performance Tips

### Reduce API Calls
- Use caching (database)
- Don't refresh too frequently
- Combine requests where possible

### Improve Load Times
1. Clear browser cache periodically
2. Use smaller pagination limits for first load
3. Lazy-load images (built-in)

### Monitor API Usage
- Check your API dashboard daily
- Most free tiers have ~100-200 requests/day
- Plan usage to avoid hitting limits

---

## Next Steps After Setup

1. **Customize** - Edit colors, layout in CSS files
2. **Add Features** - RSS feeds, notifications, etc.
3. **Deploy** - Put on cloud (Heroku, AWS, etc.)
4. **Integrate** - Add to other apps via API
5. **Scale** - Upgrade API keys for more requests

---

## Getting Help

### Check Logs
- Backend: Terminal output shows errors
- Frontend: Browser DevTools console (F12)
- Database: Check `data/newsbot.db` exists

### Common Error Messages

| Error | Solution |
|-------|----------|
| `NEWSAPI_KEY not configured` | Add to `.env` |
| `Port 5000 already in use` | Change PORT in `.env` |
| `Cannot GET /` | Frontend not built, run `npm run client` |
| `WebSocket connection failed` | Ensure backend is running |
| `No articles loading` | Check API keys and rate limits |

---

## Advanced: Running on Cloud

### Heroku
```bash
# Install Heroku CLI
# heroku create your-app-name
# git push heroku main
```

### AWS EC2
```bash
# SSH into instance
# Install Node.js
# Clone repo
# Set .env
# npm install && npm run build
# npm run start
```

### Docker
```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 5000
CMD ["npm", "run", "start"]
```

---

**You're all set! 🎉 Start by visiting http://localhost:5173**
