import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { ChevronDown, Play, Sparkles } from 'lucide-react';
import { API_URL } from '../config';

const LandingPage = () => {
  const navigate = useNavigate();
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme({
      themeColors: {
        primary: '#1DB954',
        secondary: '#60A5FA',
        background: '#0A0A0A',
        card: 'rgba(255, 255, 255, 0.03)',
        text: '#ffffff',
        accent: '#A78BFA'
      },
      themeFonts: {
        heading: 'Playfair Display, serif',
        body: 'Inter, sans-serif'
      }
    });
  }, [setTheme]);

  // Generate random particles
  const particles = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      className="relative min-h-screen bg-[#050505] text-white overflow-hidden font-body selection:bg-primary/30"
    >
      {/* Full Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/images/landing-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#050505]/60 to-transparent" />

      {/* Floating Particles */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {particles.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-white/50"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.left}%`,
              top: `${p.top}%`,
              boxShadow: '0 0 6px rgba(255,255,255,0.6)',
            }}
            animate={{
              y: [0, -80, 0],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Top Navigation */}
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="relative z-30 flex items-center justify-between px-8 md:px-12 py-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12a4 4 0 0 0 8 0" />
              <circle cx="12" cy="10" r="2" />
            </svg>
          </div>
          <span className="text-lg font-heading font-bold text-white">EchoVerse</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <a href="#about" className="hover:text-white transition-colors">About</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            +
          </button>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="relative z-20 flex flex-col justify-center min-h-[calc(100vh-88px)] px-8 md:px-16 lg:px-24 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
          className="max-w-3xl"
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-heading font-bold mb-4 leading-[1.1]">
            Music isn't just{' '}
            <br className="hidden md:block" />
            heard. It's{' '}
            <br className="hidden md:block" />
            <span
              className="italic text-transparent bg-clip-text"
              style={{
                backgroundImage: 'linear-gradient(135deg, #A78BFA, #ffffff, #60A5FA)',
              }}
            >
              experienced.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-lg mt-6 mb-12 font-light leading-relaxed">
            Explore your emotions through music.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                window.location.href = `${API_URL}/api/auth/login?t=${Date.now()}`;
              }}
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-full text-base font-bold bg-emerald-500 hover:bg-emerald-400 text-black transition-all shadow-[0_0_30px_rgba(29,185,84,0.3)] hover:shadow-[0_0_40px_rgba(29,185,84,0.5)]"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg"
                alt="Spotify"
                className="w-5 h-5"
              />
              Connect Spotify
            </button>
            <button
              onClick={() => {
                window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
              }}
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-full text-base font-semibold bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white transition-all"
            >
              <Play size={18} fill="currentColor" />
              Explore Worlds
            </button>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ delay: 2, duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-8 left-8 md:left-16 z-20 text-gray-500 flex items-center gap-2 cursor-pointer hover:text-white transition-colors"
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <span className="text-xs uppercase tracking-[0.15em] font-medium">Scroll to explore</span>
        <ChevronDown size={16} />
      </motion.div>
    </motion.div>
  );
};

export default LandingPage;
