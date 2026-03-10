# AI NEWS DASHBOARD - IMPLEMENTATION GUIDE

**Status:** In Development (Phase 1 - Core Features Complete)
**Last Updated:** March 9, 2026

---

## 🚀 QUICK START

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- npm or yarn package manager
- Git

### Installation (5 minutes)

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-news-dashboard.git
cd ai-news-dashboard

# Install dependencies
npm install

# Start development servers
npm run dev

# Open in browser
# Backend API: http://localhost:7000
# Frontend Dashboard: http://localhost:5180+
```

---

## 📁 PROJECT STRUCTURE

```
ai-newsbot/
├── src/
│   ├── client/
│   │   ├── components/
│   │   │   ├── GridDashboard.tsx         # Main dashboard layout
│   │   │   ├── GridDashboard.css         # Dashboard styling
│   │   │   ├── InteractiveMap.tsx        # 🗺️ NEW: Interactive world map
│   │   │   ├── InteractiveMap.css        # Map styling
│   │   │   ├── SourceManager.tsx         # News source management
│   │   │   └── SourceManager.css
│   │   ├── App.tsx                       # React app entry
│   │   └── App.css
│   ├── routes/
│   │   ├── news.ts                       # News API endpoints
│   │   ├── sources.ts                    # Source management API
│   │   └── ...
│   ├── services/
│   │   ├── dataFetcher.ts                # Fetch news from 17 sources
│   │   ├── locationExtractor.ts          # Extract lat/lng from articles
│   │   └── ...
│   ├── server.ts                         # Express server entry
│   └── db/
│       └── database.ts                   # Stub (JSON-based storage)
├── public/
│   ├── index.html
│   ├── AI-WORLD-MAP.png                  # 🗺️ Place your map image here
│   └── assets/                           # Compiled CSS/JS
├── data/
│   ├── sources.json                      # News sources configuration
│   └── articles.json                     # Cached articles (generated)
├── dist/                                 # Compiled TypeScript
├── vite.config.ts                        # Frontend build config
├── tsconfig.json                         # TypeScript config
├── package.json
├── PRD.md                                # Product requirements document
└── IMPLEMENTATION_GUIDE.md               # This file
```

---

## 🎯 FEATURES IMPLEMENTED (Phase 1)

### ✅ COMPLETE
1. **Interactive World Map**
   - Canvas-based rendering with support for custom map image
   - 📍 Pan/drag with mouse
   - 🔍 Zoom in/out with mouse wheel and buttons
   - 📍 News markers at article locations
   - 💡 Hover tooltips showing article preview
   - 🖱️ Click to view full article
   - 🔄 Responsive resizing

2. **News Feed Sidebar**
   - 📰 List of latest articles with metadata
   - 🏷️ Location, source, time, and category
   - 🔗 Click to open article detail
   - 🔍 Highlights when hovering map markers
   - 📊 Shows total articles and locations

3. **News Source Management**
   - ➕ Add new RSS feeds
   - ✏️ Edit existing sources
   - 🗑️ Delete sources
   - ✅ Toggle sources on/off
   - 💾 Persist changes to `data/sources.json`
   - 📡 Real-time fetch from 17 default sources

4. **News Fetching & Caching**
   - 🔄 Auto-refresh every 5-10 minutes
   - 💾 5-minute cache for API calls
   - 🔗 17 free news sources (no API keys)
   - 🌍 Location extraction (company HQ fallback)
   - 📊 Deduplication by title

5. **Article Detail View**
   - 📄 Full article metadata
   - 🔗 Link to original article
   - 📍 Location information
   - 🏷️ Source and author
   - ⏰ Published date/time

6. **Configuration System**
   - 🔧 Toggle modules (map, feed, videos, stats)
   - 📥 Save/download configuration as JSON
   - 📊 Dashboard metrics (stories, locations, sources, updates)

### 🔧 IN PROGRESS / TODO

- **Live Ticker** (Bottom scrolling headlines)
- **Live Video Feeds** Section (4 news channels)
- **Advanced Filtering** (Time, category, source, search)
- **Analytics Dashboard** (Charts and breakdowns)
- **Data Export** (JSON, CSV, RSS, PDF)
- **Mobile Responsiveness** (Tablet/mobile layouts)

---

## 🗺️ INTERACTIVE MAP IMPLEMENTATION

### How It Works

The interactive map uses the canvas API to render articles as draggable, zoomable markers on a world map image.

#### Key Features:

```javascript
// Map State Tracking
const mapState = {
  centerX: number,      // Map center X in pixels
  centerY: number,      // Map center Y in pixels
  zoom: number,         // Zoom level (1.0 = full world)
  panX: number,         // Pan offset X
  panY: number,         // Pan offset Y
  isDragging: boolean   // Currently dragging
}

// Coordinate System:
// Latitude:  90° (top) to -90° (bottom)
// Longitude: -180° (left) to 180° (right)
// Mapped to Canvas: (0,0) is top-left

// Projection:
const x = (lng + 180) / 360;        // 0 to 1
const y = (90 - lat) / 180;         // 0 to 1
const pixelX = x * canvasWidth;
const pixelY = y * canvasHeight;
```

#### Interactions:

| Action | Effect |
|--------|--------|
| **Click & Drag** | Pan the map around |
| **Mouse Wheel** | Zoom in/out (0.5x to 8x) |
| **Double-Click** | Zoom to marker location |
| **Click Marker** | Select article, show detail |
| **Hover Marker** | Show tooltip with preview |
| **Buttons** | +/- zoom, ⊙ reset to world view |

#### Adding Your Map Image

1. **Generate/Download** your world map image from Gemini AI
2. **Save as** `public/AI-WORLD-MAP.png`
3. **Optional**: Adjust image aspect ratio for best fit

The code automatically loads the image in background and scales it to fit the canvas.

---

## 📡 API ENDPOINTS

### News Feed
```
GET /api/news/feed
Returns: { articles, unlocated, total }
- articles: Array of articles with location
- unlocated: Articles without location data
- total: Count of all articles
```

### News Sources
```
GET /api/sources
Returns: Array of NewsSource objects

POST /api/sources
Body: { name, type, url, category }
Returns: { success, source }

PUT /api/sources/:id
Body: Partial source updates
Returns: { success, source }

DELETE /api/sources/:id
Returns: { success, removed }

PATCH /api/sources/:id/toggle
Returns: { success, source } (toggles enabled flag)
```

### Health Check
```
GET /api/health
Returns: { status: "ok", timestamp }
```

---

## 🛠️ TECHNOLOGY STACK

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool (lightning fast)
- **Canvas API** - Map rendering
- **CSS3** - Styling with dark theme

### Backend
- **Node.js** - Runtime
- **Express** - HTTP framework
- **TypeScript** - Type safety
- **rss-parser** - Parse RSS feeds
- **axios** - HTTP client

### Data Storage
- **JSON Files** - No database overhead
- **File-based** - Persist to `data/sources.json`
- **In-memory cache** - 5-minute article cache

---

## 🎨 COLOR SYSTEM

All components use the brand color palette:

```css
--primary-dark:    #1F2933    /* Charcoal - backgrounds */
--primary-light:   #F5F5F5    /* White - text */
--accent-red:      #D83A2E    /* Red - highlights/alerts */
--accent-gold:     #F5A623    /* Gold - secondary/hover */
--text-secondary:  #6B7280    /* Gray - metadata */
--border:          #3a4a5a    /* Darker gray - borders */
--success:         #22c55e    /* Green */
--warning:         #f97316    /* Orange */
```

**Theme**: Dark mode by default (dark UI with light text)

---

## 📊 DEFAULT NEWS SOURCES (17 Total)

### Tier 1: Popular Tech News
- **Hacker News** - Tech startup and innovation news
- **Ars Technica** - In-depth tech analysis
- **The Verge** - Tech and culture
- **TechCrunch** - Startup and venture funding
- **The Next Web** - Tech news and innovation

### Tier 2: AI/ML Focused
- **ArXiv AI** - Academic research papers
- **ArXiv ML** - Machine learning papers
- **Medium AI** - AI articles and tutorials

### Tier 3: Community
- **Reddit r/MachineLearning** - ML discussions
- **Reddit r/ArtificialIntelligence** - AI discussions

### Tier 4: Company Blogs
- **OpenAI Blog** - Latest OpenAI announcements
- **DeepMind Blog** - DeepMind research
- **Anthropic Research** - Anthropic announcements
- **Hugging Face Blog** - AI model releases

### Tier 5: Trending & Discovery
- **GitHub Trending** - Popular AI projects
- **Product Hunt** - New AI/tech products
- **Wired** - AI and culture

**To Add Custom Sources:**
1. Click ⚙️ Configure button
2. Switch to "Sources" tab
3. Click "+ Add Source"
4. Fill in RSS feed URL
5. Save and articles auto-fetch

---

## 🚀 DEPLOYMENT OPTIONS

### Option 1: Local Development
```bash
npm install
npm run dev
```
- Perfect for testing
- Frontend: http://localhost:5180+
- Backend: http://localhost:7000

### Option 2: DigitalOcean VPS

```bash
# SSH into your droplet
ssh root@your.droplet.ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/yourusername/ai-news-dashboard.git
cd ai-news-dashboard

# Install and build
npm install
npm run build

# Start with PM2 for auto-restart
npm install -g pm2
PORT=7000 pm2 start dist/server.js --name "ai-news-backend"

# Setup Nginx reverse proxy
# (Configure to proxy :7000 on backend, serve frontend from public/)

# Access: http://your.droplet.ip
```

### Option 3: AWS EC2

Similar to DigitalOcean, but:
- Use **t2.micro** or **t2.small** instance
- Security group: Allow ports 80, 443, 7000
- Elastic IP for stable address
- Same installation process as DigitalOcean

### Option 4: Docker Container

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY data ./data
COPY public ./public

EXPOSE 7000
CMD ["node", "dist/server.js"]
```

```bash
docker build -t ai-news-dashboard .
docker run -p 7000:7000 -v $(pwd)/data:/app/data ai-news-dashboard
```

---

## 🔍 TROUBLESHOOTING

### "Cannot GET /api/sources"
- **Cause**: Backend server not running on port 7000
- **Fix**: Run `npm run dev` to start backend, or check backend is on correct port

### Map markers not showing
- **Cause**: Articles don't have location data
- **Fix**: Check `api/news/feed` response has `location` field
- **Fallback**: System uses company HQ locations as backup

### No articles loading
- **Cause**: News sources are down or API changed
- **Fix**: Check `npm run dev` logs for fetch errors, verify RSS feed URLs

### Build fails with TypeScript errors
- **Cause**: TypeScript version mismatch
- **Fix**: Run `npm install` to ensure dependencies are fresh

### Port already in use
- **Cause**: Another process using port 7000 or 5180+
- **Fix**: Kill process: `lsof -ti :7000 | xargs kill -9` (Linux/Mac)
- **Windows**: Use Task Manager to kill Node.js process

---

## 📈 PERFORMANCE TIPS

1. **Reduce News Articles**: Limit in `dataFetcher.ts` if loading slow
2. **Increase Cache Duration**: Change 5-minute cache in `dataFetcher.ts` to 30 min
3. **Disable Unused Sources**: Toggle off sources in configuration
4. **Optimize Map Image**: Compress AI-WORLD-MAP.png to < 5MB
5. **Monitor Server**: Watch logs for slow API calls

---

## 🔐 SECURITY NOTES

- **No Authentication**: Currently open access (add auth for production)
- **No Sensitive Data**: Only fetches public news feeds
- **CORS Enabled**: Allows cross-origin requests (restrict if needed)
- **No Database Passwords**: JSON-based, no credentials in code

**For Production:**
- Add API authentication (JWT tokens)
- Use HTTPS/SSL certificate
- Restrict CORS to your domain
- Consider rate limiting
- Add input validation for source URLs

---

## 📝 COMMON CUSTOMIZATIONS

### Change Refresh Interval
**File**: `src/services/dataFetcher.ts`
```typescript
const CACHE_DURATION = 5 * 60 * 1000;  // Change 5 to 30 for 30 minutes
```

### Change Default Map View
**File**: `src/components/InteractiveMap.tsx`
```typescript
const [mapState, setMapState] = useState({
  zoom: 1.0,  // Change to 2.0 for zoomed view
  // ...
});
```

### Modify Color Scheme
**File**: `src/components/GridDashboard.css`
```css
/* Search for color values and replace */
#D83A2E  /* Replace with your accent color */
#F5A623  /* Replace with your secondary color */
```

### Add New News Source
1. Click ⚙️ Configure → Sources tab
2. Click "+ Add Source"
3. Fill in RSS feed URL
4. Done! Articles auto-fetch

---

## 📞 SUPPORT & TROUBLESHOOTING

### Getting Help
1. Check the logs: `npm run dev` shows all errors
2. Check the PRD.md for requirements
3. Review the IMPLEMENTATION_GUIDE.md (this file)
4. Search GitHub issues: https://github.com/yourusername/ai-news-dashboard/issues

### Reporting Bugs
Create an issue with:
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Console errors (from browser dev tools)
- Backend logs (from `npm run dev`)

---

## 🎯 NEXT PHASES

### Phase 2: Enhanced Dashboard (Week 2)
- [ ] Live ticker at bottom (scrolling headlines)
- [ ] Live video feeds section (4 channels)
- [ ] Analytics dashboard with statistics
- [ ] Improved marker clustering

### Phase 3: Export & Advanced (Week 3)
- [ ] Export to JSON/CSV/RSS/PDF
- [ ] Bookmark/save articles
- [ ] Advanced filtering UI
- [ ] Custom alert notifications

### Phase 4: Scale & Polish (Week 4)
- [ ] Mobile responsive design
- [ ] Performance optimization
- [ ] More news sources
- [ ] User settings persistence

---

## 📚 RESOURCES

- **GitHub**: https://github.com/yourusername/ai-news-dashboard
- **Issues**: https://github.com/yourusername/ai-news-dashboard/issues
- **Discussions**: https://github.com/yourusername/ai-news-dashboard/discussions
- **PRD**: See PRD.md in repo root

---

**Ready to get started?** Run `npm run dev` and open http://localhost:5180+ in your browser!

For questions about the roadmap, see **PRD.md**.
For implementation details, see **IMPLEMENTATION_GUIDE.md** (this file).
