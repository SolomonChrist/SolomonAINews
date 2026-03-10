# 🚀 AI News Dashboard - Quick Start Phase 2

**Skip the docs. Get running in 2 hours.**

---

## What You Have Right Now

✅ Complete database schema (Prisma)
✅ All dependencies configured
✅ Core services (normalizer, deduplicator)
✅ Full documentation
❌ PostgreSQL database (you choose free option)
❌ Redis cache (you choose free option)
❌ Backend/frontend wired together

---

## 🎯 Today's Goal: Get Dashboard Running

**Time: ~2 hours**

### Step 1: Get Free PostgreSQL (15 min)

**Easiest**: Neon (https://neon.tech)
1. Sign up (free forever tier)
2. Create project
3. Copy connection string
4. Add to `.env` as `DATABASE_URL`

Example:
```
DATABASE_URL="postgresql://user:password@ep-xyz.neon.tech/dbname?sslmode=require"
```

### Step 2: Get Free Redis (10 min)

**Easiest**: Upstash (https://upstash.com)
1. Sign up (free tier)
2. Create Redis database
3. Copy connection URL
4. Add to `.env` as `REDIS_URL`

Example:
```
REDIS_URL="redis://:password@host:port"
```

### Step 3: Update .env (5 min)

```bash
# Copy template
cp .env.example .env

# Edit .env and add:
DATABASE_URL=<from Neon>
REDIS_URL=<from Upstash>
NEXTAUTH_SECRET=$(openssl rand -base64 32)  # Generate new secret
NEXTAUTH_URL=http://localhost:3000
```

### Step 4: Initialize Database (10 min)

```bash
npm install

# Create tables in PostgreSQL
npx prisma migrate dev --name init

# Load demo data
npm run seed

# View database (optional)
npm run db:studio
```

### Step 5: Start Servers (5 min)

```bash
npm run dev

# Wait for:
# ✅ Express on http://localhost:5000
# ✅ Vite on http://localhost:5173
# ✅ Database initialized
```

**Open http://localhost:5173 in browser** ✅

---

## 📋 What's Working Now

✅ Dashboard loads
✅ Database connected
✅ Demo data visible
✅ TypeScript compiles

---

## 🔨 What You Need to Build Next

These are the **minimal critical pieces** for Phase 2:

### 1. Connect Dashboard to Database (30 min)
File: `src/client/pages/Dashboard.tsx`

```typescript
export function Dashboard() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch('/api/feeds')
      .then(r => r.json())
      .then(setItems);
  }, []);

  return (
    <div className="space-y-4">
      {items.map(item => (
        <article key={item.id}>
          <h2>{item.title}</h2>
          <p>{item.description}</p>
          <a href={item.url}>Read →</a>
        </article>
      ))}
    </div>
  );
}
```

### 2. Create Feed Endpoint (20 min)
File: `src/routes/feeds.ts`

```typescript
router.get('/', async (req, res) => {
  const feeds = await prisma.feedItem.findMany({
    where: { source: { isActive: true } },
    orderBy: { publishedAt: 'desc' },
    take: 50,
  });
  res.json(feeds);
});
```

### 3. Create Sources Endpoint (20 min)
File: `src/routes/sources.ts`

```typescript
router.get('/', async (req, res) => {
  const sources = await prisma.source.findMany({
    where: { isActive: true },
  });
  res.json(sources);
});

router.post('/', async (req, res) => {
  const source = await prisma.source.create({
    data: req.body,
  });
  res.json(source);
});
```

### 4. Connect Routes to Server (10 min)
File: `src/server.ts`

```typescript
import feedsRouter from './routes/feeds.js';
import sourcesRouter from './routes/sources.js';

app.use('/api/feeds', feedsRouter);
app.use('/api/sources', sourcesRouter);
```

**Total: 1.5 hours for these 4 pieces = working dashboard**

---

## ⏭️ After That (Not Today)

Once dashboard works:
1. Add RSS adapter
2. Add polling scheduler
3. Add real-time ticker
4. Add admin panel
5. Add search/filters
6. Add map view
7. Add enrichment pipeline

Each takes 2-4 hours.

---

## 🐛 If Something Breaks

**Database won't connect**
```bash
# Check .env DATABASE_URL
# Try connecting with:
psql $DATABASE_URL
# Should show psql prompt
```

**Redis won't connect**
```bash
# Check .env REDIS_URL
# Try:
redis-cli ping
# Should respond PONG
```

**npm install fails**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Prisma migration errors**
```bash
npx prisma migrate reset
npm run seed
```

---

## ✨ Success = This Works

```bash
npm run dev
# ✅ Server starts
# ✅ Database connects
# ✅ http://localhost:5173 loads
# ✅ No errors in console
# ✅ Can see feed items
```

---

## 📚 Key Files to Know

```
prisma/schema.prisma         ← Your data model
src/routes/                  ← API endpoints
src/client/pages/            ← React pages
.env                         ← Your secrets
package.json                 ← Dependencies
```

---

## 🎯 Minimal Viable Dashboard (MVD)

To call Phase 2 "done", you need:

1. ✅ PostgreSQL database running
2. ✅ Dashboard page rendering
3. ✅ /api/feeds endpoint returning articles
4. ✅ /api/sources endpoint for management
5. ✅ 1 working source (RSS or API)
6. ✅ Demo data visible on dashboard

**Everything else is refinement.**

---

## 💡 Pro Tips

- Use `npm run db:studio` to browse data visually
- Don't worry about authentication yet (Phase 3)
- Don't worry about enrichment yet (Phase 4)
- Just get articles flowing: Source → Database → UI
- Test each step independently

---

## 🚀 You're Ready!

```bash
# Today's commands:
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev

# Tomorrow's commands:
# Build those 4 files above
# Test each API endpoint with curl
# Wire dashboard to /api/feeds
```

**Questions? Check PHASE1_TO_PHASE2_GUIDE.md**

**In 2 hours you'll have a working dashboard. In 2 days you'll have a product.**

Let's go! 🚀
