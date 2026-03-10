import { useState, useEffect, useRef } from 'react';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const PHOTOS = [
  { id: 1, src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600', thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600', title: 'Alpine Sunrise', location: 'Swiss Alps', category: 'landscapes' },
  { id: 2, src: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=1600', thumb: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=600', title: 'Lion at Dusk', location: 'Serengeti, Tanzania', category: 'wildlife' },
  { id: 3, src: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1600', thumb: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600', title: 'Kyoto Serenity', location: 'Kyoto, Japan', category: 'travel' },
  { id: 4, src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600', thumb: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600', title: 'Misty Valley', location: 'Dolomites, Italy', category: 'landscapes' },
  { id: 5, src: 'https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=1600', thumb: 'https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=600', title: 'Arctic Fox', location: 'Iceland', category: 'wildlife' },
  { id: 6, src: 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=1600', thumb: 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=600', title: 'Havana Streets', location: 'Havana, Cuba', category: 'travel' },
  { id: 7, src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600', thumb: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600', title: 'Mountain Majesty', location: 'Patagonia, Argentina', category: 'landscapes' },
  { id: 8, src: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=1600', thumb: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=600', title: 'Elephant Crossing', location: 'Botswana', category: 'wildlife' },
  { id: 9, src: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1600', thumb: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600', title: 'Roman Colosseum', location: 'Rome, Italy', category: 'travel' },
  { id: 10, src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600', thumb: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600', title: 'Lakeside Reflection', location: 'New Zealand', category: 'landscapes' },
  { id: 11, src: 'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=1600', thumb: 'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=600', title: 'Hummingbird', location: 'Costa Rica', category: 'wildlife' },
  { id: 12, src: 'https://images.unsplash.com/photo-1513415277900-a62401e19be4?w=1600', thumb: 'https://images.unsplash.com/photo-1513415277900-a62401e19be4?w=600', title: 'Marrakech Medina', location: 'Morocco', category: 'travel' },
];

const HERO_IMAGE = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2000';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'landscapes', label: 'Landscapes' },
  { id: 'wildlife', label: 'Wildlife' },
  { id: 'travel', label: 'Travel' },
];

export default function App() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [formData, setFormData] = useState({ email: '', message: '' });
  const [formStatus, setFormStatus] = useState({ loading: false, success: false, error: '' });
  const [heroLoaded, setHeroLoaded] = useState(false);
  
  const galleryRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/analytics/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: window.location.pathname, referrer: document.referrer }),
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = HERO_IMAGE;
    img.onload = () => setHeroLoaded(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxPhoto) return;
      if (e.key === 'Escape') setLightboxPhoto(null);
      if (e.key === 'ArrowRight') navigateLightbox(1);
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxPhoto, activeCategory]);

  const filteredPhotos = activeCategory === 'all' 
    ? PHOTOS 
    : PHOTOS.filter(p => p.category === activeCategory);

  const navigateLightbox = (direction) => {
    if (!lightboxPhoto) return;
    const currentIndex = filteredPhotos.findIndex(p => p.id === lightboxPhoto.id);
    const nextIndex = (currentIndex + direction + filteredPhotos.length) % filteredPhotos.length;
    setLightboxPhoto(filteredPhotos[nextIndex]);
  };

  const scrollTo = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ loading: true, success: false, error: '' });
    
    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, message: formData.message }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setFormStatus({ loading: false, success: true, error: '' });
        setFormData({ email: '', message: '' });
      } else {
        setFormStatus({ loading: false, success: false, error: data.error || 'Something went wrong' });
      }
    } catch {
      setFormStatus({ loading: false, success: false, error: 'Failed to send. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${heroLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black" />
        
        <div className="relative z-10 text-center px-6">
          <h1 className={`text-5xl md:text-7xl lg:text-8xl font-light tracking-tight mb-4 transition-all duration-1000 delay-300 ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Aiden Devins
          </h1>
          <p className={`text-lg md:text-xl text-white/70 font-light tracking-widest uppercase transition-all duration-1000 delay-500 ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Photography
          </p>
          <div className={`mt-8 flex items-center justify-center gap-6 transition-all duration-1000 delay-700 ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <button 
              onClick={() => scrollTo(galleryRef)}
              className="px-8 py-3 border border-white/30 hover:border-amber-400 hover:text-amber-400 transition-all duration-300 text-sm tracking-widest uppercase"
            >
              View Gallery
            </button>
            <button 
              onClick={() => scrollTo(contactRef)}
              className="px-8 py-3 bg-amber-500/90 hover:bg-amber-400 text-black transition-all duration-300 text-sm tracking-widest uppercase font-medium"
            >
              Get Prints
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-1000 ${heroLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <button 
            onClick={() => scrollTo(galleryRef)}
            className="flex flex-col items-center gap-2 text-white/50 hover:text-white transition group"
          >
            <span className="text-xs tracking-widest uppercase">Scroll</span>
            <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="absolute top-0 left-0 right-0 z-20 px-6 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <a href="/" className="text-lg font-light tracking-wider">AD</a>
            <div className="hidden md:flex items-center gap-8 text-sm text-white/70">
              <button onClick={() => scrollTo(galleryRef)} className="hover:text-white transition">Gallery</button>
              <button onClick={() => scrollTo(aboutRef)} className="hover:text-white transition">About</button>
              <button onClick={() => scrollTo(contactRef)} className="hover:text-white transition">Contact</button>
            </div>
          </div>
        </nav>
      </section>

      {/* Gallery Section */}
      <section ref={galleryRef} className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-4">The Collection</h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Capturing moments across landscapes, wildlife, and cultures from around the world.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center justify-center gap-2 md:gap-4 mb-12 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2 text-sm tracking-wider uppercase transition-all duration-300 ${
                  activeCategory === cat.id
                    ? 'bg-amber-500 text-black'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPhotos.map((photo, index) => (
              <button
                key={photo.id}
                onClick={() => setLightboxPhoto(photo)}
                className="group relative aspect-[4/3] overflow-hidden bg-white/5"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <img
                  src={photo.thumb}
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
        </div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="aspect-[3/4] bg-white/5 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800"
              alt="Aiden Devins"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-amber-400 text-sm tracking-widest uppercase mb-4">About the Photographer</p>
            <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-6">
              Capturing the World,<br />One Frame at a Time
            </h2>
            <div className="space-y-4 text-white/70 leading-relaxed">
              <p>
                I'm Aiden Devins, a landscape and wildlife photographer based in Colorado. 
                For over a decade, I've traveled to some of the most remote corners of our planet, 
                driven by a passion to document the raw beauty of nature.
              </p>
              <p>
                My work focuses on the intersection of light, land, and life — from the golden hour 
                glow over mountain peaks to intimate wildlife encounters in their natural habitats. 
                Each image tells a story of patience, persistence, and the profound connection 
                between photographer and subject.
              </p>
              <p>
                My photographs have been featured in National Geographic, BBC Wildlife, and various 
                conservation publications. When I'm not behind the lens, I lead photography 
                workshops and advocate for wildlife conservation.
              </p>
            </div>
            <button 
              onClick={() => scrollTo(contactRef)}
              className="mt-8 px-6 py-3 border border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black transition-all duration-300 text-sm tracking-widest uppercase"
            >
              Get in Touch
            </button>
          </div>
        </div>
      </section>

      {/* Prints & Licensing Section */}
      <section ref={contactRef} className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amber-400 text-sm tracking-widest uppercase mb-4">Prints & Licensing</p>
            <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-6">
              Bring Nature Into Your Space
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              All images are available as museum-quality fine art prints on archival paper or metal, 
              as well as for commercial licensing. Fill out the form below to inquire.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white/5 p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Fine Art Prints</h3>
              <p className="text-sm text-white/50">Archival quality prints on Hahnemühle paper or aluminum.</p>
            </div>
            <div className="bg-white/5 p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Limited Editions</h3>
              <p className="text-sm text-white/50">Signed and numbered editions with certificate of authenticity.</p>
            </div>
            <div className="bg-white/5 p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Commercial Licensing</h3>
              <p className="text-sm text-white/50">Usage rights for editorial, advertising, and corporate projects.</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="max-w-xl mx-auto">
            {formStatus.success ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-8 text-center">
                <svg className="w-12 h-12 mx-auto text-emerald-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="text-xl font-medium mb-2">Message Sent!</h3>
                <p className="text-white/60">Thanks for reaching out. I'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm text-white/70 mb-2">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-amber-400 outline-none transition text-white placeholder-white/30"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm text-white/70 mb-2">Message</label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-amber-400 outline-none transition text-white placeholder-white/30 resize-none"
                    placeholder="Tell me about the print or licensing you're interested in..."
                  />
                </div>
                {formStatus.error && (
                  <p className="text-red-400 text-sm">{formStatus.error}</p>
                )}
                <button
                  type="submit"
                  disabled={formStatus.loading}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-medium tracking-wider uppercase transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formStatus.loading ? 'Sending...' : 'Send Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-lg font-light tracking-wider mb-1">Aiden Devins Photography</p>
            <p className="text-sm text-white/40">&copy; {new Date().getFullYear()} All rights reserved.</p>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/50">
            <a href="mailto:hello@aidendevins.com" className="hover:text-white transition">hello@aidendevins.com</a>
            <span className="text-white/20">|</span>
            <a href="/privacy" className="hover:text-white transition">Privacy Policy</a>
          </div>
        </div>
      </footer>

      {/* Lightbox */}
      {lightboxPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxPhoto(null)}
        >
          {/* Close button */}
          <button 
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-6 right-6 p-2 text-white/60 hover:text-white transition z-10"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation arrows */}
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

          {/* Image */}
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

          {/* Counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-sm">
            {filteredPhotos.findIndex(p => p.id === lightboxPhoto.id) + 1} / {filteredPhotos.length}
          </div>
        </div>
      )}
    </div>
  );
}
