# AI NEWS DASHBOARD - PRODUCT REQUIREMENTS DOCUMENT

**Version:** 1.0
**Date:** March 9, 2026
**Status:** In Development

---

## 📋 EXECUTIVE SUMMARY

The **AI News Dashboard** is a real-time global news aggregation and monitoring platform focused on Artificial Intelligence, Robotics, and Technology. It provides an interactive, geographically-aware news feed that allows users to explore AI-related news as it happens globally, with a beautiful map-centric interface.

**Core Purpose:** Enable anyone to clone this GitHub repository and instantly have a **24/7 production-ready AI news resource** that automatically aggregates the latest news from 17+ sources worldwide.

---

## 🎯 PROJECT GOALS & VISION

1. **Accessibility:** Anyone can `git clone`, `npm install`, `npm run dev`, and have a working dashboard in minutes
2. **Real-time:** News updates automatically every 5-10 minutes with zero manual intervention
3. **Global Coverage:** Show where in the world AI/tech news is happening with an interactive map
4. **Beautiful UX:** Modern, dark-themed interface with responsive interactions
5. **Deployable:** Works both locally and on cloud servers (AWS, DigitalOcean) with identical setup
6. **Open Source:** Public GitHub repository for community use and contribution

---

## 👥 TARGET USERS

- **AI Enthusiasts:** Track latest developments in AI/ML/Robotics
- **Researchers:** Monitor academic papers and research breakthroughs
- **Entrepreneurs:** Watch for startup funding, landmark deals, infrastructure news
- **Developers:** Stay updated on AI tools, models, and frameworks
- **Business Leaders:** Monitor industry trends and market movements
- **Media/Content Creators:** Source for news content creation

---

## 🗺️ CORE FEATURES

### 1. INTERACTIVE WORLD MAP (PRIMARY UI)
**Status:** IN PROGRESS - Needs Interactive Implementation

#### Requirements:
- **Base Map:** Use AI-WORLD-MAP.png image as background
- **Interactivity:**
  - ✅ Draggable with mouse (click & drag to pan)
  - ✅ Mouse wheel zoom in/out (with min/max zoom levels)
  - ✅ Double-click to zoom into location
  - ✅ Search box to jump to specific cities/regions
  - ✅ Click article in feed → map jumps to location

#### News Markers:
- **Representation:** Colored dots/pins at article locations
- **Colors:**
  - 🟠 Gold (#F5A623) = Standard news article
  - 🔴 Red (#D83A2E) = Selected/hovered article
  - 🟡 Yellow = Article from high-interest source

#### Marker Interactions:
- **Hover:** Shows tooltip with article title + source
- **Hover:** Article preview card appears
- **Hover:** Corresponding article highlighted in feed sidebar
- **Click:** Opens full article details in modal/side panel
- **Cluster:** Multiple nearby articles may cluster as one marker

#### Technical:
- Equirectangular or Mercator projection for lat/lng mapping
- Smooth panning animation
- Efficient marker rendering (canvas or optimized SVG)
- Responsive sizing based on container

---

### 2. NEWS FEED SIDEBAR
**Status:** BUILT ✅

#### Layout:
- **Position:** Right side of screen (or floating panel)
- **Display:** Scrollable list of latest articles (default: 50 articles shown)
- **Article Cards:** Show:
  - 📍 Location (city/region)
  - 📰 Article title
  - 🏷️ Source name
  - ⏰ Time ago (e.g., "2h", "15m")
  - 🏷️ Category badge

#### Interactions:
- Click article → opens detail modal
- Click article → map jumps to that location
- Hover → highlights on map
- Right-click → bookmark/save option (future)

---

### 3. LIVE TICKER (BOTTOM)
**Status:** NOT YET BUILT

#### Specification:
- **Position:** Bottom of screen, full width
- **Display:** Single-line scrolling feed of latest news headlines
- **Auto-scroll:** Headlines move horizontally like stock ticker
- **Content:** Most recent 5-10 articles in rotation
- **Click:** Click headline → open article detail
- **Pause on Hover:** Stop scrolling to read

#### Styling:
- Dark background with contrasting text
- Brand colors: #D83A2E (red) for accents, #F5A623 (gold) for highlights
- Animated scrolling effect

---

### 4. FILTERING & SEARCH

#### Filter Options:
- **By Time:** Last 1hr, 6hr, 24hr, 7 days, All
- **By Category:**
  - 🛠️ Tools
  - 🧠 LLMs & Models
  - 🚀 AI (General)
  - 🏢 Landmark Deals & High-Growth Startups
  - 🌍 Daily Life & Business Impacts
  - 🌐 Global AI & Infrastructure
  - 🤖 Robotics & Gadgets
- **By Source:** Checkbox list of enabled sources
- **Search:** Full-text search within articles (title + description)

#### UI Location:
- Sidebar at top above feed
- Collapsible for more feed space
- Filter counts show how many articles match

---

### 5. NEWS SOURCES MANAGEMENT
**Status:** BUILT ✅

#### Current Implementation:
- Configuration modal with "Sources" tab
- Add new RSS feed (name, type, URL, category)
- Toggle sources on/off
- Delete sources
- Persist to `data/sources.json`

#### Default Sources (17):
**Tech & News:**
- Hacker News
- Ars Technica
- The Verge
- The Next Web
- Wired
- TechCrunch
- Medium AI

**Research:**
- ArXiv AI Papers
- ArXiv Machine Learning

**Community:**
- Reddit r/MachineLearning
- Reddit r/ArtificialIntelligence

**Companies:**
- OpenAI Blog
- DeepMind Blog
- Anthropic Research
- Hugging Face Blog

**Other:**
- GitHub Trending AI
- Product Hunt

#### Requirements:
- Users can add custom RSS sources anytime
- Each source has: name, URL, type (RSS/API/etc), category, enabled flag
- Sources updated in real-time without restart
- All sources saved persistently

---

### 6. LIVE VIDEO FEEDS SECTION
**Status:** NOT YET BUILT

#### Specification:
- **Position:** Bottom right corner (or expandable panel)
- **Content:** Multiple embedded live video streams:
  - 📺 CNN Live (international news)
  - 🎥 BBC News (global news)
  - 💻 Tech News streams (TechCrunch, CNET, etc.)
  - 🤖 AI-focused channel (if available)

#### Layout:
- Grid of 2-4 video players
- Expandable to full screen
- Auto-play muted (respect autoplay policies)
- Click to unmute

---

### 7. ANALYTICS DASHBOARD
**Status:** NOT YET BUILT

#### Metrics to Display:
- **Total Stories:** Count of articles currently loaded
- **Active Sources:** How many sources are enabled
- **Locations:** Number of unique locations represented
- **Trending Categories:** Most represented categories
- **Top Sources:** Which sources have most articles
- **Last Updated:** When articles were last fetched
- **Update Frequency:** How often new articles appear

#### Visualization:
- Card-based layout
- Color-coded by category
- Charts (pie, bar) for breakdowns
- Real-time updates as new articles arrive

---

### 8. DATA EXPORT
**Status:** NOT YET BUILT

#### Export Formats:
- **JSON:** Complete article data with metadata
- **CSV:** Spreadsheet-compatible format
- **RSS Feed:** Generate custom RSS feed from current articles
- **PDF Report:** Generate PDF snapshot of current news

#### Export Options:
- All articles
- Filtered results
- By time range
- By category/source
- Single article

#### UI Location:
- Settings/Configuration menu

---

### 9. ARTICLE DETAIL VIEW
**Status:** BUILT (Basic) ✅

#### Display:
- Modal/side panel showing:
  - Article title
  - Location (city)
  - Source name
  - Publishing date/time
  - Article description
  - Link to full article (opens in new tab)
  - Category badge
  - Author (if available)

#### Interactions:
- Close button (X)
- Open in browser button
- Share article (future: copy link, share to social)

---

## 🎨 UI/UX SPECIFICATIONS

### Color Palette (Brand Colors)
```
Primary Dark:      #1F2933 (Charcoal - backgrounds)
Primary Light:     #F5F5F5 (Soft white - text)
Accent Red:        #D83A2E (Editorial Signal - highlights, alerts)
Accent Gold:       #F5A623 (Warm Accent - secondary, hover)
Text Secondary:    #6B7280 (Slate neutral - metadata)
Border/Divider:    #3a4a5a (Medium gray)
Success:           #22c55e (Green)
Warning:           #f97316 (Orange)
```

### Typography
- Font Family: Segoe UI, sans-serif
- Headlines: 16-20px, bold
- Body: 12-14px, regular
- Metadata: 10-11px, gray
- Monospace (URLs): Monaco, Menlo

### Layout Specifications

#### Dashboard Grid:
```
┌─────────────────────────────────────┐
│         HEADER (Navigation)         │
├──────────────────┬──────────────────┤
│                  │                  │
│   INTERACTIVE    │   FEED SIDEBAR   │
│   WORLD MAP      │  (Article List)  │
│  (Draggable)     │                  │
│                  │                  │
├──────────────────┴──────────────────┤
│   LIVE TICKER (Scrolling Headlines) │
├──────────────────┬──────────────────┤
│   LIVE VIDEO     │   ANALYTICS      │
│   FEEDS          │   DASHBOARD      │
│   (4 streams)    │   (Stats & Charts)│
└──────────────────┴──────────────────┘
```

#### Responsive Breakpoints:
- **Desktop (1920px+):** Full layout as above
- **Laptop (1366px):** Adjust video grid to 2x2
- **Desktop HD (1280px):** Stack some sections, hide less critical panels
- **Tablet (768px):** Vertical layout, map full width rotating sections
- **Mobile:** Map + feed rotatable, minimal video section (mobile is nice-to-have, not primary)

### Dark Theme
- All backgrounds use dark tones (#1F2933, #2d3a48)
- Light text on dark backgrounds
- Accent colors pop against dark backgrounds
- Smooth transitions (0.2s) on all interactions

---

## 🔄 DATA FLOW & REAL-TIME UPDATES

### Data Sources
- **17 Free News Sources:** RSS feeds, APIs (no API keys required for initial launch)
- **Location Extraction:** AI-powered content analysis + company HQ database
- **Fallback Locations:** When location can't be determined, use company HQ or generic region

### Update Cycle
1. **Fetch Interval:** Every 5-10 minutes (configurable)
2. **Caching:** 5-minute cache to avoid duplicate API calls
3. **Deduplication:** Remove duplicate articles by title
4. **Sorting:** Most recent articles first
5. **Limit:** Maximum 100 articles in memory at any time

### Real-time Notifications (Optional Future)
- Toast notification when new article appears in user's category
- Number badge on menu items when new articles in filtered view
- Optional email digest (daily/weekly)

---

## 🛠️ TECHNICAL STACK

### Frontend
- **Framework:** React 18+ with TypeScript
- **Bundler:** Vite
- **Styling:** CSS3 with brand color system
- **Map Library:** Custom implementation with canvas/SVG (Leaflet optional for v2)
- **HTTP Client:** Fetch API

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** JSON file storage (data/sources.json, data/articles.json)
  - Future: Consider SQLite for production
- **Port:** 7000 (backend) / 5180+ (frontend)

### APIs/Services
- **Hacker News:** Firebase API (free, no auth)
- **ArXiv:** RSS feed (free)
- **GitHub:** REST API v3 (free tier)
- **RSS Parser:** rss-parser npm package
- **Location Data:** Hardcoded company locations + city database

---

## 📦 DEPLOYMENT SPECIFICATIONS

### Local Development
```bash
git clone https://github.com/yourusername/ai-news-dashboard.git
cd ai-news-dashboard
npm install
npm run dev  # Starts both backend and frontend
```
- **Duration:** Should be ready in < 2 minutes
- **Requirements:** Node 18+, npm/yarn, ~200MB disk space

### Self-Hosted (AWS/DigitalOcean)
- **Server:** Linux VPS (t2.micro or droplet starter plan works)
- **Setup:** Same as local, plus:
  - Install Node.js
  - Clone repo
  - Run `npm run build && PORT=7000 node dist/server.js`
- **Reverse Proxy:** Nginx to serve frontend + proxy /api to backend
- **Persistence:** SQLite database in `/data` directory
- **Uptime:** PM2 or systemd to auto-restart on crash

### Cloud Ready
- **Vercel:** Deploy frontend, backend might need separate serverless function
- **Railway:** Deploy both frontend + backend in one project
- **Docker:** Dockerfile for containerized deployment

---

## 📋 FEATURE ROADMAP

### Phase 1: MVP (Current - Week 1)
- ✅ Interactive world map with dragging & zoom
- ✅ News feed sidebar with articles
- ✅ Map-feed synchronization (click → jump)
- ✅ Article detail modal
- ✅ Basic filtering (time, category, search)
- ✅ News source management (CRUD)
- ⏳ Live ticker at bottom

### Phase 2: Enhanced Dashboard (Week 2)
- Live video feeds section
- Analytics dashboard with stats
- Improved marker clustering
- Category tagging refinement
- Save/bookmark articles

### Phase 3: Export & Advanced (Week 3)
- Data export (JSON, CSV, RSS)
- API for external apps
- Advanced analytics charts
- Custom alert/notifications
- Mobile-responsive improvements

### Phase 4: Polish & Scale (Week 4)
- Performance optimization
- More news sources integration
- User preferences/settings persistence
- Admin dashboard for source management
- Rate limiting & caching optimization

---

## 🚀 SUCCESS METRICS

1. **Performance:**
   - Dashboard loads in < 3 seconds
   - Map interactions smooth (60fps)
   - Articles update within 5-10 min of publication

2. **Coverage:**
   - Minimum 50 articles loaded at any time
   - Articles from at least 15 different locations
   - All 7 categories represented

3. **User Experience:**
   - Zero console errors
   - All interactions respond in < 200ms
   - Map is intuitive and discoverable

4. **Reliability:**
   - 99%+ uptime in production
   - Graceful failure if source is down (others still work)
   - No data loss between restarts

---

## 📝 ACCEPTANCE CRITERIA

### Map Implementation ✅
- [ ] Map image (AI-WORLD-MAP.png) displays full screen
- [ ] Dragging with mouse works smoothly
- [ ] Mouse wheel zooms in/out with smooth animation
- [ ] Zoom respects min (1x) and max (10x) levels
- [ ] Double-click zooms to location
- [ ] News markers appear at correct lat/lng coordinates
- [ ] Clicking marker shows article detail
- [ ] Hovering marker shows tooltip
- [ ] Clicking article in feed jumps map to location

### Feed Sidebar ✅
- [ ] Article list displays with title, source, time, location
- [ ] Articles are clickable
- [ ] Scrolling works smoothly
- [ ] Feed updates every 5-10 minutes
- [ ] Highlighting works when marker is hovered

### Filtering ✅
- [ ] Time filters work (1h, 6h, 24h, 7d, all)
- [ ] Category filters work (7 categories)
- [ ] Source filters show enabled/disabled
- [ ] Search returns relevant results
- [ ] Filter combinations work together

### Source Management ✅
- [ ] Sources can be added via UI
- [ ] Sources can be toggled on/off
- [ ] Sources can be deleted
- [ ] Changes persist to file
- [ ] Articles refresh from new sources immediately

### Analytics (Future)
- [ ] Stats show total articles, unique locations, top sources
- [ ] Charts update in real-time
- [ ] Category breakdown displays

### Deployment
- [ ] Works on `npm run dev`
- [ ] Works on AWS/DigitalOcean VPS
- [ ] Starts automatically with systemd/PM2
- [ ] Survives crashes and restarts

---

## 🤔 OPEN QUESTIONS & DECISIONS

1. **Map Library Choice:**
   - Custom implementation (current): Lightweight, full control
   - Leaflet: More features, but adds complexity
   - Mapbox: Beautiful, but requires API key (costs $$)
   - **Decision:** Start with custom, evaluate for Phase 2

2. **Database:**
   - JSON files (current): Simple, no dependencies
   - SQLite: Better for scale, indexed queries
   - **Decision:** JSON for MVP, migrate to SQLite if > 1000 articles

3. **Real-time Updates:**
   - Polling every 5 min (current): Simple, no server overhead
   - WebSockets: True real-time, more complex
   - Server-Sent Events (SSE): Middle ground
   - **Decision:** Start with polling, upgrade if needed

4. **Location Accuracy:**
   - Current: Company HQ fallback, hardcoded city list
   - Better: Use IP geolocation or NLP on article content
   - **Decision:** Improve as Phase 2 enhancement

5. **Article Clustering:**
   - Show all markers: May be cluttered with many articles
   - Cluster nearby markers: Reduces clutter, need interaction design
   - **Decision:** Start without clustering, add if needed

---

## 📚 RESOURCES & REFERENCES

- **Hacker News API:** https://github.com/HackerNews/API
- **ArXiv RSS:** https://arxiv.org/help/rss
- **rss-parser npm:** https://www.npmjs.com/package/rss-parser
- **Web Map Projections:** https://en.wikipedia.org/wiki/Mercator_projection
- **Latitude/Longitude Reference:** https://www.latlong.net

---

## 👥 TEAM & RESPONSIBILITIES

- **Product Owner:** You
- **Developer:** Claude AI (Claude Code)
- **Designer:** Brand colors & layouts provided by PO
- **Deployment:** User (with automated scripts provided)

---

## 📅 TIMELINE ESTIMATE

| Phase | Duration | Status |
|-------|----------|--------|
| MVP (Map + Feed + Sources) | 2-3 days | IN PROGRESS |
| Enhanced (Video + Analytics) | 2-3 days | TODO |
| Export & Advanced | 2-3 days | TODO |
| Polish & Scale | 2-3 days | TODO |
| **Total to Production** | **~10 days** | |

---

## 🎯 NEXT STEPS

1. ✅ Confirm this PRD matches your vision
2. ⏳ Implement interactive map with AI-WORLD-MAP.png
3. ⏳ Build live ticker component
4. ⏳ Add live video feeds section
5. ⏳ Create analytics dashboard
6. ⏳ Implement export functionality
7. ⏳ Production deployment & testing
8. ⏳ GitHub repo setup & documentation

---

**Last Updated:** March 9, 2026
**Next Review:** When Phase 1 complete
