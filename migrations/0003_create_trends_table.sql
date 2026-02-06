-- Migration: Create trends table for RAG system
-- Purpose: Store hairstyle trends for Trend-Watcher Agent

CREATE TABLE IF NOT EXISTS trends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trend_name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT, -- e.g., 'classic', 'modern', 'trending', 'seasonal'
  popularity_score INTEGER DEFAULT 50, -- 0-100 scale
  keywords TEXT, -- JSON array of keywords
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_trends_category ON trends(category);
CREATE INDEX IF NOT EXISTS idx_trends_popularity ON trends(popularity_score DESC);
