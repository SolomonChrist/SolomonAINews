import React, { useState, useEffect } from 'react';
import './SourceManager.css';

interface NewsSource {
  id: string;
  name: string;
  type: 'rss' | 'hackernews' | 'github' | 'video';
  url: string;
  enabled: boolean;
  category: string;
  pollInterval: number;
}

interface SourceManagerProps {
  onClose?: () => void;
  onSourcesChanged?: () => void;
}

export default function SourceManager({ onClose, onSourcesChanged }: SourceManagerProps) {
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'rss' as 'rss' | 'hackernews' | 'github' | 'video',
    url: '',
    category: 'tech',
  });
  const [discoveryResults, setDiscoveryResults] = useState<any[]>([]);
  const [loadingDiscovery, setLoadingDiscovery] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    try {
      const response = await fetch('/api/sources');
      if (!response.ok) throw new Error('Failed to load sources');
      const data = await response.json();
      setSources(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load sources');
      setLoading(false);
    }
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.url) {
      setError('Name and URL are required');
      return;
    }

    try {
      const url = editingSourceId ? `/api/sources/${editingSourceId}` : '/api/sources';
      const method = editingSourceId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${editingSourceId ? 'update' : 'add'} source`);
      }

      setSuccess(`Source "${formData.name}" ${editingSourceId ? 'updated' : 'added'} successfully!`);
      setFormData({ name: '', type: 'rss', url: '', category: 'tech' });
      setShowAddForm(false);
      setEditingSourceId(null);
      await loadSources();
      onSourcesChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${editingSourceId ? 'update' : 'add'} source`);
    }
  };

  const startEditing = (source: NewsSource) => {
    setFormData({
      name: source.name,
      type: source.type,
      url: source.url,
      category: source.category,
    });
    setEditingSourceId(source.id);
    setShowAddForm(true);
    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleSource = async (sourceId: string) => {
    try {
      const response = await fetch(`/api/sources/${sourceId}/toggle`, {
        method: 'PATCH',
      });

      if (!response.ok) throw new Error('Failed to toggle source');

      await loadSources();
      setSuccess('Source toggled!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to toggle source');
    }
  };

  const handleDeleteSource = async (sourceId: string, sourceName: string) => {
    if (deletingId !== sourceId) {
      setDeletingId(sourceId);
      return;
    }

    try {
      const response = await fetch(`/api/sources/${sourceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete source');
      }

      setSuccess(`Source "${sourceName}" deleted`);
      setDeletingId(null);
      await loadSources();
      onSourcesChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete source');
    }
  };

  if (loading) {
    return <div className="source-manager">Loading sources...</div>;
  }

  return (
    <div className="source-manager">
      <div className="source-manager-header">
        <h3>📰 News Sources</h3>
        <button className="btn-add-source" onClick={() => {
          if (showAddForm) {
            setShowAddForm(false);
            setEditingSourceId(null);
            setFormData({ name: '', type: 'rss', url: '', category: 'tech' });
          } else {
            setShowAddForm(true);
          }
        }}>
          {showAddForm ? 'Cancel' : '+ Add Source'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showAddForm && (
        <form className="add-source-form" onSubmit={handleAddSource}>
          <div className="discovery-header">
            <h4>{editingSourceId ? `✏️ Editing: ${formData.name}` : (formData.type === 'video' ? '📺 Add Live Discovery' : 'Manual Entry')}</h4>
            {formData.type === 'video' && (
              <button
                type="button"
                className="btn-discover"
                onClick={async () => {
                  setError('');
                  setLoadingDiscovery(true);
                  try {
                    const res = await fetch('/api/videos/youtube/live?q=ai+news+live&limit=5');
                    const data = await res.json();
                    setDiscoveryResults(data);
                  } catch (err) {
                    setError('Failed to search YouTube');
                  } finally {
                    setLoadingDiscovery(false);
                  }
                }}
              >
                🔍 Search YouTube Live
              </button>
            )}
          </div>

          {discoveryResults.length > 0 && formData.type === 'video' && (
            <div className="discovery-results">
              {discoveryResults.map((res: any) => (
                <div key={res.id} className="discovery-item">
                  <div className="discovery-info">
                    <div className="discovery-name">{res.channel}</div>
                    <div className="discovery-title">{res.title}</div>
                  </div>
                  <button
                    type="button"
                    className="btn-add-quick"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        name: res.channel,
                        url: res.url,
                      });
                      setDiscoveryResults([]);
                    }}
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="form-group">
            <label>Source Name *</label>
            <input
              type="text"
              placeholder="e.g., Tech News Daily"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any, url: '' })}
              >
                <option value="rss">RSS Feed</option>
                <option value="hackernews">Hacker News</option>
                <option value="github">GitHub Trending</option>
                <option value="video">YouTube Live / Video</option>
              </select>
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="tech">Tech</option>
                <option value="news">News</option>
                <option value="research">Research</option>
                <option value="company">Company</option>
                <option value="community">Community</option>
                <option value="launches">Launches</option>
                <option value="articles">Articles</option>
                <option value="opensource">Open Source</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Feed URL *</label>
            <input
              type="text"
              placeholder={formData.type === 'video' ? 'YouTube URL or @handle' : 'https://example.com/feed.xml'}
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            />
            {formData.type === 'video' && (
              <p className="field-help" style={{ fontSize: '11px', color: 'var(--color-primary)', marginTop: '4px' }}>
                Supports video URLs, channel URLs, or handles (e.g. @Reuters)
              </p>
            )}
          </div>

          <button type="submit" className="btn-submit">
            {editingSourceId ? 'Update Source' : 'Add Source'}
          </button>
        </form>
      )}

      <div className="sources-list">
        {sources.length === 0 ? (
          <p className="no-sources">No sources configured</p>
        ) : (
          sources.map((source) => (
            <div key={source.id} className="source-item">
              <div className="source-info">
                <div className="source-toggle">
                  <input
                    type="checkbox"
                    id={`toggle-${source.id}`}
                    checked={source.enabled}
                    onChange={() => handleToggleSource(source.id)}
                    className="source-checkbox"
                  />
                </div>
                <div className="source-details">
                  <div className="source-name">
                    {source.name}
                    <button
                      className="btn-edit-inline"
                      onClick={() => startEditing(source)}
                      title="Edit source"
                    >
                      ✏️
                    </button>
                  </div>
                  <div className="source-meta">
                    <span className="badge">{source.type}</span>
                    <span className="badge category">{source.category}</span>
                  </div>
                  <div className="source-url">{source.url}</div>
                </div>
              </div>
              <button
                className={`btn-delete ${deletingId === source.id ? 'confirm' : ''}`}
                onClick={() => handleDeleteSource(source.id, source.name)}
                onMouseLeave={() => deletingId === source.id && setDeletingId(null)}
                title={deletingId === source.id ? 'Confirm Delete' : 'Delete source'}
              >
                {deletingId === source.id ? 'CONFIRM' : '✕'}
              </button>
            </div>
          ))
        )}
      </div>

      <div className="source-manager-footer">
        <p className="info-text">Enabled sources will be fetched every 30 minutes</p>
      </div>
    </div>
  );
}
