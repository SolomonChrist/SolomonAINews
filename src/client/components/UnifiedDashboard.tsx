import React, { useState, useEffect } from 'react';
import './UnifiedDashboard.css';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
  author?: string;
  location?: {
    name: string;
    lat: number;
    lng: number;
    source: 'content' | 'company' | 'fallback';
  };
}

export default function UnifiedDashboard() {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [unlocatedArticles, setUnlocatedArticles] = useState<NewsItem[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(3);
  const [center, setCenter] = useState({ lat: 20, lng: 0 });

  useEffect(() => {
    fetchArticles();
    const interval = setInterval(fetchArticles, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (articles.length > 0 && canvasRef.current) {
      drawMap();
    }
  }, [articles, zoom, center, selectedArticle]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/news/feed');
      if (!response.ok) throw new Error('Failed to fetch articles');

      const data = await response.json();
      setArticles(data.articles || []);
      setUnlocatedArticles(data.unlocated || []);
    } catch (err) {
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const drawMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Dark background
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = '#1a2a4a';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo((i * width) / 10, 0);
      ctx.lineTo((i * width) / 10, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, (i * height) / 10);
      ctx.lineTo(width, (i * height) / 10);
      ctx.stroke();
    }

    const project = (lat: number, lng: number) => {
      const x = ((lng - (center.lng - 180 / Math.pow(2, zoom))) / (360 / Math.pow(2, zoom))) * width;
      const y = ((center.lat + 85 - lat) / 170) * height;
      return { x, y };
    };

    // Draw markers
    articles.forEach((article) => {
      if (article.location) {
        const { x, y } = project(article.location.lat, article.location.lng);

        if (x >= 0 && x <= width && y >= 0 && y <= height) {
          const isSelected = selectedArticle?.id === article.id;
          const radius = isSelected ? 8 : 5;

          // Marker with glow effect
          ctx.shadowColor = '#0066ff';
          ctx.shadowBlur = 10;
          ctx.fillStyle = isSelected ? '#ff4444' : '#0066ff';
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.shadowColor = 'transparent';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.stroke();

          // Label for selected
          if (isSelected) {
            ctx.fillStyle = '#66b3ff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(article.location.name, x, y - 18);
          }
        }
      }
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = canvas.width;
    const height = canvas.height;

    const project = (lat: number, lng: number) => {
      const px = ((lng - (center.lng - 180 / Math.pow(2, zoom))) / (360 / Math.pow(2, zoom))) * width;
      const py = ((center.lat + 85 - lat) / 170) * height;
      return { x: px, y: py };
    };

    for (const article of articles) {
      if (article.location) {
        const { x: mx, y: my } = project(article.location.lat, article.location.lng);
        const distance = Math.sqrt((x - mx) ** 2 + (y - my) ** 2);
        if (distance < 10) {
          setSelectedArticle(article);
          return;
        }
      }
    }
    setSelectedArticle(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  return (
    <div className="unified-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>🌍 AI News Monitor</h1>
          <p className="subtitle">Real-time global intelligence dashboard</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-label">Stories</span>
            <span className="stat-value">{articles.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Locations</span>
            <span className="stat-value">{new Set(articles.map((a) => a.location?.name)).size}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Sources</span>
            <span className="stat-value">{new Set(articles.map((a) => a.source)).size}</span>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="dashboard-content">
        {/* Map section */}
        <div className="map-section">
          <div className="section-title">Global Map</div>
          <div className="map-wrapper">
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              onClick={handleCanvasClick}
              className="map-canvas"
            />
            <div className="map-controls">
              <button onClick={() => setZoom(Math.min(10, zoom + 1))} title="Zoom in">
                +
              </button>
              <div className="zoom-level">{zoom}</div>
              <button onClick={() => setZoom(Math.max(1, zoom - 1))} title="Zoom out">
                −
              </button>
            </div>
          </div>
        </div>

        {/* Feed section */}
        <div className="feed-section">
          <div className="section-title">📰 Latest Articles</div>
          <div className="articles-container">
            {loading && articles.length === 0 ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>Loading articles...</p>
              </div>
            ) : (
              <>
                {articles.length === 0 ? (
                  <div className="empty">No articles with locations</div>
                ) : (
                  articles.slice(0, 8).map((article) => (
                    <div
                      key={article.id}
                      className={`article-item ${selectedArticle?.id === article.id ? 'selected' : ''}`}
                      onClick={() => setSelectedArticle(article)}
                    >
                      <div className="article-location">📍 {article.location?.name}</div>
                      <h4>{article.title}</h4>
                      <p>{article.description}</p>
                      <div className="article-footer">
                        <span className="source">{article.source}</span>
                        <span className="time">{formatDate(article.publishedAt)}</span>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Selected article detail */}
      {selectedArticle && (
        <div className="article-detail">
          <div className="detail-close" onClick={() => setSelectedArticle(null)}>
            ✕
          </div>
          <div className="detail-location">📍 {selectedArticle.location?.name}</div>
          <h2>{selectedArticle.title}</h2>
          <p className="detail-description">{selectedArticle.description}</p>
          <div className="detail-meta">
            <span className="source">Source: {selectedArticle.source}</span>
            <span className="time">Published: {formatDate(selectedArticle.publishedAt)}</span>
            {selectedArticle.author && <span className="author">by {selectedArticle.author}</span>}
          </div>
          <a href={selectedArticle.url} target="_blank" rel="noopener noreferrer" className="read-more">
            Read Full Story →
          </a>
        </div>
      )}

      {/* Bottom ticker */}
      <div className="ticker-bar">
        <div className="ticker-label">🔴 LIVE</div>
        <div className="ticker-scroll">
          {articles.slice(0, 5).map((article, idx) => (
            <div key={article.id} className="ticker-item">
              {article.title}
              <span className="ticker-location">{article.location?.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
