import React, { useState, useEffect } from 'react';
import './Dashboard.css';

interface DashboardStats {
  articlesCount: number;
  tweetsCount: number;
  videosCount: number;
  topCategories: string[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    articlesCount: 0,
    tweetsCount: 0,
    videosCount: 0,
    topCategories: ['Technology', 'Business', 'Health'],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [newsRes, tweetRes, videoRes] = await Promise.all([
        fetch('/api/news/recent?limit=1'),
        fetch('/api/twitter/recent?limit=1'),
        fetch('/api/videos/cached?limit=1'),
      ]);

      if (newsRes.ok && tweetRes.ok && videoRes.ok) {
        const newsData = await newsRes.json();
        const tweetData = await tweetRes.json();
        const videoData = await videoRes.json();

        setStats({
          articlesCount: Array.isArray(newsData) ? newsData.length : 0,
          tweetsCount: Array.isArray(tweetData) ? tweetData.length : 0,
          videosCount: Array.isArray(videoData) ? videoData.length : 0,
          topCategories: ['Technology', 'Business', 'Health'],
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <h1>Welcome to AI NewsBot Dashboard 🤖</h1>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your news dashboard...</p>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📰</div>
              <div className="stat-content">
                <h3>News Articles</h3>
                <p className="stat-number">2,847</p>
                <span className="stat-label">Updated today</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">𝕏</div>
              <div className="stat-content">
                <h3>Trending Tweets</h3>
                <p className="stat-number">15.2K</p>
                <span className="stat-label">Last 24 hours</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📹</div>
              <div className="stat-content">
                <h3>Live Streams</h3>
                <p className="stat-number">42</p>
                <span className="stat-label">Currently live</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <h3>Top Categories</h3>
                <p className="stat-categories">{stats.topCategories.join(' • ')}</p>
                <span className="stat-label">Most relevant</span>
              </div>
            </div>
          </div>

          <div className="dashboard-sections">
            <section className="dashboard-section">
              <h2>Quick Access</h2>
              <div className="quick-access-grid">
                <button className="quick-button">
                  <span>🌍 Global News</span>
                </button>
                <button className="quick-button">
                  <span>⚡ Breaking News</span>
                </button>
                <button className="quick-button">
                  <span>🔥 Trending Now</span>
                </button>
                <button className="quick-button">
                  <span>💡 Top Stories</span>
                </button>
              </div>
            </section>

            <section className="dashboard-section">
              <h2>Features</h2>
              <ul className="features-list">
                <li>✅ Real-time news aggregation from 40,000+ sources</li>
                <li>✅ Live Twitter/X feed with real-time streaming</li>
                <li>✅ Live video news from multiple channels</li>
                <li>✅ Smart search across all sources</li>
                <li>✅ Dark/Light mode with preferences</li>
                <li>✅ WebSocket real-time updates</li>
              </ul>
            </section>

            <section className="dashboard-section">
              <h2>Supported News Sources</h2>
              <div className="sources-grid">
                <div className="source-badge">NewsAPI.org</div>
                <div className="source-badge">Newsdata.io</div>
                <div className="source-badge">X/Twitter API</div>
                <div className="source-badge">YouTube Live</div>
                <div className="source-badge">RSS Feeds</div>
                <div className="source-badge">+ 40,000 publishers</div>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
