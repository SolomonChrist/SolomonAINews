import React, { useState, useEffect } from 'react';
import './App.css';
import GridDashboard from './components/GridDashboard';

export default function App() {
  useEffect(() => {
    // Set dark mode by default
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  return (
    <div className="app-container">
      <GridDashboard />
    </div>
  );
}
