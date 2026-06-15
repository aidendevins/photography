import { useState } from 'react';
import './index.css';

const PASSWORD = '0612';

const HIDDEN_PHOTOS = [
  // Add photos here in the same format:
  // { id: 1, src: '/filename.jpg', title: 'Title', location: 'Location', category: 'Category' },
];

export default function Hidden() {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem('hiddenAuth') === 'true'
  );
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === PASSWORD) {
      sessionStorage.setItem('hiddenAuth', 'true');
      setAuthenticated(true);
      setPassword('');
    } else {
      setError('Incorrect password');
    }
  };

  const navigateLightbox = (direction) => {
    if (!lightboxPhoto) return;
    const currentIndex = HIDDEN_PHOTOS.findIndex(p => p.id === lightboxPhoto.id);
    const nextIndex = (currentIndex + direction + HIDDEN_PHOTOS.length) % HIDDEN_PHOTOS.length;
    setLightboxPhoto(HIDDEN_PHOTOS[nextIndex]);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-white/5 border border-white/10 p-8">
          <h1 className="text-2xl font-light tracking-tight text-white mb-2">Private Gallery</h1>
          <p className="text-white/40 text-sm mb-6">This page is password protected.</p>
          <label className="block text-white/60 text-sm mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-amber-400 outline-none transition text-white placeholder-white/20 mb-4"
            placeholder="Enter password"
            autoFocus
          />
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-medium tracking-wider uppercase transition text-sm"
          >
            Enter
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="px-6 py-6 border-b border-white/10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light tracking-tight">Private Gallery</h1>
          <p className="text-white/40 text-sm mt-0.5">{HIDDEN_PHOTOS.length} photo{HIDDEN_PHOTOS.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-4">
          <a href="/" className="text-sm text-white/50 hover:text-white transition">← Back to site</a>
          <button
            onClick={() => { sessionStorage.removeItem('hiddenAuth'); setAuthenticated(false); }}
            className="text-sm text-white/50 hover:text-white transition"
          >
            Lock
          </button>
        </div>
      </header>

      <main className="px-6 py-12 max-w-7xl mx-auto">
        {HIDDEN_PHOTOS.length === 0 ? (
          <div className="text-center py-32 text-white/30">
            <p className="text-lg font-light">No photos yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {HIDDEN_PHOTOS.map((photo) => (
              <button
                key={photo.id}
                onClick={() => setLightboxPhoto(photo)}
                className="group relative aspect-[4/3] overflow-hidden bg-white/5"
              >
                <img
                  src={photo.src}
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <h3 className="text-lg font-light">{photo.title}</h3>
                  <p className="text-sm text-white/60">{photo.location}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-6 right-6 p-2 text-white/60 hover:text-white transition z-10"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
            className="absolute left-4 md:left-8 p-2 text-white/60 hover:text-white transition"
          >
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
            className="absolute right-4 md:right-8 p-2 text-white/60 hover:text-white transition"
          >
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div
            className="max-w-[90vw] max-h-[85vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxPhoto.src}
              alt={lightboxPhoto.title}
              className="max-w-full max-h-[85vh] object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <h3 className="text-xl font-light">{lightboxPhoto.title}</h3>
              <p className="text-white/60">{lightboxPhoto.location}</p>
            </div>
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-sm">
            {HIDDEN_PHOTOS.findIndex(p => p.id === lightboxPhoto.id) + 1} / {HIDDEN_PHOTOS.length}
          </div>
        </div>
      )}
    </div>
  );
}
