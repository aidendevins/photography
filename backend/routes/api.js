const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const geoip = require('geoip-lite');

const getClientInfo = (req) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
  const geo = geoip.lookup(ip);
  return { ip, userAgent: req.headers['user-agent'] || '', country: geo?.country || '', city: geo?.city || '' };
};

const auth = (req, res) => {
  if (req.headers.authorization !== 'Bearer 0612') {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
};

router.get('/', (req, res) => res.json({ message: 'Photography API running' }));
router.get('/status', (req, res) => res.json({ status: 'online', uptime: process.uptime() }));

router.post('/analytics/view', async (req, res) => {
  const { path = '/', referrer = '' } = req.body || {};
  const info = getClientInfo(req);
  try {
    await pool.query(
      'INSERT INTO page_views (path, referrer, ip, user_agent, country, city) VALUES ($1,$2,$3,$4,$5,$6)',
      [path, referrer, info.ip, info.userAgent, info.country, info.city]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.post('/analytics/event', async (req, res) => {
  const { eventName, path = '/' } = req.body || {};
  const info = getClientInfo(req);
  try {
    await pool.query(
      'INSERT INTO events (event_name, path, ip, user_agent) VALUES ($1,$2,$3,$4)',
      [eventName, path, info.ip, info.userAgent]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.get('/admin/analytics', async (req, res) => {
  if (!auth(req, res)) return;
  try {
    const views = await pool.query('SELECT path, referrer, ip, user_agent AS "userAgent", country, city, timestamp FROM page_views ORDER BY timestamp DESC');
    const events = await pool.query('SELECT event_name AS "eventName", path, ip, user_agent AS "userAgent", timestamp FROM events ORDER BY timestamp DESC');
    res.json({ pageViews: views.rows, events: events.rows });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.post('/contact', async (req, res) => {
  const { email, firstName, lastName, phone, message } = req.body;
  if (!email?.trim()) return res.status(400).json({ error: 'Email is required' });
  try {
    await pool.query(
      'INSERT INTO contacts (email, first_name, last_name, phone, message) VALUES ($1,$2,$3,$4,$5)',
      [email.trim(), (firstName||'').trim(), (lastName||'').trim(), (phone||'').trim(), (message||'').trim()]
    );
    res.json({ success: true, message: "Thanks! I'll be in touch soon." });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.get('/admin/contacts', async (req, res) => {
  if (!auth(req, res)) return;
  try {
    const result = await pool.query('SELECT id, email, first_name AS "firstName", last_name AS "lastName", phone, message, status, timestamp FROM contacts ORDER BY timestamp DESC');
    res.json({ contacts: result.rows });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.patch('/admin/contacts/:id', async (req, res) => {
  if (!auth(req, res)) return;
  const allowed = ['new','emailed','complete','not_interested'];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ error: 'Invalid status' });
  try {
    await pool.query('UPDATE contacts SET status=$1 WHERE id=$2', [req.body.status, req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.delete('/admin/contacts/:id', async (req, res) => {
  if (!auth(req, res)) return;
  try {
    await pool.query('DELETE FROM contacts WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.get('/admin/blocked-ips', async (req, res) => {
  if (!auth(req, res)) return;
  try {
    const result = await pool.query('SELECT ip, note, created_at AS "createdAt" FROM blocked_ips ORDER BY created_at DESC');
    res.json({ blockedIps: result.rows });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.post('/admin/blocked-ips', async (req, res) => {
  if (!auth(req, res)) return;
  try {
    await pool.query('INSERT INTO blocked_ips (ip, note) VALUES ($1,$2) ON CONFLICT (ip) DO NOTHING', [req.body.ip, req.body.note||'']);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.delete('/admin/blocked-ips/:ip', async (req, res) => {
  if (!auth(req, res)) return;
  try {
    await pool.query('DELETE FROM blocked_ips WHERE ip=$1', [decodeURIComponent(req.params.ip)]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.get('/favorites', async (req, res) => {
  try {
    const result = await pool.query('SELECT photo_id FROM photo_favorites');
    res.json({ favorites: result.rows.map(r => r.photo_id) });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.post('/admin/favorites/:id', async (req, res) => {
  if (!auth(req, res)) return;
  try {
    await pool.query('INSERT INTO photo_favorites (photo_id) VALUES ($1) ON CONFLICT DO NOTHING', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.delete('/admin/favorites/:id', async (req, res) => {
  if (!auth(req, res)) return;
  try {
    await pool.query('DELETE FROM photo_favorites WHERE photo_id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.delete('/admin/analytics/test-data', async (req, res) => {
  if (!auth(req, res)) return;
  const patterns = ['::1','127.%','10.%','192.168.%','::ffff:127.%','::ffff:10.%','::ffff:192.168.%','::ffff:100.6%','::ffff:100.7%','::ffff:100.8%','::ffff:100.9%','::ffff:100.10%','::ffff:100.11%','::ffff:100.12%','100.6%','100.7%','100.8%','100.9%','100.10%','100.11%','100.12%'];
  const where = patterns.map((_,i) => `ip LIKE $${i+1}`).join(' OR ');
  try {
    const v = await pool.query(`DELETE FROM page_views WHERE ${where}`, patterns);
    const e = await pool.query(`DELETE FROM events WHERE ${where}`, patterns);
    res.json({ deleted: { pageViews: v.rowCount, events: e.rowCount } });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

module.exports = router;
