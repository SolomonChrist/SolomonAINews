import React, { useState, useEffect } from 'react';
import '../panels.css';

interface LiveVideo {
  id: string;
  channel: string;
  title: string;
  thumbnail_url?: string;
  viewer_count: number;
  status: 'live' | 'upcoming' | 'ended';
  url: string;
  started_at?: string;
}

export default function VideoPanel() {
  const [videos, setVideos] = useState<LiveVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [playingMap, setPlayingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchVideos();
  }, []);

  const playVideo = (id: string) => {
    setPlayingMap(prev => ({ ...prev, [id]: true }));
  };

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/videos/live');
      const data = await response.json();
      setVideos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchVideos();
    } finally {
      setRefreshing(false);
    }
  };

  const openVideo = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">
          <h2>📹 Live News Videos</h2>
          <p>Global coverage active</p>
        </div>
        <button
          className={`refresh-btn ${refreshing ? 'spinning' : ''}`}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          🔄
        </button>
      </div>

      <div className="videos-container">
        {loading ? (
          <div className="empty-state">
            <div className="spinner"></div>
            <p>Loading live streams...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="empty-state">
            <p>No live streams available right now</p>
          </div>
        ) : (
          <div className="videos-grid">
            {videos.slice(0, 2).map((video) => {
              let youtubeId = '';

              if (video.url.includes('youtube.com/watch?v=')) {
                youtubeId = video.url.split('v=')[1].split('&')[0];
              } else if (video.url.includes('youtu.be/')) {
                youtubeId = video.url.split('youtu.be/')[1].split('?')[0];
              }
              // Try to grab from fallbackVideoId if populated
              if ((video as any).fallbackVideoId) {
                youtubeId = (video as any).fallbackVideoId;
              }

              const isNoEmbed = video.url.includes('noembed=1') || video.url.includes('business') || youtubeId === 'f39oHo6vFLg' || youtubeId === 'HSImh9Pz_44';
              const isPlaying = playingMap[video.id];

              return (
                <div key={video.id} className="video-grid-item">
                  {youtubeId && (!isNoEmbed || isPlaying) ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&modestbranding=1&playsinline=1&rel=0`}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ border: 'none', borderRadius: '8px', width: '100%', height: '100%' }}
                    ></iframe>
                  ) : (
                    <div
                      className="video-card fallback"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); playVideo(video.id); }}
                      style={{ height: '100%', flexDirection: 'column', cursor: 'pointer' }}
                    >
                      <div style={{ position: 'relative', width: '100%', height: '120px' }}>
                        {video.thumbnail_url ? (
                          <img
                            src={video.thumbnail_url}
                            alt={video.title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: '8px 8px 0 0',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              backgroundColor: 'var(--color-bg-dark)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '32px',
                              borderRadius: '8px 8px 0 0',
                            }}
                          >
                            🎥
                          </div>
                        )}
                        {video.status === 'live' && (
                          <div className="live-badge">🔴 LIVE</div>
                        )}
                        <div className="play-overlay" style={{
                          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                          backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '50%', width: '48px', height: '48px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'
                        }}>
                          ▶️
                        </div>
                      </div>
                      <div style={{ flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>{video.title}</h3>
                        <div className="video-meta">
                          <span className="channel">📺 {video.channel}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="video-label">{video.channel}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}
