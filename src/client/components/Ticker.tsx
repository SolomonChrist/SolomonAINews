import React, { useState, useEffect } from 'react';
import './Ticker.css';

interface TickerItem {
  id: string;
  title: string;
  source: string;
  location?: string;
  url: string;
  isBreaking?: boolean;
}

export default function Ticker() {
  const [items, setItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    fetchArticles();
    const interval = setInterval(fetchArticles, 5 * 60 * 1000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/news/feed');
      if (!response.ok) throw new Error('Failed to fetch articles');

      const data = await response.json();
      const articles = data.articles || [];

      const tickerItems: TickerItem[] = articles.slice(0, 30).map((article: any) => ({
        id: article.id,
        title: article.title,
        source: article.source,
        location: article.location?.name,
        url: article.url,
        isBreaking: false,
      }));

      setItems(tickerItems);
    } catch (err) {
      console.error('Error fetching ticker articles:', err);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="ticker-wrapper">
      <div className="ticker-container">
        <div className="ticker-label">
          <span className="ticker-icon">📡</span>
          <span className="ticker-text">LIVE FEED</span>
        </div>

        <div className="ticker-content">
          <div className="ticker-track">
            {/* Double the items for seamless looping */}
            {[...items, ...items].map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className={`ticker-item ${item.isBreaking ? 'breaking' : ''}`}
              >
                <span className="ticker-time">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="ticker-headline">
                  {item.title}
                </a>
                {item.location && <span className="ticker-location ml-1">({item.location})</span>}
                <span className="ticker-divider">•</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ticker-indicator">
          <span className="pulse-dot"></span>
        </div>
      </div>
    </div>
  );
}
