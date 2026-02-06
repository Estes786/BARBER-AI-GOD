-- BARBER-AI-GOD Seed Data
-- Test users for development & testing

-- Insert test users with different credit levels
INSERT OR IGNORE INTO users (id, credits, last_reset, created_at) VALUES 
  ('user-demo-123', 5, datetime('now'), datetime('now')),
  ('user-test-001', 3, datetime('now'), datetime('now')),
  ('user-test-002', 0, datetime('now', '-1 day'), datetime('now', '-5 days')),
  ('user-vip-999', 10, datetime('now'), datetime('now', '-30 days'));

-- Insert sample consultations for testing
INSERT OR IGNORE INTO consultations (user_id, face_shape, prompt, response, credits_used, created_at) VALUES 
  ('user-demo-123', 'oval', 'Gaya rambut apa yang cocok?', 'Gyss, wajah oval lo cocok banget pake Slick Back atau Pompadour!', 1, datetime('now', '-1 hour')),
  ('user-test-001', 'bulat', 'Pengen ganti gaya nih', 'Untuk wajah bulat, Quiff sama High Fade mantul banget biar keliatan lebih tinggi!', 1, datetime('now', '-2 hours')),
  ('user-test-002', 'kotak', 'Rambut gue tipis gimana?', 'Wajah kotak plus rambut tipis? Coba Textured Crop sama pake Texture Paste, Gyss!', 1, datetime('now', '-1 day'));
