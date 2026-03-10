import React, { useState, useEffect, useRef } from 'react';
import './MapView.css';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  location?: {
    name: string;
    lat: number;
    lng: number;
    source: 'content' | 'company' | 'fallback';
  };
}

interface MapMarker extends NewsItem {
  cluster?: string;
}

export default function MapView() {
  const [articles, setArticles] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(3);
  const [center, setCenter] = useState({ lat: 20, lng: 0 });

  useEffect(() => {
    fetchArticlesWithLocations();
    const interval = setInterval(fetchArticlesWithLocations, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (articles.length > 0 && canvasRef.current) {
      drawMap();
    }
  }, [articles, zoom, center, selectedMarker]);

  const fetchArticlesWithLocations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/news/feed');
      if (!response.ok) throw new Error('Failed to fetch articles');

      const data = await response.json();
      const withLocation = (data.articles || []).filter((a: NewsItem) => a.location);
      setArticles(withLocation);
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

    // Clear canvas
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
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

    // Project lat/lng to canvas coordinates
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
          // Draw marker circle
          const isSelected = selectedMarker?.id === article.id;
          const radius = isSelected ? 8 : 6;

          ctx.fillStyle = isSelected ? '#ff4444' : '#0066cc';
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();

          // Draw marker border
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.stroke();

          // Draw label for selected marker
          if (isSelected) {
            ctx.fillStyle = '#333';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(article.location.name, x, y - 15);
          }
        }
      }
    });

    // Draw center dot
    ctx.fillStyle = '#0066cc';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 3, 0, Math.PI * 2);
    ctx.fill();
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

    // Check if click is near a marker
    for (const article of articles) {
      if (article.location) {
        const { x: mx, y: my } = project(article.location.lat, article.location.lng);
        const distance = Math.sqrt((x - mx) ** 2 + (y - my) ** 2);
        if (distance < 10) {
          setSelectedMarker(article);
          return;
        }
      }
    }
    setSelectedMarker(null);
  };

  const handleZoom = (direction: number) => {
    setZoom(Math.max(1, Math.min(10, zoom + direction)));
  };

  const handlePan = (dx: number, dy: number) => {
    setCenter({
      lat: Math.max(-85, Math.min(85, center.lat + dy * 10)),
      lng: (center.lng + dx * 20) % 360,
    });
  };

  if (loading && articles.length === 0) {
    return (
      <div className="map-view loading">
        <div className="spinner"></div>
        <p>Loading map...</p>
      </div>
    );
  }

  return (
    <div className="map-view">
      <div className="map-header">
        <h2>Global News Map</h2>
        <p className="map-subtitle">{articles.length} stories located globally</p>
      </div>

      <div className="map-container">
        <div className="map-canvas-wrapper">
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            onClick={handleCanvasClick}
            className="map-canvas"
          />
        </div>

        <div className="map-controls">
          <div className="control-group zoom-controls">
            <button onClick={() => handleZoom(1)} title="Zoom in" className="control-btn">
              +
            </button>
            <div className="zoom-level">{zoom}</div>
            <button onClick={() => handleZoom(-1)} title="Zoom out" className="control-btn">
              −
            </button>
          </div>

          <div className="control-group pan-controls">
            <button onClick={() => handlePan(0, 1)} title="Pan north" className="control-btn">
              ↑
            </button>
            <button onClick={() => handlePan(-1, 0)} title="Pan west" className="control-btn">
              ←
            </button>
            <button onClick={() => handlePan(0, -1)} title="Pan south" className="control-btn">
              ↓
            </button>
            <button onClick={() => handlePan(1, 0)} title="Pan east" className="control-btn">
              →
            </button>
          </div>

          <button
            onClick={() => {
              setZoom(3);
              setCenter({ lat: 20, lng: 0 });
            }}
            className="control-btn reset-btn"
            title="Reset view"
          >
            ⊕
          </button>
        </div>
      </div>

      {selectedMarker && (
        <div className="marker-info">
          <div className="marker-info-header">
            <h3>{selectedMarker.location?.name}</h3>
            <button onClick={() => setSelectedMarker(null)} className="close-btn">
              ✕
            </button>
          </div>
          <h4>{selectedMarker.title}</h4>
          <p>{selectedMarker.description}</p>
          <div className="marker-meta">
            <span className="source">{selectedMarker.source}</span>
            <span className="location">📍 {selectedMarker.location?.name}</span>
          </div>
          <a href={selectedMarker.url} target="_blank" rel="noopener noreferrer" className="read-more-btn">
            Read full story →
          </a>
        </div>
      )}

      <div className="map-stats">
        <div className="stat">
          <span className="stat-label">Total Stories</span>
          <span className="stat-value">{articles.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Unique Locations</span>
          <span className="stat-value">{new Set(articles.map((a) => a.location?.name)).size}</span>
        </div>
      </div>
    </div>
  );
}
