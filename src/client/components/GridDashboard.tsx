import React, { useState, useEffect } from 'react';
import './GridDashboard.css';
import SourceManager from './SourceManager';
import InteractiveMap from './InteractiveMap';
import Ticker from './Ticker';
import VideoPanel from './panels/VideoPanel';

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

interface DashboardConfig {
  modules: ModuleConfig[];
  theme: 'dark' | 'light';
}

interface ModuleConfig {
  id: string;
  type: 'map' | 'feed' | 'videos' | 'stats';
  size: 'small' | 'medium' | 'large';
  position: number;
}

const DEFAULT_CONFIG: DashboardConfig = {
  modules: [
    { id: 'map', type: 'map', size: 'medium', position: 0 },     // Top left
    { id: 'videos', type: 'videos', size: 'small', position: 1 },  // Top right
    { id: 'feed', type: 'feed', size: 'large', position: 2 },      // Bottom left (wide)
    { id: 'stats', type: 'stats', size: 'small', position: 3 },    // Bottom right
  ],
  theme: 'dark',
};

export default function GridDashboard() {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<DashboardConfig>(DEFAULT_CONFIG);
  const [showConfig, setShowConfig] = useState(false);
  const [configTab, setConfigTab] = useState<'modules' | 'sources'>('modules');
  const [videoRefreshKey, setVideoRefreshKey] = useState(0);

  useEffect(() => {
    loadConfig();
    fetchArticles();
    const interval = setInterval(fetchArticles, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleGlobalRefresh = async () => {
    setVideoRefreshKey(k => k + 1);
    await fetchArticles();
  };


  const loadConfig = () => {
    try {
      const saved = localStorage.getItem('dashboardConfig');
      if (saved) {
        setConfig(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Error loading config:', err);
    }
  };

  const saveConfig = () => {
    try {
      localStorage.setItem('dashboardConfig', JSON.stringify(config));
      alert('Dashboard configuration saved! You can download it below.');
    } catch (err) {
      console.error('Error saving config:', err);
    }
  };

  const downloadConfig = () => {
    try {
      const dataStr = JSON.stringify(config, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-config-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading config:', err);
    }
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/news/feed');
      if (!response.ok) throw new Error('Failed to fetch articles');

      const data = await response.json();
      setArticles(data.articles || []);
    } catch (err) {
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

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return date.toLocaleDateString();
  };

  const toggleModule = (type: string) => {
    const exists = config.modules.find((m) => m.type === type);
    if (exists) {
      setConfig({
        ...config,
        modules: config.modules.filter((m) => m.type !== type),
      });
    } else {
      setConfig({
        ...config,
        modules: [
          ...config.modules,
          { id: type, type: type as any, size: 'medium', position: config.modules.length },
        ],
      });
    }
  };

  const renderedModules = config.modules.sort((a, b) => a.position - b.position);

  return (
    <div className="grid-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>🌍 AI News Monitor</h1>
          <p>Real-time global intelligence dashboard</p>
        </div>
        <div className="header-right">
          <button className="config-btn" onClick={handleGlobalRefresh} title="Manual Refresh All Feeds">
            🔄 Refresh
          </button>
          <button className="config-btn" onClick={() => setShowConfig(!showConfig)}>
            ⚙️ Configure
          </button>
        </div>
      </div>

      {showConfig && (
        <div className="config-panel">
          <div className="config-content">
            <div className="config-tabs">
              <button
                className={`config-tab ${configTab === 'modules' ? 'active' : ''}`}
                onClick={() => setConfigTab('modules')}
              >
                Modules
              </button>
              <button
                className={`config-tab ${configTab === 'sources' ? 'active' : ''}`}
                onClick={() => setConfigTab('sources')}
              >
                Sources
              </button>
            </div>

            {configTab === 'modules' && (
              <>
                <h2>Dashboard Modules</h2>
                <div className="config-modules">
                  <label>
                    <input
                      type="checkbox"
                      checked={config.modules.some((m) => m.type === 'map')}
                      onChange={() => toggleModule('map')}
                    />
                    Map
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={config.modules.some((m) => m.type === 'feed')}
                      onChange={() => toggleModule('feed')}
                    />
                    News Feed
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={config.modules.some((m) => m.type === 'videos')}
                      onChange={() => toggleModule('videos')}
                    />
                    Videos
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={config.modules.some((m) => m.type === 'stats')}
                      onChange={() => toggleModule('stats')}
                    />
                    Statistics
                  </label>
                </div>
                <div className="config-actions">
                  <button className="btn-primary" onClick={saveConfig}>
                    Save Configuration
                  </button>
                  <button className="btn-secondary" onClick={downloadConfig}>
                    Download JSON
                  </button>
                  <button className="btn-secondary" onClick={() => setShowConfig(false)}>
                    Done
                  </button>
                </div>
              </>
            )}

            {configTab === 'sources' && (
              <>
                <SourceManager 
                  onClose={() => setShowConfig(false)} 
                  onSourcesChanged={() => setVideoRefreshKey(k => k + 1)}
                />
                <div className="config-actions">
                  <button className="btn-secondary" onClick={() => setShowConfig(false)}>
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="dashboard-main">
        <div className="left-column">
          <div className="module map-module">
            <InteractiveMap
              articles={articles}
              selectedArticle={selectedArticle}
              onArticleSelect={setSelectedArticle}
            />
          </div>
        </div>

        <div className="right-column">
          <div className="module video-module">
            <div className="module-title">📹 Live News Videos</div>
            <VideoPanel key={`video-panel-${videoRefreshKey}`} />
          </div>

          <div className="module feed-module">
            <div className="module-title">🗞️ Latest News ({articles.length})</div>
            <div className="feed-list">
              {articles.slice(0, 80).map((article) => (
                <div
                  key={article.id}
                  className={`feed-item ${selectedArticle?.id === article.id ? 'selected' : ''}`}
                  onClick={() => setSelectedArticle(article)}
                >
                  <div className="feed-location">📍 {article.location?.name || 'Global'}</div>
                  <h4>{article.title}</h4>
                  <p className="feed-snippet">{article.description?.slice(0, 80)}...</p>
                  <div className="feed-meta">
                    <span className="source">{article.source}</span>
                    <span className="time">{formatDate(article.publishedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-bottom">
        <Ticker />
        <div className="stats-bar">
          <div className="stat-item">
            <span className="label">Stories:</span>
            <span className="value">{articles.length}</span>
          </div>
          <div className="stat-item">
            <span className="label">Locations:</span>
            <span className="value">{new Set(articles.map((a) => a.location?.name)).size}</span>
          </div>
          <div className="stat-item">
            <span className="label">Sources:</span>
            <span className="value">{new Set(articles.map((a) => a.source)).size}</span>
          </div>
          <div className="stat-item">
            <span className="label">Last Refresh:</span>
            <span className="value">{formatDate(new Date().toISOString())}</span>
          </div>
          <div className="stat-item">
            <span className="label">Refreshed:</span>
            <span className="value">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {selectedArticle && (
        <div className="article-detail-modal">
          <div className="modal-content">
            <div className="modal-close" onClick={() => setSelectedArticle(null)}>
              ✕
            </div>
            <div className="modal-header">
              <div className="modal-location">📍 {selectedArticle.location?.name}</div>
              <h2>{selectedArticle.title}</h2>
            </div>
            <p className="modal-description">{selectedArticle.description}</p>
            <div className="modal-meta">
              <span>📰 {selectedArticle.source}</span>
              <span>⏰ {formatDate(selectedArticle.publishedAt)}</span>
              {selectedArticle.author && <span>✍️ {selectedArticle.author}</span>}
            </div>
            <a href={selectedArticle.url} target="_blank" rel="noopener noreferrer" className="modal-link">
              Read Full Article →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
