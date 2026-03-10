# AI News Dashboard Mission Control - Phase 2.0 🚀

**Evolved from:** Simple news aggregator (Phase 1)
**Vision:** Production-grade intelligence dashboard for AI news, powered by multi-source ingestion, AI enrichment, and real-time delivery

---

## 🎯 Core Vision

A **command-center dashboard** for AI professionals and enthusiasts that:
- ✅ Aggregates AI news from **124,000+ sources** (NewsAPI + Newsdata)
- ✅ Shows **real-time ticker** at bottom with live updates
- ✅ Displays **global map** of story origins and trends
- ✅ Features **23 AI experts** in curated "Voices to Follow" section
- ✅ Provides **admin controls** for source management, enrichment, and curation
- ✅ Supports **custom sources** (RSS, APIs, webhooks, social feeds)
- ✅ Enriches articles with **AI analysis** (summarization, tagging, sentiment, urgency)
- ✅ Handles **alerts & watchlists** for breaking stories
- ✅ Optimized for **always-on display** usage (TV, monitor, tablet)

---

## 🏗️ Architecture

### Technology Stack

**Backend:**
- Express.js (HTTP server)
- Prisma (ORM)
- PostgreSQL (primary database)
- Redis (caching, queue)
- BullMQ (background jobs)
- JWT (authentication)

**Frontend:**
- React 18 (UI framework)
- Zustand (state management)
- Tailwind CSS (styling)
- Leaflet (map visualization)
- Recharts (analytics)
- React Router (navigation)

**Infrastructure:**
- Docker (containerization)
- TypeScript (type safety)
- ESLint + Prettier (code quality)

### Data Model

**Core Entities:**
- **User** - Authentication & role-based access
- **Source** - News sources (RSS, APIs, webhooks)
- **FeedItem** - Individual articles with normalization
- **FeedCluster** - Grouped related stories
- **Topic, Entity, Region** - Taxonomy
- **Alert, Watchlist** - User monitoring
- **VoiceProfile** - AI experts & thought leaders
- **Provider, EnrichmentJob** - AI enrichment pipeline
- **PollRun** - Source polling history
- **AuditLog** - Admin activity tracking

### Ingestion Pipeline

```
Source → Polling → Normalization → Deduplication → Clustering → Enrichment → Delivery
  ↓        ↓            ↓              ↓               ↓           ↓          ↓
 RSS     CronJob    Extract      Compare        Group       AI       WebSocket
 API     BullMQ     Fields       Hash          Related     Analysis   SSE
Social   Webhook    Dates        Similarity    Stories     Tags       UI
Manual   Interval   Author       Titles        Topics      Score      Ticker
```

### Enrichment Pipeline

When AI providers are configured:
- **Summarization** - Extract key points from articles
- **Entity Extraction** - Identify companies, people, products
- **Topic Tagging** - Auto-classify by category
- **Sentiment Analysis** - Detect tone (positive/negative/neutral)
- **Urgency Scoring** - Mark breaking, critical, or routine
- **Market Impact** - Estimate business relevance

---

## 📊 Features by Phase

### Phase 1 (Current - Completed) ✅
- [x] Basic news aggregation (NewsAPI, Newsdata)
- [x] Twitter integration
- [x] Live video feeds
- [x] React frontend with dark/light mode
- [x] Database caching

### Phase 2 (In Progress) 🔨
- [ ] Prisma ORM + PostgreSQL migration
- [ ] User authentication & roles (JWT + NextAuth)
- [ ] Source management system
- [ ] RSS feed adapter
- [ ] Feed normalization & deduplication
- [ ] Clustering engine
- [ ] Dashboard with filters, search, saved views
- [ ] Persistent bottom ticker
- [ ] Global map view (Leaflet)
- [ ] Admin source management UI
- [ ] Demo mode with seed data

### Phase 3 (Upcoming) 📋
- [ ] AI enrichment provider system
- [ ] Summarization jobs (OpenAI, Anthropic, Cohere)
- [ ] Entity extraction & tagging
- [ ] Sentiment & urgency scoring
- [ ] Market impact classifier
- [ ] BullMQ job queue & worker
- [ ] Hourly polling jobs

### Phase 4 (Upcoming) 🎙️
- [ ] AI Voices to Follow section
- [ ] Expert profile management
- [ ] Featured content linking
- [ ] Admin curation tools
- [ ] Pinned story management

### Phase 5 (Upcoming) 📊
- [ ] Analytics dashboard
- [ ] Source health monitoring
- [ ] Ingestion logs & error dashboard
- [ ] Alert system
- [ ] Watchlist management
- [ ] Docker deployment
- [ ] Production documentation

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 13+ (local or cloud: Neon, Supabase, Railway)
- Redis (local or cloud: Upstash, Railway)

### Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your database and API keys

# Set up database
npx prisma migrate dev --name init

# Seed demo data
npm run seed

# Start development servers
npm run dev
# Backend on http://localhost:5000
# Frontend on http://localhost:5173

# Optional: View database in Prisma Studio
npm run db:studio
```

### Demo Mode

The app includes **demo mode** with mock data, allowing you to:
- See full UI without API keys
- Explore all features
- Test admin controls
- Understand data structure

Enable in `.env`:
```
ENABLE_DEMO_MODE=true
```

---

## 📁 Project Structure

```
ai-newsbot/
├── src/
│   ├── server.ts                    # Express server entry
│   ├── db/
│   │   ├── schema.prisma           # Prisma data model
│   │   └── seed.ts                 # Demo data
│   ├── services/
│   │   ├── sources/
│   │   │   ├── rssAdapter.ts      # RSS feed parser
│   │   │   ├── newsApiAdapter.ts  # NewsAPI integration
│   │   │   ├── normalizer.ts      # Normalize across sources
│   │   │   └── deduplicator.ts    # Deduplication logic
│   │   ├── enrichment/
│   │   │   ├── summarizer.ts      # AI summarization
│   │   │   └── tagger.ts          # Auto-tagging
│   │   ├── polling/
│   │   │   └── poller.ts          # Source polling
│   │   └── auth/
│   │       ├── jwt.ts             # JWT utilities
│   │       └── crypto.ts          # Credential encryption
│   ├── routes/
│   │   ├── sources.ts              # Source CRUD
│   │   ├── feeds.ts                # Feed endpoints
│   │   ├── alerts.ts               # Watchlist/alerts
│   │   ├── admin.ts                # Admin controls
│   │   └── auth.ts                 # Authentication
│   ├── jobs/
│   │   ├── pollWorker.ts          # Poll runner
│   │   ├── enrichmentWorker.ts    # Enrichment processor
│   │   └── worker.ts              # Job queue consumer
│   ├── middleware/
│   │   ├── auth.ts                # Auth middleware
│   │   └── audit.ts               # Audit logging
│   ├── types/
│   │   └── index.ts               # TypeScript interfaces
│   ├── utils/
│   │   ├── logger.ts              # Logging
│   │   └── cache.ts               # Redis helpers
│   └── client/                      # React frontend
│       ├── pages/
│       │   ├── dashboard.tsx       # Main dashboard
│       │   ├── map.tsx             # Global map
│       │   ├── market-movers.tsx   # Trending stories
│       │   ├── voices.tsx          # AI experts
│       │   ├── sources.tsx         # Source management
│       │   ├── admin.tsx           # Admin panel
│       │   └── settings.tsx        # User settings
│       ├── components/
│       │   ├── Ticker.tsx          # Bottom ticker
│       │   ├── Map.tsx             # Leaflet map
│       │   ├── FeedList.tsx        # Story list
│       │   └── ...
│       └── App.tsx                 # Root component
├── prisma/
│   ├── schema.prisma               # Data model
│   └── migrations/                 # DB migrations
├── package.json
├── .env.example
├── tsconfig.json
└── README.md
```

---

## 🔌 Source Adapters

The system supports multiple source types:

### RSS Adapter
- Parse RSS/Atom feeds
- Track last poll timestamp
- Handle failures gracefully
- Normalize to FeedItem schema

### News API Adapter
- NewsAPI.org integration
- NewsData.io integration
- Query by keyword, category, region
- Respect rate limits

### Custom JSON Adapter
- Define endpoint + parsing rules
- Support authentication
- Map fields to FeedItem schema

### Social Feed Adapter
- X/Twitter API v2 (with official access)
- Webhooks for manual posts
- Compliance-first design

### Manual Adapter
- Admin can create stories directly
- Useful for curated picks
- Mark as "featured" or "pinned"

---

## 🔐 Security

- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Encrypted credential storage
- ✅ Input validation & sanitization
- ✅ CSRF protection
- ✅ Audit logging for admin actions
- ✅ Rate limiting on APIs
- ✅ No client-side secret exposure

---

## 📈 Performance

- **Dashboard Load**: < 2 seconds (incremental loading)
- **Ticker Updates**: Real-time via WebSocket/SSE
- **Search**: < 500ms (full-text indexed)
- **Admin**: Optimized for dense information
- **Mobile**: Responsive design (mobile-first)

---

## 🗺️ Roadmap

**Q1 2026:**
- Phase 2: Core dashboard, sources, admin
- PostgreSQL migration
- Authentication system

**Q2 2026:**
- Phase 3: AI enrichment pipeline
- Integration with OpenAI, Anthropic
- Advanced analytics

**Q3 2026:**
- Phase 4: AI Voices, curation
- Enhanced admin tools
- Production hardening

**Q4 2026:**
- Phase 5: Deployment, docs
- Open source release
- Community features

---

## 🤝 Contributing

This project is designed to be open-sourced. Code quality standards:
- TypeScript strict mode
- ESLint + Prettier
- Unit tests for adapters
- Integration tests for pipelines
- Clear documentation

---

## 📚 Documentation

- **ARCHITECTURE.md** - Technical deep dive
- **API.md** - REST/WebSocket endpoints
- **ADMIN.md** - Admin guide
- **DEPLOYMENT.md** - Production setup
- **CONTRIBUTING.md** - Dev guide

---

## 🎯 Success Metrics

A successful dashboard will:
- ✅ Load in < 2 seconds
- ✅ Show fresh stories within 5 minutes
- ✅ Support 100+ concurrent users
- ✅ Provide 95% uptime
- ✅ Handle 10,000+ articles/day
- ✅ Enable admin to manage 50+ sources
- ✅ Feature 23 AI experts prominently
- ✅ Work on all devices (mobile to TV)

---

## 🚀 Next Steps

1. **Install deps & set up DB**: `npm install && npm run db:push`
2. **Seed demo data**: `npm run seed`
3. **Start development**: `npm run dev`
4. **Explore dashboard**: http://localhost:5173
5. **Configure sources**: Add via admin panel
6. **Add AI providers**: (Phase 3)
7. **Deploy**: Docker + cloud provider

---

**Built with ❤️ for AI professionals, researchers, and enthusiasts**

Questions? Check the docs or open an issue.
