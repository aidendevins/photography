const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`CREATE TABLE IF NOT EXISTS page_views (
      id SERIAL PRIMARY KEY, path VARCHAR(255), referrer TEXT,
      ip VARCHAR(100), user_agent TEXT, country VARCHAR(100), city VARCHAR(100),
      timestamp TIMESTAMPTZ DEFAULT NOW()
    )`);
    await client.query(`ALTER TABLE page_views ADD COLUMN IF NOT EXISTS country VARCHAR(100)`);
    await client.query(`ALTER TABLE page_views ADD COLUMN IF NOT EXISTS city VARCHAR(100)`);
    await client.query(`CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY, event_name VARCHAR(100), path VARCHAR(255),
      ip VARCHAR(100), user_agent TEXT, timestamp TIMESTAMPTZ DEFAULT NOW()
    )`);
    await client.query(`CREATE TABLE IF NOT EXISTS contacts (
      id SERIAL PRIMARY KEY, email VARCHAR(255) NOT NULL,
      first_name VARCHAR(100), last_name VARCHAR(100), phone VARCHAR(50),
      message TEXT, status VARCHAR(50) DEFAULT 'new',
      timestamp TIMESTAMPTZ DEFAULT NOW()
    )`);
    await client.query(`ALTER TABLE contacts ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'new'`);
    await client.query(`ALTER TABLE contacts ADD COLUMN IF NOT EXISTS message TEXT`);
    await client.query(`CREATE TABLE IF NOT EXISTS blocked_ips (
      id SERIAL PRIMARY KEY, ip VARCHAR(100) UNIQUE NOT NULL,
      note VARCHAR(255), created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await client.query(`CREATE TABLE IF NOT EXISTS photo_favorites (
      photo_id INTEGER PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await client.query(`CREATE TABLE IF NOT EXISTS author_visibility (
      author VARCHAR(100) PRIMARY KEY,
      visible BOOLEAN DEFAULT true,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await client.query(`
      INSERT INTO author_visibility (author, visible)
      VALUES ('Kaitlin & Aiden', true), ('Aiden', true), ('Kaitlin', true)
      ON CONFLICT (author) DO NOTHING
    `);
    console.log('✅ Database tables initialized');
  } catch (err) {
    console.error('Database init error:', err);
  } finally {
    client.release();
  }
}

module.exports = { pool, initDB };
