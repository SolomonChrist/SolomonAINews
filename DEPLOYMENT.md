# AI NewsBot Dashboard - Deployment Guide 🚀

## Quick Deployment Summary

Choose your platform and follow the corresponding guide:

- **[Heroku](#heroku-deployment)** - Easiest (free tier available)
- **[AWS EC2](#aws-ec2-deployment)** - Most flexible
- **[Docker](#docker-deployment)** - Best for scalability
- **[Railway](#railway-deployment)** - Modern platform
- **[Self-hosted](#self-hosted-deployment)** - Maximum control

---

## Heroku Deployment

### Step 1: Create Heroku Account
- Go to https://www.heroku.com
- Sign up (free account)
- Download Heroku CLI

### Step 2: Prepare for Deployment
```bash
# Login to Heroku
heroku login

# Create app
heroku create your-newsbot-app

# Set environment variables
heroku config:set NEWSAPI_KEY=your_key
heroku config:set NEWSDATA_KEY=your_key
heroku config:set X_BEARER_TOKEN=your_token
```

### Step 3: Deploy
```bash
# Push to Heroku
git push heroku main

# View logs
heroku logs --tail

# Open app
heroku open
```

### Step 4: Monitor
```bash
# Check app status
heroku ps

# View database
heroku run npm run server

# Scale dynos (if needed)
heroku ps:scale web=2
```

**Cost:** Free tier available (limited), paid plans start ~$7/month

---

## AWS EC2 Deployment

### Step 1: Launch EC2 Instance
1. Go to AWS Console → EC2
2. Click "Launch Instance"
3. Select: **Ubuntu 20.04 LTS** (free tier eligible)
4. Instance type: **t2.micro** (free tier)
5. Security Group: Allow ports 80, 443, 22, 5000
6. Download key pair (save as `newsbot.pem`)

### Step 2: Connect to Instance
```bash
# Make key readable
chmod 400 newsbot.pem

# SSH into instance
ssh -i newsbot.pem ubuntu@<your-ec2-ip>
```

### Step 3: Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Git
sudo apt install -y git

# Install SQLite
sudo apt install -y sqlite3
```

### Step 4: Clone & Setup
```bash
# Clone repository
git clone https://github.com/your-user/ai-newsbot.git
cd ai-newsbot

# Install dependencies
npm install

# Create .env file
nano .env
# (Add your API keys)

# Build frontend
npm run build

# Start server
npm run start
```

### Step 5: Keep Running (PM2)
```bash
# Install PM2 globally
sudo npm install -g pm2

# Start app with PM2
pm2 start "npm run start" --name "newsbot"

# Save startup
pm2 startup
pm2 save

# View logs
pm2 logs newsbot
```

### Step 6: Setup Nginx Reverse Proxy
```bash
# Install Nginx
sudo apt install -y nginx

# Edit config
sudo nano /etc/nginx/sites-available/default
```

Replace content with:
```nginx
server {
    listen 80 default_server;
    server_name _;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /ws {
        proxy_pass ws://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Restart Nginx:
```bash
sudo systemctl restart nginx
```

### Step 7: Setup SSL (Optional but Recommended)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

**Cost:** Free tier (1 year), then ~$3-5/month

---

## Docker Deployment

### Step 1: Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

ENV NODE_ENV=production

CMD ["npm", "run", "start"]
```

### Step 2: Create .dockerignore
```
node_modules
dist
data
.env
.env.local
.git
.gitignore
npm-debug.log
README.md
```

### Step 3: Build & Run Locally
```bash
# Build image
docker build -t newsbot:latest .

# Run container
docker run -p 5000:5000 \
  -e NEWSAPI_KEY=your_key \
  -e NEWSDATA_KEY=your_key \
  -v newsbot-data:/app/data \
  newsbot:latest
```

### Step 4: Docker Compose (Recommended)
Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  newsbot:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - NEWSAPI_KEY=${NEWSAPI_KEY}
      - NEWSDATA_KEY=${NEWSDATA_KEY}
      - X_BEARER_TOKEN=${X_BEARER_TOKEN}
      - YOUTUBE_API_KEY=${YOUTUBE_API_KEY}
      - PORT=5000
    volumes:
      - newsbot-data:/app/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - newsbot

volumes:
  newsbot-data:
```

Start with Docker Compose:
```bash
docker-compose up -d
```

**Cost:** Depends on hosting (Docker Hub, AWS ECS, DigitalOcean, etc.)

---

## Railway Deployment

### Step 1: Connect Repository
- Go to https://railway.app
- Click "Create Project"
- Select "Deploy from GitHub"
- Authorize & select repository

### Step 2: Add Environment Variables
- Click "Variables"
- Add:
  - `NEWSAPI_KEY=your_key`
  - `NEWSDATA_KEY=your_key`
  - `X_BEARER_TOKEN=your_token`
  - `NODE_ENV=production`

### Step 3: Deploy
- Railway auto-deploys on push to main
- View logs in dashboard
- Custom domain under "Settings"

**Cost:** $5 monthly credit + pay-as-you-go (~$0.5-5/month typical usage)

---

## Self-Hosted Deployment

### Requirements
- Your own server/VPS
- Static IP address
- Domain name (optional)
- Basic Linux knowledge

### Setup Steps
```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install dependencies
sudo apt install -y nodejs npm git nginx sqlite3

# 3. Clone repo
git clone https://github.com/your-user/ai-newsbot.git
cd ai-newsbot

# 4. Install & build
npm install
npm run build

# 5. Setup PM2 for persistence
sudo npm install -g pm2
pm2 start "npm run start" --name "newsbot"
pm2 startup
pm2 save

# 6. Setup Nginx
sudo cp nginx.conf /etc/nginx/sites-available/newsbot
sudo ln -s /etc/nginx/sites-available/newsbot /etc/nginx/sites-enabled/
sudo systemctl restart nginx

# 7. Enable firewall (optional)
sudo ufw allow 22,80,443/tcp
sudo ufw enable
```

### Nginx Configuration
Save as `nginx.conf`:
```nginx
upstream newsbot {
    server 127.0.0.1:5000;
}

server {
    listen 80;
    server_name newsbot.yourdomain.com;

    location / {
        proxy_pass http://newsbot;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /ws {
        proxy_pass ws://newsbot;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

**Cost:** Server cost only (~$3-20/month for VPS)

---

## Performance Tuning

### Node.js
```bash
# Increase heap size
export NODE_OPTIONS="--max-old-space-size=2048"

# Use cluster mode (multiple cores)
NODE_ENV=production pm2 start "npm run start" -i max
```

### Database
```bash
# Rebuild database indexes
sqlite3 data/newsbot.db
ANALYZE;
VACUUM;
```

### Nginx
```nginx
# Add caching
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=newsbot:10m;

location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 30d;
    proxy_cache newsbot;
}
```

---

## Monitoring & Logging

### PM2 Monitoring
```bash
pm2 monit              # Real-time monitoring
pm2 logs              # View logs
pm2 save              # Save configuration
pm2 resurrect         # Restore on reboot
```

### Systemd Service
Create `/etc/systemd/system/newsbot.service`:
```ini
[Unit]
Description=AI NewsBot Dashboard
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/ai-newsbot
ExecStart=/usr/bin/npm run start
Restart=always
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
```

Enable it:
```bash
sudo systemctl enable newsbot
sudo systemctl start newsbot
sudo systemctl status newsbot
```

### Log Rotation
```bash
# Use logrotate for log files
sudo nano /etc/logrotate.d/newsbot
```

Add:
```
/var/log/newsbot/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 newsbot newsbot
    sharedscripts
}
```

---

## Backup Strategy

### Database Backups
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
cp data/newsbot.db "backups/newsbot_$DATE.db"

# Keep only last 30 days
find backups/ -type f -mtime +30 -delete
```

Schedule with cron:
```bash
crontab -e
# Add: 0 2 * * * /home/ubuntu/ai-newsbot/backup.sh
```

### Full Backup
```bash
# Backup everything
tar -czf newsbot_backup_$(date +%Y%m%d).tar.gz \
  --exclude node_modules \
  --exclude dist \
  --exclude .git \
  .
```

---

## Scaling Strategy

### Single Server
- Works for ~1,000 concurrent users
- SQLite adequate for 1M+ articles
- Cost: ~$5-10/month

### Multi-Server (Future)
```
┌─────────────────┐
│  Load Balancer  │
│   (Nginx)       │
└────────┬────────┘
         │
    ┌────┼────┐
    │    │    │
┌───▼─┐┌──▼──┐┌──▼──┐
│App1 ││App2 ││App3 │ (Node processes)
└──┬──┘└──┬──┘└──┬──┘
   │      │      │
   └──────┴──────┘
        │
    ┌───▼────┐
    │Database│ (PostgreSQL)
    └────────┘
```

Upgrade path:
1. **Phase 1**: Single Express server + SQLite
2. **Phase 2**: Multiple workers + Redis cache
3. **Phase 3**: PostgreSQL + separate API servers
4. **Phase 4**: Kubernetes cluster

---

## Troubleshooting

### App won't start
```bash
# Check logs
pm2 logs newsbot

# Check port in use
sudo lsof -i :5000

# Check environment variables
pm2 env

# Rebuild dependencies
rm -rf node_modules && npm install
```

### Database errors
```bash
# Check database size
du -h data/newsbot.db

# Repair database
sqlite3 data/newsbot.db "PRAGMA integrity_check;"

# Reset if corrupted
mv data/newsbot.db data/newsbot.db.backup
npm run server  # Recreates fresh
```

### Memory leaks
```bash
# Monitor memory
watch -n 1 'ps aux | grep node'

# Enable profiling
node --prof src/server.ts

# Generate report
node --prof-process isolate-*.log > report.txt
```

---

## Security Checklist

- [ ] `.env` file not committed to git
- [ ] API keys rotated regularly
- [ ] HTTPS enabled (Certbot)
- [ ] Firewall configured (ufw)
- [ ] SSH key-based auth only
- [ ] Regular backups tested
- [ ] Dependencies up-to-date (`npm audit`)
- [ ] CORS properly configured
- [ ] Rate limiting on API endpoints
- [ ] Database backups off-site

---

## Cost Comparison

| Platform | Free | Cheap | Notes |
|----------|------|-------|-------|
| Heroku | ✅ (limited) | $7/mo | Easiest to deploy |
| AWS EC2 | ✅ 1yr | $3-5/mo | Most control |
| Railway | ❌ | $5/mo | Modern + simple |
| DigitalOcean | ✅ | $5/mo | VPS reliable |
| Self-hosted | ❌ | $3/mo | Max control |
| Docker Hub | ✅ | Free | Container registry |

---

## Next Steps

1. Choose deployment platform
2. Follow platform-specific guide above
3. Set up environment variables
4. Deploy and test
5. Configure monitoring
6. Set up backups
7. Monitor API usage

**Estimated deployment time: 30 minutes to 1 hour**

For support, check logs and refer to platform documentation.

Happy deploying! 🚀
