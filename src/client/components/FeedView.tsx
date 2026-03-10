import React, { useState, useEffect } from 'react';
import './FeedView.css';

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

export default function FeedView() {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [unlocatedArticles, setUnlocatedArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
    const interval = setInterval(fetchArticles, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/news/feed');
      if (!response.ok) throw new Error('Failed to fetch articles');

      const data = await response.json();
      const withLocation = data.articles || [];
      const without = data.unlocated || [];

      setArticles(withLocation);
      setUnlocatedArticles(without);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading && articles.length === 0) {
    return (
      <div className="feed-view loading">
        <div className="spinner"></div>
        <p>Loading latest news...</p>
      </div>
    );
  }

  return (
    <div className="feed-view">
      {error && <div className="error-banner">{error}</div>}

      <div className="feed-header">
        <h2>Latest News</h2>
        <p className="feed-subtitle">{articles.length} stories with locations · {unlocatedArticles.length} unlocated</p>
      </div>

      <div className="feed-container">
        {/* Located Articles Section */}
        <section className="feed-section">
          <h3 className="section-title">📍 Stories by Location ({articles.length})</h3>
          <div className="articles-list">
            {articles.length === 0 ? (
              <div className="empty-state">No articles with locations yet</div>
            ) : (
              articles.map((article) => (
                <article key={article.id} className="article-card">
                  {article.imageUrl && (
                    <div className="article-image">
                      <img src={article.imageUrl} alt={article.title} />
                    </div>
                  )}
                  <div className="article-content">
                    <div className="article-header">
                      <h3>
                        <a href={article.url} target="_blank" rel="noopener noreferrer">
                          {article.title}
                        </a>
                      </h3>
                      {article.location && (
                        <span className="location-badge">
                          📍 {article.location.name}
                        </span>
                      )}
                    </div>
                    <p className="article-description">{article.description}</p>
                    <div className="article-meta">
                      <span className="source">{article.source}</span>
                      <span className="time">{formatDate(article.publishedAt)}</span>
                      {article.author && <span className="author">by {article.author}</span>}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {/* Unlocated Articles Section */}
        {unlocatedArticles.length > 0 && (
          <section className="feed-section">
            <h3 className="section-title">❓ Unlocated News ({unlocatedArticles.length})</h3>
            <div className="articles-list compact">
              {unlocatedArticles.map((article) => (
                <article key={article.id} className="article-card compact">
                  <div className="article-content">
                    <h4>
                      <a href={article.url} target="_blank" rel="noopener noreferrer">
                        {article.title}
                      </a>
                    </h4>
                    <div className="article-meta">
                      <span className="source">{article.source}</span>
                      <span className="time">{formatDate(article.publishedAt)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
