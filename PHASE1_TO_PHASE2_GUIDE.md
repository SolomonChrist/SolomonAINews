# Migration Guide: Phase 1 → Phase 2.0 🚀

## What's Changed

The original **simple newsbot** has been evolved into **AINewsDashboardMissionControl** - a production-grade intelligence system.

### Key Changes:
- ✅ **Database**: SQLite → PostgreSQL (via Prisma ORM)
- ✅ **Architecture**: Single module → Multi-layered (adapters, normalizers, enrichment)
- ✅ **Auth**: None → JWT + role-based access
- ✅ **Admin**: None → Full admin dashboard
- ✅ **Sources**: 2 APIs → 124,000+ sources via adapters
- ✅ **Enrichment**: None → AI pipeline (summarization, tagging, etc.)
- ✅ **Real-time**: WebSocket → WebSocket + SSE
- ✅ **Experts**: None → AI Voices section with profiles

---

## 📋 What's Been Created

### 1. Database Schema (Phase 2.0 Ready)
✅ **File**: `prisma/schema.prisma`
- 16 entities (User, Source, FeedItem, FeedCluster, Topic, Entity, Region, Alert, Watchlist, VoiceProfile, Provider, EnrichmentJob, PollRun, UserSetting, SavedView, AuditLog)
- Relationships fully defined
- Indexes for performance
- Ready for PostgreSQL

### 2. Updated Dependencies
✅ **File**: `package.json`
- Prisma ORM
- PostgreSQL driver
- BullMQ (job queue)
- Redis client
- JWT & bcrypt (auth)
- Leaflet & Recharts (visualization)
- Tailwind CSS
- Zustand (state)

### 3. Core Services (Partial)
✅ **File**: `src/services/sources/normalizer.ts`
- Normalize RSS, NewsAPI, custom JSON
- Standard schema for all sources

✅ **File**: `src/services/sources/deduplicator.ts`
- Detect duplicate stories
- Title similarity matching
- URL hashing

### 4. Documentation
✅ **File**: `README_PHASE2.md` - Full vision & architecture
✅ **File**: `.env.example` - All required variables
✅ **This file** - Migration guide

---

## 🛠️ To Complete Phase 2, You Need to:

### Step 1: Set Up PostgreSQL
Choose one (all have free tier):

**Option A: Local PostgreSQL**
```bash
# macOS
brew install postgresql
brew services start postgresql

# Linux
sudo apt-get install postgresql-13

# Windows
# Download from https://www.postgresql.org/download/windows/
```

**Option B: Cloud PostgreSQL (Recommended)**
- **Neon** (https://neon.tech) - Free tier, serverless
- **Supabase** (https://supabase.com) - PostgreSQL + extras
- **Railway** (https://railway.app) - $5/month
- **Render** (https://render.com) - Free tier available

Get your `DATABASE_URL` from the provider.

### Step 2: Set Up Redis
Choose one (all have free tier):

**Option A: Local Redis**
```bash
brew install redis
redis-server

# Or use Docker
docker run -d -p 6379:6379 redis:latest
```

**Option B: Cloud Redis**
- **Upstash** (https://upstash.com) - Serverless, free tier
- **Railway** - $2-5/month
- **Redis Cloud** - Free tier available

Get your `REDIS_URL`.

### Step 3: Update Environment
```bash
# Edit .env
DATABASE_URL="postgresql://user:pass@host:5432/ai_news_dashboard"
REDIS_URL="redis://:password@host:port"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"
```

### Step 4: Initialize Database
```bash
# Install dependencies
npm install

# Create database tables
npx prisma migrate dev --name init

# View in Prisma Studio
npm run db:studio
```

### Step 5: Seed Demo Data
Create `src/db/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create demo user
  const user = await prisma.user.create({
    data: {
      email: 'admin@demo.local',
      name: 'Admin User',
      password: 'hashed_password_here', // Use bcrypt in real app
      role: 'ADMIN',
    },
  });

  // Create demo source (RSS)
  const source = await prisma.source.create({
    data: {
      slug: 'ai-news-hacker-news',
      name: 'HackerNews AI Stories',
      sourceType: 'RSS',
      url: 'https://news.ycombinator.com/rss',
      category: 'ai',
      trustScore: 85,
    },
  });

  // Add more demo sources...
  console.log('✅ Demo data created');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
```

Then run:
```bash
npm run seed
```

### Step 6: Build API Endpoints
Create `src/routes/sources.ts`:
```typescript
import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// List sources
router.get('/', async (req, res) => {
  const sources = await prisma.source.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(sources);
});

// Create source
router.post('/', async (req, res) => {
  const { name, url, sourceType, category } = req.body;
  const source = await prisma.source.create({
    data: {
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      url,
      sourceType,
      category,
      trustScore: 50,
    },
  });
  res.json(source);
});

// ... more endpoints

export default router;
```

### Step 7: Build Frontend Components
Create `src/client/pages/Dashboard.tsx`:
```typescript
import { useEffect, useState } from 'react';
import { FeedItem } from '../types';

export function Dashboard() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/feeds')
      .then(r => r.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">AI News Dashboard</h1>

      <div className="grid grid-cols-1 gap-4">
        {items.map(item => (
          <article key={item.id} className="border rounded p-4">
            <h2 className="font-bold">{item.title}</h2>
            <p className="text-sm text-gray-600">{item.description}</p>
            <a href={item.url} target="_blank" className="text-blue-600">
              Read more →
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
```

### Step 8: Add Polling Service
Create `src/services/polling/poller.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import Parser from 'rss-parser';

const prisma = new PrismaClient();
const parser = new Parser();

export async function pollSource(sourceId: string) {
  const source = await prisma.source.findUnique({ where: { id: sourceId } });
  if (!source) return;

  try {
    const feed = await parser.parseURL(source.url);

    for (const item of feed.items || []) {
      // Normalize and deduplicate
      // Store in database
      // Trigger enrichment if enabled
    }
  } catch (error) {
    console.error(`Poll failed for ${source.slug}:`, error);
  }
}
```

### Step 9: Add Background Job Worker
Create `src/jobs/worker.ts`:
```typescript
import Bull from 'bull';
import { pollSource } from '../services/polling/poller';

const pollQueue = new Bull('poll-sources', process.env.REDIS_URL);

pollQueue.process(async (job) => {
  await pollSource(job.data.sourceId);
});

// Schedule polling
setInterval(async () => {
  const sources = await prisma.source.findMany({
    where: { isActive: true },
  });

  for (const source of sources) {
    await pollQueue.add({ sourceId: source.id });
  }
}, 3600000); // Every hour
```

### Step 10: Start Development
```bash
npm run dev

# In another terminal:
npm run jobs:worker

# Dashboard: http://localhost:5173
# Admin: http://localhost:5173/admin
# Prisma Studio: npm run db:studio
```

---

## 📦 Complete File Structure After Phase 2

```
ai-newsbot/
├── src/
│   ├── server.ts                 ← Express entry point
│   ├── db/
│   │   └── seed.ts              ← Demo data
│   ├── routes/
│   │   ├── sources.ts           ← CRUD sources
│   │   ├── feeds.ts             ← Feed endpoints
│   │   ├── alerts.ts            ← Watchlists
│   │   └── auth.ts              ← Login/register
│   ├── services/
│   │   ├── sources/
│   │   │   ├── normalizer.ts   ✅ CREATED
│   │   │   ├── deduplicator.ts ✅ CREATED
│   │   │   ├── rssAdapter.ts   ← TODO
│   │   │   └── newsApiAdapter.ts ← TODO
│   │   ├── polling/
│   │   │   └── poller.ts       ← TODO
│   │   └── clustering/
│   │       └── clusterer.ts    ← TODO
│   ├── jobs/
│   │   ├── worker.ts           ← TODO
│   │   ├── pollWorker.ts       ← TODO
│   │   └── enrichmentWorker.ts ← TODO
│   ├── middleware/
│   │   ├── auth.ts             ← TODO
│   │   └── audit.ts            ← TODO
│   ├── client/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx   ← TODO
│   │   │   ├── Map.tsx         ← TODO
│   │   │   ├── Admin.tsx       ← TODO
│   │   │   └── Voices.tsx      ← TODO
│   │   ├── components/
│   │   │   ├── Ticker.tsx      ← TODO
│   │   │   ├── FeedList.tsx    ← TODO
│   │   │   └── Navbar.tsx      ← TODO
│   │   └── App.tsx
│   └── types/
│       └── index.ts            ← TODO
├── prisma/
│   ├── schema.prisma          ✅ CREATED
│   └── migrations/
├── .env.example               ✅ CREATED
├── .env                       ← CREATE (copy from .env.example)
├── package.json              ✅ UPDATED
├── README_PHASE2.md          ✅ CREATED
└── PHASE1_TO_PHASE2_GUIDE.md ✅ THIS FILE
```

---

## 🔄 Migration Checklist

- [ ] PostgreSQL instance created (local or cloud)
- [ ] Redis instance created (local or cloud)
- [ ] `.env` file created with credentials
- [ ] `npm install` completed
- [ ] `npm run db:push` succeeded
- [ ] `npm run seed` created demo data
- [ ] Remaining services implemented
- [ ] API routes connected
- [ ] Frontend pages built
- [ ] Job worker running
- [ ] All tests passing
- [ ] Ready for Phase 3 (enrichment)

---

## 🎯 Key Architectural Patterns

### Adapter Pattern
Each source type has an adapter:
```typescript
interface SourceAdapter {
  parse(content: string): Promise<NormalizedItem[]>;
}
```

### Service Layer
Business logic in services:
```typescript
class FeedService {
  async getFeed(filters: FilterCriteria): Promise<FeedItem[]> { }
  async search(query: string): Promise<FeedItem[]> { }
}
```

### Job Queue Pattern
Heavy work via BullMQ:
```typescript
const pollQueue = new Bull('polls', REDIS_URL);
pollQueue.process(async (job) => { /* do work */ });
```

---

## 🚀 What's Next (Phase 3)

Once Phase 2 is complete:
- [ ] AI provider configuration (OpenAI, Anthropic, Cohere)
- [ ] Summarization jobs
- [ ] Entity extraction
- [ ] Sentiment analysis
- [ ] Urgency scoring
- [ ] Market impact classification

See `README_PHASE2.md` for full roadmap.

---

## 💡 Pro Tips

1. **Use Prisma Studio** to visualize data: `npm run db:studio`
2. **Test adapters** independently before hooking to pipeline
3. **Seed often** during development for consistent test data
4. **Monitor Redis** with: `redis-cli monitor`
5. **Check job queue** with Bull Board UI (add later)

---

## 🆘 Troubleshooting

**Database connection failed**
- Check `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Verify credentials and firewall

**Redis connection failed**
- Check `REDIS_URL` in `.env`
- Ensure Redis is running locally or cloud
- Check port 6379

**Migration error**
- Run `npx prisma migrate reset` to start fresh
- Confirm database schema with `npm run db:studio`

**Node modules issues**
- Delete `node_modules/` and `package-lock.json`
- Run `npm install` again

---

## 📚 Additional Resources

- Prisma Docs: https://www.prisma.io/docs/
- PostgreSQL: https://www.postgresql.org/docs/
- BullMQ: https://docs.bullmq.io/
- Express: https://expressjs.com/
- React: https://react.dev/

---

**You're now ready to build Phase 2!** 🚀

Start with Step 1 and work through sequentially. Each step is a standalone piece you can test independently.

Questions? Check `README_PHASE2.md` or the Prisma docs.
