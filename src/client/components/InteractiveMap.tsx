import React, { useState, useRef, useEffect, useCallback } from 'react';
import './InteractiveMap.css';

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

interface InteractiveMapProps {
  articles: NewsItem[];
  selectedArticle: NewsItem | null;
  onArticleSelect: (article: NewsItem) => void;
  onMapLocationChange?: (center: { lat: number; lng: number }, zoom: number) => void;
}

export default function InteractiveMap({
  articles,
  selectedArticle,
  onArticleSelect,
  onMapLocationChange,
}: InteractiveMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapImageRef = useRef<HTMLImageElement | null>(null);
  const mapImageLoadedRef = useRef(false);
  const animFrameRef = useRef<number>(0);
  // Cached image draw rect (where the map image actually sits on the canvas)
  const imgDrawRectRef = useRef({ x: 0, y: 0, w: 0, h: 0 });

  // Map state - use refs for values needed in draw loop to avoid stale closures
  const [zoom, setZoom] = useState(1.0);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1.0);

  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 12;

  // Hover state
  const [hoveredArticleId, setHoveredArticleId] = useState<string | null>(null);
  const [hoveredMarkerPos, setHoveredMarkerPos] = useState<{ x: number; y: number } | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calibration State
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationStep, setCalibrationStep] = useState(0);
  const [calibratedData, setCalibratedData] = useState<{
    originX: number;
    originY: number;
    pxPerLon: number;
    pxPerLatNorth: number; // For Northern hemisphere
    pxPerLatSouth: number; // For Southern hemisphere
  } | null>(() => {
    const saved = localStorage.getItem('map_calibration');
    return saved ? JSON.parse(saved) : null;
  });

  const [tempPoints, setTempPoints] = useState<any[]>([]);

  const mapImageUrl = '/AI-WORLD-MAP.png';

  // Keep refs in sync with state
  useEffect(() => {
    panRef.current = { x: panX, y: panY };
  }, [panX, panY]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  // Pre-load the map image once
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      mapImageRef.current = img;
      mapImageLoadedRef.current = true;
      drawMap();
    };
    img.src = mapImageUrl;
  }, []);

  // Convert CSS mouse coordinates to canvas pixel coordinates
  const cssToCanvas = useCallback((cssX: number, cssY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: cssX, y: cssY };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (cssX - rect.left) * scaleX,
      y: (cssY - rect.top) * scaleY,
    };
  }, []);

  // Convert canvas pixel coordinates back to CSS coordinates (for tooltip positioning)
  const canvasToCss = useCallback((canvasX: number, canvasY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: canvasX, y: canvasY };
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;
    return {
      x: canvasX * scaleX,
      y: canvasY * scaleY,
    };
  }, []);

  // Default fallback constants for AI-WORLD-MAP.png if no calibration exists
  const DEFAULT_ORIGIN_X = 0.5; // (Prime Meridian)
  const DEFAULT_ORIGIN_Y = 0.64; // (Equator)
  const DEFAULT_PX_PER_LON = 1.0 / 360; 
  const DEFAULT_PX_PER_LAT_N = 1.0 / 120; // Northern stretch
  const DEFAULT_PX_PER_LAT_S = 1.0 / 100; // Southern stretch


  // Project lat/lng to canvas coordinates using calibrated data
  const projectToCanvas = useCallback((lat: number, lng: number, currentZoom?: number, currentPanX?: number, currentPanY?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const width = canvas.width;
    const height = canvas.height;
    const z = currentZoom ?? zoomRef.current;
    const px = currentPanX ?? panRef.current.x;
    const py = currentPanY ?? panRef.current.y;
    const ir = imgDrawRectRef.current;

    let normX, normY;

    if (calibratedData) {
      // Use user-calibrated points (normalized to image space 0-1)
      normX = calibratedData.originX + (lng * calibratedData.pxPerLon);
      
      if (lat >= 0) {
        // Northern hemisphere
        normY = calibratedData.originY - (lat * calibratedData.pxPerLatNorth);
      } else {
        // Southern hemisphere
        normY = calibratedData.originY - (lat * calibratedData.pxPerLatSouth);
      }
    } else {
      // High-precision fallback for the default AI-WORLD-MAP.png
      // Values derived from current image audit:
      const originX = 0.5; // PM is centered
      const originY = 0.64; // Equator is low on this specific crop
      const pxPerLon = 0.00276; 
      const pxPerLatN = 0.00644;
      const pxPerLatS = 0.00428;

      normX = originX + (lng * pxPerLon);
      if (lat >= 0) {
        normY = originY - (lat * pxPerLatN);
      } else {
        normY = originY - (lat * pxPerLatS);
      }
    }

    // Map into the image draw rect
    const geoX = ir.x + normX * ir.w;
    const geoY = ir.y + normY * ir.h;

    // Apply zoom around canvas center
    const centerX = width / 2;
    const centerY = height / 2;

    const pixelX = centerX + (geoX - centerX) * z + px;
    const pixelY = centerY + (geoY - centerY) * z + py;

    return { x: pixelX, y: pixelY };
  }, [calibratedData]);

  // Calculate pan offset to center on a specific lat/lng
  const getPanToCenter = useCallback((lat: number, lng: number, targetZoom: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const pos = projectToCanvas(lat, lng, 1.0, 0, 0);
    if (!pos) return { x: 0, y: 0 };

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    return {
      x: -(pos.x - centerX) * targetZoom,
      y: -(pos.y - centerY) * targetZoom
    };
  }, [projectToCanvas]);

  // Draw the entire map (synchronous - image is pre-loaded)
  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const currentZoom = zoomRef.current;
    const currentPanX = panRef.current.x;
    const currentPanY = panRef.current.y;

    // Clear canvas
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, width, height);

    // Draw background map image (synchronous since pre-loaded)
    if (mapImageLoadedRef.current && mapImageRef.current) {
      const img = mapImageRef.current;

      // Always fit by HEIGHT so the full latitude range stays visible.
      // The map may have black bars on the sides if the canvas is wider than the image.
      const imgRatio = img.width / img.height;
      const drawHeight = height;
      const drawWidth = height * imgRatio;
      const drawX = (width - drawWidth) / 2;
      const drawY = 0;

      // Cache the image draw rect so projection uses the same coordinates
      imgDrawRectRef.current = { x: drawX, y: drawY, w: drawWidth, h: drawHeight };

      ctx.save();
      ctx.translate(currentPanX, currentPanY);
      const centerX = width / 2;
      const centerY = height / 2;
      ctx.translate(centerX, centerY);
      ctx.scale(currentZoom, currentZoom);
      ctx.translate(-centerX, -centerY);

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      ctx.restore();
    }

    // Draw markers ON TOP of the map
    drawMarkers(ctx, width, height, currentZoom, currentPanX, currentPanY);

    // Draw calibration temp points
    if (isCalibrating && tempPoints.length > 0) {
      tempPoints.forEach((pt, i) => {
        const geoX = imgDrawRectRef.current.x + pt.normX * imgDrawRectRef.current.w;
        const geoY = imgDrawRectRef.current.y + pt.normY * imgDrawRectRef.current.h;
        const centerX = width / 2;
        const centerY = height / 2;
        const px = centerX + (geoX - centerX) * currentZoom + currentPanX;
        const py = centerY + (geoY - centerY) * currentZoom + currentPanY;

        ctx.fillStyle = '#00ff00';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillText(`${i + 1}`, px, py - 10);
      });
    }

    // Draw zoom level indicator
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '12px Segoe UI';
    ctx.textAlign = 'right';
    ctx.fillText(`${(currentZoom * 100).toFixed(0)}%`, width - 12, height - 12);
  }, [articles, selectedArticle, hoveredArticleId, calibratedData, isCalibrating, tempPoints]);

  const drawMarkers = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    currentZoom: number,
    currentPanX: number,
    currentPanY: number
  ) => {
    articles.forEach((article) => {
      if (!article.location) return;

      const pos = projectToCanvas(article.location.lat, article.location.lng, currentZoom, currentPanX, currentPanY);
      if (!pos) return;

      // Check if within visible canvas (with some margin)
      if (pos.x < -20 || pos.x > width + 20 || pos.y < -20 || pos.y > height + 20) return;

      const isSelected = selectedArticle?.id === article.id;
      const isHovered = hoveredArticleId === article.id;

      // Draw outer glow for hovered/selected
      if (isHovered || isSelected) {
        ctx.fillStyle = isSelected ? 'rgba(216, 58, 46, 0.4)' : 'rgba(245, 166, 35, 0.3)';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 18, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw marker circle
      const radius = isSelected || isHovered ? 8 : 6;
      ctx.fillStyle = isSelected ? '#D83A2E' : '#F5A623';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw pulsing ring for selected
      if (isSelected) {
        ctx.strokeStyle = 'rgba(216, 58, 46, 0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        // Dynamic pulse based on time
        const pulseRatio = (Date.now() % 2000) / 2000;
        const pulseRadius = 14 + (pulseRatio * 15);
        ctx.arc(pos.x, pos.y, pulseRadius, 0, Math.PI * 2);
        ctx.globalAlpha = 1 - pulseRatio;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }
    });
  };

  // Handle canvas mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    const zoomSpeed = 0.15;
    const direction = e.deltaY > 0 ? -1 : 1;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Get mouse position relative to canvas pixels
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    setZoom((prev) => {
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + direction * zoomSpeed));
      
      // Keep the point under the mouse cursor stable during zoom
      // formula: newPan = mx - centerX - ((mx - centerX - oldPan) / oldZoom) * newZoom
      const relX = (mx - centerX - panRef.current.x) / prev;
      const relY = (my - centerY - panRef.current.y) / prev;
      
      const newPanX = mx - centerX - relX * newZoom;
      const newPanY = my - centerY - relY * newZoom;
      
      setPanX(newPanX);
      setPanY(newPanY);
      
      panRef.current = { x: newPanX, y: newPanY };
      zoomRef.current = newZoom;
      return newZoom;
    });
  }, []);

  // Handle canvas mouse down (start dragging)
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  // Handle canvas mouse move (dragging and hover detection)
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle dragging
    if (isDraggingRef.current) {
      setHoveredArticleId(null);
      setHoveredMarkerPos(null);
      
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      dragStartRef.current = { x: e.clientX, y: e.clientY };

      // Scale delta by canvas/CSS ratio so drag feels 1:1
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      setPanX((prev) => {
        const next = prev + deltaX * scaleX;
        panRef.current.x = isFinite(next) ? next : panRef.current.x;
        return isFinite(next) ? next : prev;
      });
      setPanY((prev) => {
        const next = prev + deltaY * scaleY;
        panRef.current.y = isFinite(next) ? next : panRef.current.y;
        return isFinite(next) ? next : prev;
      });
      return;
    }

    // Detect hover over markers (use canvas coordinates)
    const canvasPos = cssToCanvas(e.clientX, e.clientY);
    const hoveredArticles: NewsItem[] = [];
    const HOVER_RADIUS = 20; // Hit detection radius in canvas pixels
    let closestPos: { x: number; y: number } | null = null;
    let minDistance = HOVER_RADIUS;

    articles.forEach((article) => {
      if (!article.location) return;

      const pos = projectToCanvas(article.location.lat, article.location.lng);
      if (!pos) return;

      const distance = Math.sqrt((canvasPos.x - pos.x) ** 2 + (canvasPos.y - pos.y) ** 2);

      if (distance < HOVER_RADIUS) {
        hoveredArticles.push(article);
        if (distance < minDistance) {
          minDistance = distance;
          closestPos = pos;
        }
      }
    });

    // Update hover state
    if (hoveredArticles.length > 0) {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      setHoveredArticleId(hoveredArticles[0].id);
      if (closestPos) {
        setHoveredMarkerPos({ x: closestPos.x, y: closestPos.y });
      }
    } else {
      if (!hoverTimeoutRef.current && hoveredArticleId) {
        hoverTimeoutRef.current = setTimeout(() => {
          setHoveredArticleId(null);
          setHoveredMarkerPos(null);
          hoverTimeoutRef.current = null;
        }, 300);
      }
    }

    canvas.style.cursor = hoveredArticles.length > 0 ? 'pointer' : isDraggingRef.current ? 'grabbing' : 'grab';
  }, [articles, cssToCanvas, canvasToCss, projectToCanvas, hoveredArticleId]);

  // Handle canvas mouse up (stop dragging)
  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isCalibrating) {
      const canvasPos = cssToCanvas(e.clientX, e.clientY);
      
      // Calculate position relative to the UNZOOMED image
      const ir = imgDrawRectRef.current;
      const centerX = canvasRef.current!.width / 2;
      const centerY = canvasRef.current!.height / 2;
      
      const imgX = (canvasPos.x - panRef.current.x - centerX) / zoomRef.current + centerX;
      const imgY = (canvasPos.y - panRef.current.y - centerY) / zoomRef.current + centerY;
      
      const normX = (imgX - ir.x) / ir.w;
      const normY = (imgY - ir.y) / ir.h;

      if (calibrationStep === 0) {
        // Equator/PM (0,0)
        setTempPoints([{ normX, normY }]);
        setCalibrationStep(1);
      } else if (calibrationStep === 1) {
        // Northern Step (London: 51.5, 0)
        setTempPoints(prev => [...prev, { normX, normY }]);
        setCalibrationStep(2);
      } else if (calibrationStep === 2) {
        // Australia/Southern Step (Sydney: -33.8, 151.2)
        const p1 = tempPoints[0]; // (0,0)
        const p2 = tempPoints[1]; // (51.5, 0)
        const p3 = { normX, normY }; // (-33.8, 151.2)

        const originX = p1.normX;
        const originY = p1.normY;
        
        // London is 51.5N. pxPerLatNorth = (originY - p2.normY) / 51.5
        const pxPerLatNorth = (originY - p2.normY) / 51.5;
        
        // Sydney is -33.8. pxPerLatSouth = (p3.normY - originY) / 33.8
        const pxPerLatSouth = (p3.normY - originY) / 33.8;
        
        // Sydney is 151.2E. pxPerLon = (p3.normX - originX) / 151.2
        const pxPerLon = (p3.normX - originX) / 151.2;

        const data = { originX, originY, pxPerLon, pxPerLatNorth, pxPerLatSouth };
        setCalibratedData(data);
        localStorage.setItem('map_calibration', JSON.stringify(data));
        setIsCalibrating(false);
        setCalibrationStep(0);
        setTempPoints([]);
      }
      return;
    }

    if (hoveredArticleId) {
      const article = articles.find((a) => a.id === hoveredArticleId);
      if (article) {
        onArticleSelect(article);
      }
    }
  }, [isCalibrating, calibrationStep, tempPoints, hoveredArticleId, articles, onArticleSelect, cssToCanvas]);

  // Double-click to zoom
  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    if (hoveredArticleId) {
      const article = articles.find((a) => a.id === hoveredArticleId);
      if (article?.location) {
        const targetZoom = 6;
        const pan = getPanToCenter(article.location.lat, article.location.lng, targetZoom);
        setZoom(targetZoom);
        setPanX(pan.x);
        setPanY(pan.y);
        zoomRef.current = targetZoom;
        panRef.current = pan;
      }
    } else {
      setZoom((prev) => {
        const next = Math.min(MAX_ZOOM, prev + 0.5);
        zoomRef.current = next;
        return next;
      });
    }
  }, [hoveredArticleId, articles, getPanToCenter]);

  // Redraw on state change
  useEffect(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    animFrameRef.current = requestAnimationFrame(drawMap);
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [zoom, panX, panY, articles, selectedArticle, hoveredArticleId, calibratedData, isCalibrating, tempPoints, drawMap]);

  // Keep the latest drawMap function available for the resize observer without triggering re-binds
  const drawMapRef = useRef(drawMap);
  useEffect(() => {
    drawMapRef.current = drawMap;
  }, [drawMap]);

  // Set canvas size on mount and resize
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const updateSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      // Call the latest drawMap so we don't use a stale closure with empty articles
      drawMapRef.current();
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  // Zoom to selected article location when article is clicked from feed
  useEffect(() => {
    if (selectedArticle?.location) {
      const targetZoom = 6;
      const pan = getPanToCenter(selectedArticle.location.lat, selectedArticle.location.lng, targetZoom);
      setZoom(targetZoom);
      setPanX(pan.x);
      setPanY(pan.y);
      zoomRef.current = targetZoom;
      panRef.current = pan;
    }
  }, [selectedArticle?.id, getPanToCenter]);

  return (
    <div className="interactive-map-container" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className="map-canvas"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
        onDoubleClick={handleDoubleClick}
      />

      {/* Hovered Article Tooltip */}
      {hoveredMarkerPos && hoveredArticleId && (() => {
        // Find all articles near the hovered position to show a cluster
        const mainArticle = articles.find(a => a.id === hoveredArticleId);
        if (!mainArticle || !mainArticle.location) return null;

        const hoveredPos = projectToCanvas(
          mainArticle.location.lat,
          mainArticle.location.lng
        );
        
        let clusterArticles = [mainArticle];
        if (hoveredPos) {
          clusterArticles = articles.filter(a => {
            if (!a.location) return false;
            const p = projectToCanvas(a.location.lat, a.location.lng);
            if (!p) return false;
            return Math.sqrt((hoveredPos.x - p.x)**2 + (hoveredPos.y - p.y)**2) < 20;
          });
        }
        
        // Remove duplicates by ID
        clusterArticles = clusterArticles.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);

        // Scale canvas position to CSS position for the tooltip div
        const cssPos = canvasToCss(hoveredMarkerPos.x, hoveredMarkerPos.y);

        return (
          <div
            className="marker-tooltip"
            onMouseEnter={() => {
              if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
                hoverTimeoutRef.current = null;
              }
            }}
            onMouseLeave={() => {
              setHoveredArticleId(null);
              setHoveredMarkerPos(null);
            }}
            style={{
              left: `${cssPos.x}px`,
              top: `${cssPos.y - 12}px`,
              transform: 'translateX(-50%) translateY(-100%)',
            }}
          >
            <div className="tooltip-header">
              📍 {clusterArticles[0].location?.name}
              {clusterArticles.length > 1 && <span className="cluster-badge">{clusterArticles.length} Stories</span>}
            </div>
            
            <div className="tooltip-articles">
              {clusterArticles.slice(0, 3).map(article => (
                <div key={article.id} className="tooltip-article-item">
                  <a href={article.url} target="_blank" rel="noopener noreferrer" className="tooltip-title">
                    {article.title}
                  </a>
                  <div className="tooltip-source">{article.source}</div>
                </div>
              ))}
              {clusterArticles.length > 3 && (
                <div className="tooltip-more">+{clusterArticles.length - 3} more articles...</div>
              )}
            </div>
            
            <div className="tooltip-hint">Click a title to read more</div>
          </div>
        );
      })()}

      {/* Map Controls */}
      <div className="map-controls">
        <button
          className="control-btn"
          onClick={() => {
            setZoom((prev) => {
              const next = Math.min(MAX_ZOOM, prev + 0.5);
              zoomRef.current = next;
              return next;
            });
          }}
          title="Zoom in"
        >
          +
        </button>
        <button
          className="control-btn"
          onClick={() => {
            setZoom((prev) => {
              const next = Math.max(MIN_ZOOM, prev - 0.5);
              zoomRef.current = next;
              return next;
            });
          }}
          title="Zoom out"
        >
          −
        </button>
        <button
          className="control-btn"
          onClick={() => {
            setZoom(1.0);
            setPanX(0);
            setPanY(0);
            zoomRef.current = 1.0;
            panRef.current = { x: 0, y: 0 };
          }}
          title="Reset view"
        >
          ⊙
        </button>
        <button
          className={`control-btn ${isCalibrating ? 'active' : ''}`}
          onClick={() => {
            setIsCalibrating(!isCalibrating);
            setCalibrationStep(0);
          }}
          title="Calibrate Map"
        >
          📏
        </button>
      </div>

      {/* Calibration Overlay */}
      {isCalibrating && (
        <div className="calibration-overlay">
          <div className="calibration-hint">
            <div className="step-indicator">Step {calibrationStep + 1} of 3</div>
            <div className="instruction">
              {calibrationStep === 0 && "1. Click off the West Coast of Africa (Intersection of Equator & Prime Meridian)"}
              {calibrationStep === 1 && "2. Click exactly on London, England"}
              {calibrationStep === 2 && "3. Click exactly on Sydney, Australia"}
            </div>
            <div className="calibration-actions">
              <button className="cancel-btn" onClick={() => setIsCalibrating(false)}>Cancel</button>
              {calibratedData && (
                <button 
                  className="cancel-btn reset-btn" 
                  onClick={() => {
                    localStorage.removeItem('map_calibration');
                    setCalibratedData(null);
                    setIsCalibrating(false);
                  }}
                >
                  Reset to Default
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info Text */}
      <div className="map-info">
        <span className="info-item">📍 {articles.filter((a) => a.location).length} locations</span>
        <span className="info-item">📰 {articles.length} articles</span>
        <span className="info-item" style={{ fontSize: '11px', opacity: 0.6 }}>
          Click to select • Drag to pan • Scroll to zoom
        </span>
      </div>
    </div>
  );
}
