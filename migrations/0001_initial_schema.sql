-- BARBER-AI-GOD Database Schema
-- Phase 2: Real Credit System Implementation

-- Users table - Track user credits & daily resets
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  credits INTEGER DEFAULT 5,
  last_reset TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Consultations history - Track all AI consultations
CREATE TABLE IF NOT EXISTS consultations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  face_shape TEXT,
  prompt TEXT,
  response TEXT,
  credits_used INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_last_reset ON users(last_reset);
CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_created_at ON consultations(created_at);
