import React, { useState, useEffect } from 'react';
import '../panels.css';

interface Tweet {
  id: string;
  author: string;
  text: string;
  created_at: string;
  likes: number;
  retweets: number;
  has_media: boolean;
}

interface TwitterPanelProps {
  searchQuery?: string;
}

export default function TwitterPanel({ searchQuery }: TwitterPanelProps) {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (searchQuery) {
      searchTweets();
    } else {
      fetchTweets();
    }
  }, [searchQuery]);

  const fetchTweets = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/twitter/recent?limit=50');
      const data = await response.json();
      setTweets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch tweets:', error);
      setTweets([]);
    } finally {
      setLoading(false);
    }
  };

  const searchTweets = async () => {
    if (!searchQuery) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/twitter/search?q=${encodeURIComponent(searchQuery)}&limit=50`);
      const data = await response.json();
      setTweets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to search tweets:', error);
      setTweets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchTweets();
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

  const openTweet = (tweetId: string, author: string) => {
    window.open(`https://twitter.com/${author}/status/${tweetId}`, '_blank');
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">
          <h2>𝕏 Twitter Feed</h2>
          <p>{tweets.length} tweets loaded</p>
        </div>
        <button
          className={`refresh-btn ${refreshing ? 'spinning' : ''}`}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          🔄
        </button>
      </div>

      <div className="tweets-container">
        {loading ? (
          <div className="empty-state">
            <div className="spinner"></div>
            <p>Loading tweets...</p>
          </div>
        ) : tweets.length === 0 ? (
          <div className="empty-state">
            <p>No tweets found</p>
          </div>
        ) : (
          <div className="tweets-list">
            {tweets.map((tweet) => (
              <div
                key={tweet.id}
                className="tweet-card"
                onClick={() => openTweet(tweet.id, tweet.author)}
              >
                <div style={{ padding: '12px 16px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>@{tweet.author}</span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                      {formatDate(tweet.created_at)}
                    </span>
                  </div>
                  <p>{tweet.text}</p>
                  <div className="tweet-meta">
                    <span className="engagement">❤️ {tweet.likes.toLocaleString()}</span>
                    <span className="engagement">🔄 {tweet.retweets.toLocaleString()}</span>
                    {tweet.has_media && <span className="engagement">🖼️ Media</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
