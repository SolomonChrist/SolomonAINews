import React, { useState, useEffect } from 'react';
import '../panels.css';

interface Article {
  id: string;
  title: string;
  description?: string;
  source: string;
  url: string;
  image_url?: string;
  published_at: string;
  category?: string;
}

interface NewsPanelProps {
  searchQuery?: string;
}

export default function NewsPanel({ searchQuery }: NewsPanelProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [refreshing, setRefreshing] = useState(false);

  const categories = [
    { id: 'general', label: 'General' },
    { id: 'business', label: 'Business' },
    { id: 'technology', label: 'Technology' },
    { id: 'health', label: 'Health' },
    { id: 'science', label: 'Science' },
    { id: 'entertainment', label: 'Entertainment' },
  ];

  useEffect(() => {
    if (searchQuery) {
      searchArticles();
    } else {
      fetchArticles();
    }
  }, [searchQuery, selectedCategory]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const endpoint = selectedCategory
        ? `/api/news/category/${selectedCategory}`
        : '/api/news/recent';

      const response = await fetch(endpoint);
      const data = await response.json();
      setArticles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const searchArticles = async () => {
    if (!searchQuery) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/news/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setArticles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to search articles:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(`/api/news/refresh/${selectedCategory}`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.articles) {
        setArticles(data.articles);
      }
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">
          <h2>📰 News Feed</h2>
          <p>{articles.length} articles loaded</p>
        </div>
        <button
          className={`refresh-btn ${refreshing ? 'spinning' : ''}`}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          🔄
        </button>
      </div>

      {!searchQuery && (
        <div className="category-filter">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      <div className="articles-container">
        {loading ? (
          <div className="empty-state">
            <div className="spinner"></div>
            <p>Loading articles...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="empty-state">
            <p>No articles found</p>
          </div>
        ) : (
          <div className="articles-list">
            {articles.map((article) => (
              <a key={article.id} href={article.url} target="_blank" rel="noopener noreferrer" className="article-card">
                {article.image_url && <img src={article.image_url} alt={article.title} className="article-image" />}
                <div className="article-content">
                  <h3>{article.title}</h3>
                  {article.description && <p>{article.description}</p>}
                  <div className="article-meta">
                    <span className="source">📌 {article.source}</span>
                    <span className="time">⏰ {formatDate(article.published_at)}</span>
                    {article.category && <span className="category">{article.category}</span>}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
