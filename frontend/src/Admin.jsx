import { useState, useEffect, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const ADMIN_PASSWORD = '0612';

const ALL_PHOTOS = [
  { id: 1, thumb: '/hero.jpg', title: 'Joshua Tree Sunset', location: 'Joshua Tree, California', category: 'landscapes', author: 'Kaitlin & Aiden' },
  { id: 2, thumb: '/norway-pano.jpg', title: 'Crater Lake', location: 'Crater Lake National Park, Oregon', category: 'landscapes', author: 'Kaitlin & Aiden' },
  { id: 3, thumb: '/reine.jpg', title: 'Reine', location: 'Lofoten, Norway', category: 'landscapes', author: 'Kaitlin & Aiden' },
  { id: 4, thumb: '/arches-eye.jpg', title: 'Arches Eye', location: 'Arches National Park, Utah', category: 'unique', author: 'Kaitlin & Aiden' },
  { id: 5, thumb: '/white-sands-sunset.jpg', title: 'White Sands Sunset', location: 'White Sands National Park, New Mexico', category: 'landscapes', author: 'Kaitlin & Aiden' },
  { id: 6, thumb: '/mesa-arch.jpg', title: 'Mesa Arch', location: 'Canyonlands National Park, Utah', category: 'unique', author: 'Kaitlin & Aiden' },
  { id: 7, thumb: '/south-kaibab-trail.jpg', title: 'South Kaibab Trail', location: 'Grand Canyon National Park, Arizona', category: 'landscapes', author: 'Kaitlin & Aiden' },
  { id: 8, thumb: '/horseshoe-bend.jpg', title: 'Horseshoe Bend', location: 'Page, Arizona', category: 'landscapes', author: 'Kaitlin & Aiden' },
  { id: 9, thumb: '/canyonlands-full.jpg', title: 'Canyonlands Full', location: 'Canyonlands National Park, Utah', category: 'landscapes', author: 'Kaitlin & Aiden' },
  { id: 10, thumb: '/canyonlands-focus.jpg', title: 'Canyonlands Focus', location: 'Canyonlands National Park, Utah', category: 'unique', author: 'Kaitlin & Aiden' },
  { id: 11, thumb: '/elk-tetons.jpg', title: 'Elk Tetons', location: 'Grand Teton National Park, Wyoming', category: 'wildlife', author: 'Kaitlin & Aiden' },
  { id: 12, thumb: '/south-rim-lookout.jpg', title: 'South Rim Lookout', location: 'Grand Canyon National Park, Arizona', category: 'unique', author: 'Kaitlin & Aiden' },
  { id: 13, thumb: '/desert-tower.jpg', title: 'Desert Tower', location: 'Utah', category: 'unique', author: 'Kaitlin & Aiden' },
  { id: 14, thumb: '/svolvaer.jpg', title: 'Svolvaer', location: 'Lofoten, Norway', category: 'landscapes', author: 'Kaitlin & Aiden' },
  { id: 15, thumb: '/half-dome.jpg', title: 'Half Dome', location: 'Yosemite National Park, California', category: 'landscapes', author: 'Kaitlin & Aiden' },
  { id: 16, thumb: '/yosemite-falls.jpg', title: 'Yosemite Falls', location: 'Yosemite National Park, California', category: 'landscapes', author: 'Kaitlin & Aiden' },
  { id: 17, thumb: '/pencil-botanical.jpg', title: 'Pencil Botanical', location: 'Atlanta Botanical Garden, Georgia', category: 'urban', author: 'Kaitlin & Aiden' },
  { id: 18, thumb: '/golden-joshua.jpg', title: 'Golden Joshua', location: 'Joshua Tree National Park, California', category: 'unique', author: 'Kaitlin & Aiden' },
  { id: 19, thumb: '/loen-hike.jpg', title: 'Loen Hike', location: 'Loen, Norway', category: 'unique', author: 'Kaitlin & Aiden' },
  { id: 20, thumb: '/reine-homes.jpg', title: 'Reine Homes', location: 'Reine, Lofoten, Norway', category: 'unique', author: 'Kaitlin & Aiden' },
  { id: 21, thumb: '/goat-rainier.jpg', title: 'Goat Rainier', location: 'Mount Rainier National Park, Washington', category: 'wildlife', author: 'Aiden' },
  { id: 22, thumb: '/rainier-peak.jpg', title: 'Rainier Peak', location: 'Mount Rainier National Park, Washington', category: 'landscapes', author: 'Aiden' },
  { id: 23, thumb: '/rainier-falls.jpg', title: 'Rainier Falls', location: 'Mount Rainier National Park, Washington', category: 'unique', author: 'Aiden' },
  { id: 24, thumb: '/delicate-arch.jpg', title: 'Delicate Arch', location: 'Arches National Park, Utah', category: 'unique', author: 'Kaitlin & Aiden' },
  { id: 25, thumb: '/hallgrimskirkja.jpg', title: 'Hallgrímskirkja', location: 'Reykjavik, Iceland', category: 'urban', author: 'Kaitlin & Aiden' },
];

const CHART_COLORS = ['#f59e0b', '#06b6d4', '#8b5cf6', '#10b981', '#f43f5e', '#6366f1'];

// Filter out internal/proxy IPs (Railway CGNAT, localhost, private ranges)
function isInternalIp(ip) {
  if (!ip || ip === 'unknown') return true;
  const clean = ip.replace(/^::ffff:/, '');
  if (clean === '::1' || clean === 'localhost') return true;
  if (/^127\./.test(clean)) return true;
  if (/^10\./.test(clean)) return true;
  if (/^192\.168\./.test(clean)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(clean)) return true;
  if (/^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(clean)) return true; // CGNAT
  return false;
}

function useChartData(pageViews, events) {
  return useMemo(() => {
    const viewsByDay = {};
    const uniqueByDay = {};
    const eventsByDay = {};
    const pathCounts = {};
    const eventTypeCounts = {};
    const uniqueIpsViews = new Set();
    const uniqueIpsEvents = new Set();

    pageViews.forEach((v) => {
      const day = v.timestamp ? v.timestamp.slice(0, 10) : '';
      viewsByDay[day] = (viewsByDay[day] || 0) + 1;
      pathCounts[v.path || '/'] = (pathCounts[v.path || '/'] || 0) + 1;
      if (!isInternalIp(v.ip)) {
        uniqueIpsViews.add(v.ip);
        if (!uniqueByDay[day]) uniqueByDay[day] = new Set();
        uniqueByDay[day].add(v.ip);
      }
    });

    const EVENT_LABELS = {
      click_reserve: 'Get in touch',
    };

    events.forEach((e) => {
      const day = e.timestamp ? e.timestamp.slice(0, 10) : '';
      eventsByDay[day] = (eventsByDay[day] || 0) + 1;
      const raw = e.eventName || 'other';
      const name = EVENT_LABELS[raw] || raw;
      eventTypeCounts[name] = (eventTypeCounts[name] || 0) + 1;
      if (!isInternalIp(e.ip)) uniqueIpsEvents.add(e.ip);
    });

    const viewsTimeSeries = Object.entries(viewsByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, views: count, fullDate: date }));

    const uniqueByDaySeries = Object.entries(uniqueByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, ips]) => ({ date, unique: ips.size }));

    const eventsTimeSeries = Object.entries(eventsByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, events: count, fullDate: date }));

    const topPaths = Object.entries(pathCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([path, count]) => ({ path: path.length > 20 ? path.slice(0, 20) + '…' : path, count, fullPath: path }));

    const eventTypePie = Object.entries(eventTypeCounts).map(([name, value], i) => ({
      name,
      value,
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }));

    return {
      viewsTimeSeries,
      uniqueByDaySeries,
      eventsTimeSeries,
      topPaths,
      eventTypePie,
      uniqueViews: uniqueIpsViews.size,
      uniqueEvents: uniqueIpsEvents.size,
    };
  }, [pageViews, events]);
}

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pageViews, setPageViews] = useState([]);
  const [events, setEvents] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTables, setShowTables] = useState(false);
  const [activeTab, setActiveTab] = useState('analytics');
  const [locationFilter, setLocationFilter] = useState('');
  const [blockedIps, setBlockedIps] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [authorVisibility, setAuthorVisibility] = useState({});

  const knownAuthors = useMemo(() => {
    const seen = new Set(ALL_PHOTOS.map(p => p.author));
    Object.keys(authorVisibility).forEach(a => seen.add(a));
    return [...seen].sort();
  }, [authorVisibility]);

  const blockedIpSet = useMemo(() => new Set(blockedIps.map(b => b.ip)), [blockedIps]);

  const blockIp = (ip, note = '') => {
    fetch(`${API_URL}/admin/blocked-ips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer 0612' },
      body: JSON.stringify({ ip, note }),
    }).then(() => setBlockedIps(prev => [...prev.filter(b => b.ip !== ip), { ip, note, createdAt: new Date().toISOString() }]));
  };

  const unblockIp = (ip) => {
    fetch(`${API_URL}/admin/blocked-ips/${encodeURIComponent(ip)}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer 0612' },
    }).then(() => setBlockedIps(prev => prev.filter(b => b.ip !== ip)));
  };

  const filteredViews = useMemo(() => {
    let views = pageViews.filter(v => !isInternalIp(v.ip) && !blockedIpSet.has(v.ip));
    if (locationFilter) {
      views = views.filter(v => {
        const loc = v.city && v.country ? `${v.city}, ${v.country}` : v.country || '';
        return loc === locationFilter;
      });
    }
    return views;
  }, [pageViews, locationFilter, blockedIpSet]);

  const filteredEvents = useMemo(() => events.filter(e => !blockedIpSet.has(e.ip)), [events, blockedIpSet]);
  const chartData = useChartData(filteredViews, filteredEvents);

  useEffect(() => {
    if (sessionStorage.getItem('adminAuth') === 'true') {
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    setLoading(true);
    Promise.all([
      fetch(`${API_URL}/admin/analytics`, { headers: { Authorization: 'Bearer 0612' } }),
      fetch(`${API_URL}/admin/contacts`, { headers: { Authorization: 'Bearer 0612' } }),
      fetch(`${API_URL}/admin/blocked-ips`, { headers: { Authorization: 'Bearer 0612' } }),
      fetch(`${API_URL}/favorites`),
      fetch(`${API_URL}/author-visibility`),
    ])
      .then(async ([analyticsRes, contactsRes, blockedRes, favRes, authorRes]) => {
        if (analyticsRes.status === 401) {
          sessionStorage.removeItem('adminAuth');
          setAuthenticated(false);
          throw new Error('Session expired');
        }
        const analyticsData = await analyticsRes.json();
        const contactsData = await contactsRes.json();
        const blockedData = await blockedRes.json();
        const favData = await favRes.json();
        const authorData = await authorRes.json();
        setPageViews(analyticsData.pageViews || []);
        setEvents(analyticsData.events || []);
        setContacts(contactsData.contacts || []);
        setBlockedIps(blockedData.blockedIps || []);
        setFavoriteIds(new Set(favData.favorites || []));
        const av = {};
        (authorData.authors || []).forEach(a => { av[a.author] = a.visible; });
        setAuthorVisibility(av);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [authenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('adminAuth', 'true');
      setAuthenticated(true);
      setPassword('');
    } else {
      setError('Incorrect password');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    setAuthenticated(false);
  };

  const refreshData = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API_URL}/admin/analytics`, { headers: { Authorization: 'Bearer 0612' } }),
      fetch(`${API_URL}/admin/contacts`, { headers: { Authorization: 'Bearer 0612' } }),
      fetch(`${API_URL}/admin/blocked-ips`, { headers: { Authorization: 'Bearer 0612' } }),
      fetch(`${API_URL}/favorites`),
      fetch(`${API_URL}/author-visibility`),
    ])
      .then(async ([analyticsRes, contactsRes, blockedRes, favRes, authorRes]) => {
        const analyticsData = await analyticsRes.json();
        const contactsData = await contactsRes.json();
        const blockedData = await blockedRes.json();
        const favData = await favRes.json();
        const authorData = await authorRes.json();
        setPageViews(analyticsData.pageViews || []);
        setEvents(analyticsData.events || []);
        setContacts(contactsData.contacts || []);
        setBlockedIps(blockedData.blockedIps || []);
        setFavoriteIds(new Set(favData.favorites || []));
        const av = {};
        (authorData.authors || []).forEach(a => { av[a.author] = a.visible; });
        setAuthorVisibility(av);
      })
      .finally(() => setLoading(false));
  };

  const toggleFavorite = (photoId) => {
    const isFav = favoriteIds.has(photoId);
    const method = isFav ? 'DELETE' : 'POST';
    fetch(`${API_URL}/admin/favorites/${photoId}`, {
      method,
      headers: { Authorization: 'Bearer 0612' },
    }).then(() => {
      setFavoriteIds(prev => {
        const next = new Set(prev);
        isFav ? next.delete(photoId) : next.add(photoId);
        return next;
      });
    });
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-700">
          <h1 className="text-2xl font-bold text-white mb-2">Admin Login</h1>
          <p className="text-slate-400 text-sm mb-6">Photography portfolio analytics</p>
          <label className="block text-slate-300 text-sm font-medium mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Enter password"
            autoFocus
          />
          {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="mt-6 w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-lg transition"
          >
            Log in
          </button>
        </form>
      </div>
    );
  }

  const publicViews = pageViews.filter(v => !isInternalIp(v.ip) && !blockedIpSet.has(v.ip));
  const conversionRate = publicViews.length > 0
    ? Math.min(((filteredEvents.length / publicViews.length) * 100), 100).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Photography Admin</h1>
              <p className="text-slate-400 text-sm mt-0.5">Analytics, traffic, and contact submissions</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={refreshData}
                disabled={loading}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium disabled:opacity-50 transition"
              >
                {loading ? 'Loading…' : 'Refresh'}
              </button>
              <button
                onClick={() => {
                  if (!confirm('Delete all internal/test IP rows from analytics? Real visitor data will be kept.')) return;
                  fetch(`${API_URL}/admin/analytics/test-data`, {
                    method: 'DELETE',
                    headers: { Authorization: 'Bearer 0612' },
                  })
                    .then(r => r.json())
                    .then(d => {
                      alert(`Cleared ${d.deleted?.pageViews ?? 0} page views and ${d.deleted?.events ?? 0} events.`);
                      refreshData();
                    });
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-red-900/60 hover:text-red-300 rounded-lg text-sm font-medium transition"
              >
                Clear test data
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition"
              >
                Log out
              </button>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'analytics' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${activeTab === 'contacts' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
            >
              Contacts
              {contacts.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'contacts' ? 'bg-slate-900/30 text-slate-900' : 'bg-emerald-500 text-white'}`}>
                  {contacts.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'photos' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
            >
              Photos
            </button>
            <button
              onClick={() => setActiveTab('authors')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'authors' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
            >
              Authors
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'contacts' && (
          <div>
            {/* Contacts KPI */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-800/80 rounded-xl border border-slate-700/50 p-5">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Contacts</p>
                <p className="text-2xl font-bold mt-1 text-emerald-400">{contacts.length}</p>
                <p className="text-slate-500 text-xs mt-1">Form submissions</p>
              </div>
              <div className="bg-slate-800/80 rounded-xl border border-slate-700/50 p-5">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">With Phone</p>
                <p className="text-2xl font-bold mt-1 text-amber-400">{contacts.filter(c => c.phone).length}</p>
                <p className="text-slate-500 text-xs mt-1">Provided phone number</p>
              </div>
              <div className="bg-slate-800/80 rounded-xl border border-slate-700/50 p-5">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Latest</p>
                <p className="text-2xl font-bold mt-1 text-cyan-400">
                  {contacts.length > 0 ? new Date(contacts[0].timestamp).toLocaleDateString() : '—'}
                </p>
                <p className="text-slate-500 text-xs mt-1">Most recent submission</p>
              </div>
            </div>

            {/* Contacts Table */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-300">All Contact Submissions</h2>
                {contacts.length > 0 && (
                  <button
                    onClick={() => {
                      const emails = contacts.map(c => c.email).join('\n');
                      navigator.clipboard.writeText(emails);
                    }}
                    className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition"
                  >
                    Copy all emails
                  </button>
                )}
              </div>
              {contacts.length === 0 ? (
                <p className="p-8 text-slate-500 text-sm text-center">No contact submissions yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 bg-slate-800/50">
                        <th className="p-3 font-medium text-slate-400">Date</th>
                        <th className="p-3 font-medium text-slate-400">Email</th>
                        <th className="p-3 font-medium text-slate-400">Name</th>
                        <th className="p-3 font-medium text-slate-400">Phone</th>
                        <th className="p-3 font-medium text-slate-400">Status</th>
                        <th className="p-3 font-medium text-slate-400"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.map((c) => (
                        <ContactRow
                          key={c.id}
                          contact={c}
                          onStatusChange={(id, status) => {
                            fetch(`${API_URL}/admin/contacts/${id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json', Authorization: 'Bearer 0612' },
                              body: JSON.stringify({ status }),
                            }).then(() => {
                              setContacts((prev) => prev.map((x) => x.id === id ? { ...x, status } : x));
                            });
                          }}
                          onDelete={(id) => {
                            if (!confirm('Delete this contact?')) return;
                            fetch(`${API_URL}/admin/contacts/${id}`, {
                              method: 'DELETE',
                              headers: { Authorization: 'Bearer 0612' },
                            }).then(() => {
                              setContacts((prev) => prev.filter((x) => x.id !== id));
                            });
                          }}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
        <div>
        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/80 rounded-xl border border-slate-700/50 p-5">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Page views</p>
            <p className="text-2xl font-bold mt-1 text-white">{publicViews.length}</p>
            <p className="text-slate-500 text-xs mt-1">Real visitors only</p>
          </div>
          <div className="bg-slate-800/80 rounded-xl border border-slate-700/50 p-5">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Get in touch clicks</p>
            <p className="text-2xl font-bold mt-1 text-amber-400">{filteredEvents.length}</p>
            <p className="text-slate-500 text-xs mt-1">Form opened</p>
          </div>
          <div className="bg-slate-800/80 rounded-xl border border-slate-700/50 p-5">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Unique visitors</p>
            <p className="text-2xl font-bold mt-1 text-cyan-400">{chartData.uniqueViews}</p>
            <p className="text-slate-500 text-xs mt-1">By IP, public only</p>
          </div>
          <div className="bg-slate-800/80 rounded-xl border border-slate-700/50 p-5">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Get in touch rate</p>
            <p className="text-2xl font-bold mt-1 text-emerald-400">{conversionRate}%</p>
            <p className="text-slate-500 text-xs mt-1">Clicks / page views</p>
          </div>
        </div>

        {/* Charts row 1 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
            <h2 className="text-sm font-semibold text-slate-300 mb-4">Page views over time</h2>
            {chartData.viewsTimeSeries.length === 0 ? (
              <p className="text-slate-500 text-sm h-[220px] flex items-center justify-center">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData.viewsTimeSeries} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} stroke="#475569" />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} stroke="#475569" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                    labelStyle={{ color: '#cbd5e1' }}
                    formatter={(value) => [value, 'Views']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area type="monotone" dataKey="views" stroke="#f59e0b" fill="url(#viewsGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
            <h2 className="text-sm font-semibold text-slate-300 mb-4">Get in touch clicks over time</h2>
            {chartData.eventsTimeSeries.length === 0 ? (
              <p className="text-slate-500 text-sm h-[220px] flex items-center justify-center">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData.eventsTimeSeries} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} stroke="#475569" />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} stroke="#475569" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                    formatter={(value) => [value, 'Clicks']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Bar dataKey="events" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Clicks" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Unique visitors by day */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5 mb-8">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Unique visitors by day</h2>
          {chartData.uniqueByDaySeries.length === 0 ? (
            <p className="text-slate-500 text-sm h-[180px] flex items-center justify-center">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData.uniqueByDaySeries} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="uniqueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} stroke="#475569" />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} stroke="#475569" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  labelStyle={{ color: '#cbd5e1' }}
                  formatter={(value) => [value, 'Unique visitors']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area type="monotone" dataKey="unique" stroke="#06b6d4" fill="url(#uniqueGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Charts row 2 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
            <h2 className="text-sm font-semibold text-slate-300 mb-4">Top pages (by views)</h2>

            {chartData.topPaths.length === 0 ? (
              <p className="text-slate-500 text-sm h-[220px] flex items-center justify-center">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={chartData.topPaths}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} stroke="#475569" allowDecimals={false} />
                  <YAxis type="category" dataKey="path" tick={{ fill: '#94a3b8', fontSize: 11 }} stroke="#475569" width={80} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                    formatter={(value) => [value, 'Views']}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullPath ?? ''}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Views" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
            <h2 className="text-sm font-semibold text-slate-300 mb-4">Events by type</h2>
            {chartData.eventTypePie.length === 0 ? (
              <p className="text-slate-500 text-sm h-[220px] flex items-center justify-center">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={chartData.eventTypePie}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {chartData.eventTypePie.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} stroke="#1e293b" strokeWidth={1} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                    formatter={(value, name) => [value, name]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Visitor Locations */}
        {(() => {
          const locationCounts = {};
          pageViews.filter(v => !isInternalIp(v.ip)).forEach((v) => {
            if (v.country) {
              const key = v.city ? `${v.city}, ${v.country}` : v.country;
              locationCounts[key] = (locationCounts[key] || 0) + 1;
            }
          });
          const topLocations = Object.entries(locationCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([location, count]) => ({ location, count }));

          return topLocations.length > 0 ? (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-300">Visitor locations</h2>
                <div className="flex items-center gap-2">
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="text-xs bg-slate-700 border border-slate-600 text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="">All locations</option>
                    {topLocations.map(({ location }) => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                  {locationFilter && (
                    <button
                      onClick={() => setLocationFilter('')}
                      className="text-xs text-slate-400 hover:text-white transition"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                {topLocations.map(({ location, count }, i) => (
                  <button
                    key={i}
                    onClick={() => setLocationFilter(locationFilter === location ? '' : location)}
                    className={`w-full flex items-center gap-3 rounded-lg px-2 py-1 transition ${locationFilter === location ? 'bg-amber-500/10 ring-1 ring-amber-500/30' : 'hover:bg-slate-700/30'}`}
                  >
                    <span className="text-slate-400 text-sm w-48 truncate text-left">{location}</span>
                    <div className="flex-1 bg-slate-700/50 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${locationFilter === location ? 'bg-amber-400' : 'bg-amber-500'}`}
                        style={{ width: `${(count / topLocations[0].count) * 100}%` }}
                      />
                    </div>
                    <span className="text-slate-300 text-sm font-medium w-8 text-right">{count}</span>
                  </button>
                ))}
              </div>
              {locationFilter && (
                <p className="text-xs text-amber-400 mt-3">Filtering all charts by: <strong>{locationFilter}</strong></p>
              )}
            </div>
          ) : null;
        })()}

        {/* Blocked IPs */}
        {blockedIps.length > 0 && (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5 mb-8">
            <h2 className="text-sm font-semibold text-slate-300 mb-3">Blocked IPs ({blockedIps.length})</h2>
            <div className="flex flex-wrap gap-2">
              {blockedIps.map((b) => (
                <div key={b.ip} className="flex items-center gap-2 bg-red-900/20 border border-red-800/30 rounded-lg px-3 py-1.5">
                  <span className="font-mono text-xs text-red-300">{b.ip}</span>
                  <button
                    onClick={() => unblockIp(b.ip)}
                    className="text-slate-500 hover:text-white transition text-xs"
                    title="Unblock"
                  >✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detail tables (collapsible) */}
        <div className="border border-slate-700/50 rounded-xl overflow-hidden bg-slate-800/30">
          <button
            type="button"
            onClick={() => setShowTables((s) => !s)}
            className="w-full px-5 py-4 flex items-center justify-between text-left text-sm font-semibold text-slate-300 hover:bg-slate-800/50 transition"
          >
            {showTables ? 'Hide' : 'Show'} raw data (page views & events)
            <span className="text-slate-500">{showTables ? '▼' : '▶'}</span>
          </button>
          {showTables && (
            <div className="border-t border-slate-700/50 divide-y divide-slate-700/50">
              <section className="p-4">
                <h3 className="text-sm font-medium text-slate-400 mb-3">Page views</h3>
                <div className="overflow-x-auto rounded-lg border border-slate-700/50">
                  {pageViews.length === 0 ? (
                    <p className="p-4 text-slate-500 text-sm">No page views recorded yet.</p>
                  ) : (
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-700 bg-slate-800/50">
                          <th className="p-3 font-medium text-slate-400">Time</th>
                          <th className="p-3 font-medium text-slate-400">Path</th>
                          <th className="p-3 font-medium text-slate-400">Location</th>
                          <th className="p-3 font-medium text-slate-400">IP</th>
                          <th className="p-3 font-medium text-slate-400 hidden md:table-cell">User agent</th>
                          <th className="p-3 font-medium text-slate-400 hidden lg:table-cell">Referrer</th>
                          <th className="p-3 font-medium text-slate-400"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...pageViews].reverse().slice(0, 50).map((v, i) => (
                          <tr key={i} className="border-b border-slate-700/30 group">
                            <td className="p-3 text-slate-300">{new Date(v.timestamp).toLocaleString()}</td>
                            <td className="p-3">{v.path || '/'}</td>
                            <td className="p-3 text-slate-300">{v.city && v.country ? `${v.city}, ${v.country}` : v.country || '—'}</td>
                            <td className="p-3 font-mono text-amber-400/90">{v.ip}</td>
                            <td className="p-3 text-slate-500 hidden md:table-cell max-w-xs truncate" title={v.userAgent}>{v.userAgent}</td>
                            <td className="p-3 text-slate-500 hidden lg:table-cell max-w-xs truncate" title={v.referrer}>{v.referrer || '—'}</td>
                            <td className="p-3">
                              {blockedIpSet.has(v.ip) ? (
                                <button onClick={() => unblockIp(v.ip)} className="text-xs text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded hover:bg-emerald-400/10 transition whitespace-nowrap">Unblock</button>
                              ) : (
                                <button onClick={() => blockIp(v.ip, 'Blocked from analytics')} className="text-xs text-slate-500 hover:text-red-400 px-2 py-1 rounded hover:bg-red-400/10 transition opacity-0 group-hover:opacity-100 whitespace-nowrap">Block IP</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {pageViews.length > 50 && (
                    <p className="p-3 text-slate-500 text-xs border-t border-slate-700/30">Showing latest 50 of {pageViews.length}</p>
                  )}
                </div>
              </section>
              <section className="p-4">
                <h3 className="text-sm font-medium text-slate-400 mb-3">Events (get in touch clicks)</h3>
                <div className="overflow-x-auto rounded-lg border border-slate-700/50">
                  {events.length === 0 ? (
                    <p className="p-4 text-slate-500 text-sm">No events recorded yet.</p>
                  ) : (
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-700 bg-slate-800/50">
                          <th className="p-3 font-medium text-slate-400">Time</th>
                          <th className="p-3 font-medium text-slate-400">Event</th>
                          <th className="p-3 font-medium text-slate-400">IP</th>
                          <th className="p-3 font-medium text-slate-400 hidden md:table-cell">Path</th>
                          <th className="p-3 font-medium text-slate-400 hidden lg:table-cell">User agent</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...events].reverse().slice(0, 50).map((e, i) => (
                          <tr key={i} className="border-b border-slate-700/30">
                            <td className="p-3 text-slate-300">{new Date(e.timestamp).toLocaleString()}</td>
                            <td className="p-3 text-amber-400/90 font-medium">{e.eventName || '—'}</td>
                            <td className="p-3 font-mono">{e.ip}</td>
                            <td className="p-3 text-slate-500 hidden md:table-cell">{e.path || '—'}</td>
                            <td className="p-3 text-slate-500 hidden lg:table-cell max-w-xs truncate" title={e.userAgent}>{e.userAgent}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {events.length > 50 && (
                    <p className="p-3 text-slate-500 text-xs border-t border-slate-700/30">Showing latest 50 of {events.length}</p>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
        </div>
        )}

        {activeTab === 'authors' && (
          <div>
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white">Author Visibility</h2>
              <p className="text-slate-400 text-sm mt-1">Toggle an author off to hide all of their photos from the public site.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {knownAuthors.map((author) => {
                const isVisible = authorVisibility[author] !== false;
                const photoCount = ALL_PHOTOS.filter(p => p.author === author).length;
                return (
                  <div
                    key={author}
                    className={`bg-slate-800/80 rounded-xl border p-5 flex items-center justify-between gap-4 transition ${isVisible ? 'border-slate-700/50' : 'border-slate-700/30 opacity-60'}`}
                  >
                    <div>
                      <p className="text-white font-semibold">{author}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{photoCount} photo{photoCount !== 1 ? 's' : ''}</p>
                      <p className={`text-xs font-medium mt-1 ${isVisible ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {isVisible ? 'Visible on site' : 'Hidden from site'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const newVisible = !isVisible;
                        fetch(`${API_URL}/admin/author-visibility`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer 0612' },
                          body: JSON.stringify({ author, visible: newVisible }),
                        })
                          .then(r => r.json())
                          .then(data => {
                            if (data.ok) {
                              setAuthorVisibility(prev => ({ ...prev, [author]: newVisible }));
                            }
                          })
                          .catch(() => {});
                      }}
                      className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isVisible ? 'bg-amber-500' : 'bg-slate-600'}`}
                      role="switch"
                      aria-checked={isVisible}
                      title={isVisible ? 'Hide this author' : 'Show this author'}
                    >
                      <span
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isVisible ? 'translate-x-5' : 'translate-x-0'}`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 bg-slate-800/40 rounded-xl border border-slate-700/30 p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Photos by Author</h3>
              <div className="space-y-2">
                {knownAuthors.map(author => {
                  const photos = ALL_PHOTOS.filter(p => p.author === author);
                  const isVisible = authorVisibility[author] !== false;
                  return (
                    <div key={author} className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isVisible ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                      <span className="text-slate-300 text-sm font-medium w-40 truncate">{author}</span>
                      <div className="flex flex-wrap gap-1">
                        {photos.map(p => (
                          <span key={p.id} className="text-xs bg-slate-700/60 text-slate-400 px-2 py-0.5 rounded capitalize">{p.title}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'photos' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Manage Favorites</h2>
                <p className="text-slate-400 text-sm mt-1">Click the star to add or remove a photo from the Favorites category.</p>
              </div>
              <div className="bg-slate-800/80 rounded-xl border border-slate-700/50 px-4 py-2 text-center">
                <p className="text-2xl font-bold text-amber-400">{favoriteIds.size}</p>
                <p className="text-xs text-slate-400">Favorites</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {ALL_PHOTOS.map((photo) => {
                const isFav = favoriteIds.has(photo.id);
                return (
                  <div key={photo.id} className="relative group bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={photo.thumb}
                        alt={photo.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-white truncate">{photo.title}</p>
                      <p className="text-xs text-slate-400 truncate">{photo.location}</p>
                      <p className="text-xs text-slate-500 mt-0.5 capitalize">{photo.category}</p>
                    </div>
                    <button
                      onClick={() => toggleFavorite(photo.id)}
                      className={`absolute top-2 right-2 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-lg ${
                        isFav
                          ? 'bg-amber-500 text-slate-900 hover:bg-amber-400'
                          : 'bg-slate-900/70 text-slate-400 hover:bg-slate-800 hover:text-amber-400'
                      }`}
                      title={isFav ? 'Remove from Favorites' : 'Add to Favorites'}
                    >
                      <svg className="w-5 h-5" fill={isFav ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { value: 'emailed', label: 'Emailed', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  { value: 'complete', label: 'Complete', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { value: 'not_interested', label: 'Not Interested', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
];

function ContactRow({ contact: c, onStatusChange, onDelete }) {
  const current = STATUS_OPTIONS.find((s) => s.value === (c.status || 'new')) || STATUS_OPTIONS[0];

  return (
    <tr className="border-b border-slate-700/30 hover:bg-slate-800/40 transition group">
      <td className="p-3 text-slate-400 whitespace-nowrap">{new Date(c.timestamp).toLocaleString()}</td>
      <td className="p-3 text-amber-400 font-medium">{c.email}</td>
      <td className="p-3 text-slate-300">{[c.firstName, c.lastName].filter(Boolean).join(' ') || '—'}</td>
      <td className="p-3 text-slate-300">{c.phone || '—'}</td>
      <td className="p-3">
        <select
          value={c.status || 'new'}
          onChange={(e) => onStatusChange(c.id, e.target.value)}
          className={`text-xs font-semibold px-2 py-1 rounded-lg border bg-transparent cursor-pointer focus:outline-none ${current.color}`}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value} className="bg-slate-800 text-white">
              {s.label}
            </option>
          ))}
        </select>
      </td>
      <td className="p-3">
        <button
          onClick={() => onDelete(c.id)}
          className="opacity-0 group-hover:opacity-100 transition text-slate-500 hover:text-red-400 text-xs px-2 py-1 rounded hover:bg-red-400/10"
          title="Delete contact"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
