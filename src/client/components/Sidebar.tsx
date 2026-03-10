import React from 'react';
import './Sidebar.css';

interface SidebarProps {
  activePanel: string;
  onPanelChange: (panel: any) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Sidebar({ activePanel, onPanelChange, isDarkMode, onToggleDarkMode }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'feed', label: 'News Feed', icon: '📋' },
    { id: 'map', label: 'Global Map', icon: '🌍' },
    { id: 'news', label: 'News', icon: '📰' },
    { id: 'twitter', label: 'Twitter Feed', icon: '𝕏' },
    { id: 'videos', label: 'Live Videos', icon: '📹' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">🤖</span>
          <span className="logo-text">NewsBot</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activePanel === item.id ? 'active' : ''}`}
            onClick={() => onPanelChange(item.id)}
            title={item.label}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="theme-toggle" onClick={onToggleDarkMode} title={isDarkMode ? 'Light Mode' : 'Dark Mode'}>
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        <button className="settings-btn" title="Settings">
          ⚙️
        </button>
      </div>
    </aside>
  );
}
