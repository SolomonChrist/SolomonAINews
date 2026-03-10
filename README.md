# 🌍 AI NEWS DASHBOARD

> **Real-time global AI & tech news aggregator with an interactive world map**

[![License](https://img.shields.io/badge/license-MIT-green)]()
[![Status](https://img.shields.io/badge/status-in%20development-yellow)]()
[![Node](https://img.shields.io/badge/node-18+-green)]()

![AI News Dashboard Screenshot](screenshot.png)

## 🎯 Overview

The **AI News Dashboard** is a production-ready, open-source news aggregation platform that brings global AI/tech/robotics news to life on an interactive world map. Designed for easy deployment, it works on your laptop, cloud servers, or VPS with **zero API keys required**.

**Perfect for:**
- 📊 Tracking AI/ML/Robotics developments globally
- 🚀 Monitoring startup funding and landmark deals
- 🔬 Following academic research breakthroughs
- 💡 Staying updated on AI tools and infrastructure
- 📈 Building content around tech news
- **🌍 Learning to build real-time web applications**

## ✨ Key Features

### 🗺️ Interactive World Map
- **Drag & Pan** - Click and drag to move around the world
- **Mouse-centric Zoom** - Zoom in/out focused on your cursor position
- **Double-Click** - Zoom to article location
- **Live Markers** - Colored dots show where news is happening
- **Calibration Tool** - Align map perfectly with 3-point calibration
- **Smooth Animations** - Responsive, 60fps interactions

### 📰 News Feed Sidebar
- Latest articles from **17+ free sources**
- Organized by location, source, and time
- Click article → map jumps to that location
- Full article details with source links

### 🔧 Customizable News Sources
- **Add/Edit/Delete** RSS feeds in one click
- Default sources: Hacker News, ArXiv, GitHub, TechCrunch, OpenAI, DeepMind, etc.
- Changes take effect immediately (no restart)

### 📊 Auto-Refresh & Caching
- Updates every **5-10 minutes** automatically
- Smart 5-minute caching prevents rate limits
- Graceful fallback if source is down

### 📹 Live Video & Ticker
- **Live Ticker** - Real-time scrolling headlines at the bottom
- **Video Feeds** - Multiple embedded news streams (CNN, BBC, NASA, etc.)
- **Configurable** - Add your own YouTube live streams via Source Manager

### 🎨 Beautiful Dark UI
- Brand colors: Red (#D83A2E) and Gold (#F5A623)
- Smooth transitions and animations
- Responsive layout (desktop-first)

## 🚀 Quick Start

### Installation (< 2 minutes)

**Prerequisites:** Node.js 18+ and npm

```bash
# Clone repository
git clone https://github.com/yourusername/ai-news-dashboard.git
cd ai-news-dashboard

# Install dependencies
npm install

# Start both frontend and backend
npm run dev
```

You'll see:
```
✓ Backend API: http://localhost:5000
✓ Frontend: http://localhost:5173 (Vite default)
```

Open **http://localhost:5173** in your browser. Done! 🎉

## 📦 What's Included

✅ **Interactive World Map** - Drag, pan, zoom, double-click
✅ **News Feed** - 17+ free sources, auto-updating
✅ **Location Mapping** - Articles pinned to their origin
✅ **Source Management** - Add/edit/delete RSS feeds
✅ **Manual Override** - Global instant refresh button for on-demand updates
✅ **Article Details** - Full metadata, source links
✅ **Configuration** - Save/restore dashboard layout
✅ **Dark Theme** - Brand-colored, modern UI
✅ **Production Ready** - TypeScript, ESM, optimized
✅ **Zero Config** - No API keys, environment vars, or database setup required
✅ **Cloud Ready** - Works on AWS, DigitalOcean, any Linux VPS

## 🛠️ Tech Stack

| Component | Tech |
|-----------|------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Backend** | Node.js + Express + TypeScript |
| **Map** | Canvas API (custom, no map library) |
| **Styling** | CSS3 (dark theme, responsive) |
| **Data** | JSON files (no database!) |
| **News** | 17 free RSS feeds & APIs |

## 📂 Project Structure

```
ai-newsbot/
├── src/
│   ├── client/              # React frontend
│   │   └── components/      # GridDashboard, InteractiveMap, etc.
│   ├── routes/              # Express API endpoints
│   ├── services/            # News fetching & location extraction
│   └── server.ts            # Express app entry
├── public/                  # Static assets
│   └── AI-WORLD-MAP.png    # Your custom world map (add it here!)
├── data/
│   └── sources.json         # News sources configuration
├── PRD.md                   # Product requirements (complete roadmap)
├── IMPLEMENTATION_GUIDE.md  # Detailed technical guide
└── README.md                # This file
```

## 🗺️ Using Your Custom Map Image

1. **Generate** a world map image using Gemini AI
2. **Save as** `public/AI-WORLD-MAP.png`
3. **Restart** the app - it auto-loads your map
4. Done! Map now shows all articles at correct coordinates

Supports any image ratio - code auto-scales it.

## 🚀 Production Deployment

### Option A: DigitalOcean VPS (Recommended)

```bash
# SSH into your $5/month droplet
ssh root@your.droplet.ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone & deploy
git clone https://github.com/yourusername/ai-news-dashboard.git
cd ai-news-dashboard
npm install && npm run build

# Start with PM2
npm install -g pm2
PORT=5000 pm2 start dist/server.js --name "ai-news"
pm2 startup  # Enable auto-start on reboot
pm2 save

# Access API at http://your.droplet.ip:5000
# Serve the /dist/client folder via NGINX or similar for the frontend.
```

### Option B: AWS EC2

Same as DigitalOcean but use **t2.micro** instance (free tier eligible).

### Option C: Docker

```bash
docker build -t ai-news-dashboard .
docker run -p 7000:7000 -v $(pwd)/data:/app/data ai-news-dashboard
```

See **IMPLEMENTATION_GUIDE.md** for complete deployment docs.

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| **[README.md](./README.md)** | Quick start & overview (this file) |
| **[PRD.md](./PRD.md)** | Complete product roadmap & requirements |
| **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** | Technical implementation details |

## 📊 Default News Sources (17)

**Tech News:** Hacker News • Ars Technica • The Verge • TechCrunch • The Next Web • Wired

**AI/Research:** ArXiv AI • ArXiv ML • Medium AI

**Community:** Reddit r/MachineLearning • Reddit r/ArtificialIntelligence

**Company Blogs:** OpenAI • DeepMind • Anthropic • Hugging Face

**Trending:** GitHub Trending • Product Hunt

**Add more:** Click ⚙️ Configure → Sources → "+ Add Source" → Paste RSS URL

## 🎨 Customization

### Change Color Scheme
Edit `src/client/components/GridDashboard.css`:
```css
--accent-red: #D83A2E;    /* Change this */
--accent-gold: #F5A623;   /* Or this */
```

### Change Refresh Interval
Edit `src/services/dataFetcher.ts`:
```typescript
const CACHE_DURATION = 5 * 60 * 1000;  // 5 min (change to 30 for slower updates)
```

### Change Map Zoom Limits
Edit `src/client/components/InteractiveMap.tsx`:
```typescript
maxZoom: 8,    // Max allowed zoom
minZoom: 0.5;  // Min allowed zoom
```

## 🎯 Roadmap

### ✅ Phase 1: MVP & Core Features
- [x] Interactive world map (drag, focus-point zoom, calibration)
- [x] News feed with location markers
- [x] Live ticker (scrolling headlines)
- [x] Live video feeds (customizable streams)
- [x] Source management (RSS, Video, IDs)
- [x] Auto-refresh every 5-10 min
- [x] Dark theme with brand colors

### ⏳ Phase 2: Enhanced & Analytics
- [ ] Analytics dashboard (charts & stats)
- [ ] Advanced filtering (time, category, source)
- [ ] Category-based color coding

### 📅 Phase 3: Export & Advanced
- [ ] Export (JSON, CSV, RSS, PDF)
- [ ] Bookmark/save articles
- [ ] Full-text search
- [ ] Custom alerts

### 🚀 Phase 4: Scale & Polish
- [ ] Mobile responsive UI
- [ ] Performance optimization
- [ ] Additional news sources
- [ ] User preferences storage

See **[PRD.md](./PRD.md)** for complete roadmap with details.

## 🐛 Troubleshooting

### "Cannot GET /api/sources" or "Cannot GET /api/news/feed"
**Problem:** Backend server not running
**Solution:** Run `npm run dev` and check backend started on port 7000

### Map shows empty
**Problem:** Articles don't have location data
**Solution:** Check `/api/news/feed` response, verify sources are enabled

### No articles loading
**Problem:** News sources are down or API changed
**Solution:** Check `npm run dev` logs, verify RSS feed URLs in Sources panel

### "Port already in use"
**Problem:** Another process using port 5000 or 5174
**Solution:**
- Linux/Mac: `lsof -ti :5000 | xargs kill -9`
- Windows: Kill Node.js in Task Manager

See **IMPLEMENTATION_GUIDE.md** for more troubleshooting.

## ❓ FAQ

**Q: Do I need API keys?**
A: No! All 17 sources are completely free.

**Q: Can I add custom news sources?**
A: Yes! Click ⚙️ Configure → Sources → "+ Add Source" and paste any RSS feed URL.

**Q: How often do articles update?**
A: Every 5-10 minutes automatically (configurable).

**Q: Does it work on mobile?**
A: Desktop-first but functional on tablets. Full mobile UI coming soon.

**Q: Can I use this commercially?**
A: Yes! MIT licensed - use for anything.

**Q: How is location data extracted?**
A: AI analyzes article content + company HQ database. ~80-90% accuracy.

**Q: Does it need a database?**
A: No! Uses JSON files. SQLite can be added later.

## 🤝 Contributing

Contributions welcome!

1. Fork the repo
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -am 'Add feature'`
4. Push: `git push origin feature/your-feature`
5. Create Pull Request

## 📝 License

MIT License - Use freely for personal and commercial projects.

## 🙌 Credits

Built with ❤️ for the AI community using React, Express, TypeScript, and passion.

---

## 🚀 Get Started Now

```bash
git clone https://github.com/yourusername/ai-news-dashboard.git
cd ai-news-dashboard
npm install
npm run dev
```

Open **http://localhost:5180** and start exploring global AI news! 🌍

**Questions?** See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) or [PRD.md](./PRD.md).
