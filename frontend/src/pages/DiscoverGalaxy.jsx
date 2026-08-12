import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { API_URL } from '../config';
import { Play, Heart, X, Sparkles, ArrowLeft, Share2, Disc } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { useNavigate } from 'react-router-dom';

// Mood categories based on audio features
const getMoodFromFeatures = (features) => {
  if (!features) return { mood: 'Dreamy • Ambient • Calm', color: '#A78BFA' };
  const { energy, valence, danceability, acousticness } = features;
  const tags = [];
  if (energy > 0.6) tags.push('Energetic');
  if (danceability > 0.6) tags.push('Groovy');
  if (acousticness > 0.5) tags.push('Acoustic');
  if (valence > 0.6) tags.push('Happy');
  if (valence < 0.3) tags.push('Melancholy');
  if (tags.length === 0) tags.push('Dreamy', 'Ambient', 'Calm');
  return { mood: tags.slice(0, 3).join(' • '), color: '#A78BFA' };
};

const getSampleLyrics = (title) => {
  const t = title.toLowerCase();
  if (t.includes('space') || t.includes('drift')) {
    return [
      "We just keep drifting",
      "Further away from everyone",
      "We know.",
      "I got a feeling",
      "We're not in Kansas",
      "anymore."
    ];
  }
  if (t.includes('night') || t.includes('met') || t.includes('call')) {
    return [
      "I am not the only traveler",
      "Who has not repaid his debt",
      "I've been searching for a trail to follow again",
      "Take me back to the night we met."
    ];
  }
  if (t.includes('yellow') || t.includes('fix') || t.includes('coldplay')) {
    return [
      "Look at the stars",
      "Look how they shine for you",
      "And everything you do",
      "Yeah, they were all yellow."
    ];
  }
  if (t.includes('holocene') || t.includes('bon')) {
    return [
      "And at once I knew",
      "I was not magnificent",
      "Strayed above the highway aisle",
      "Jagged vacance, thick with ice."
    ];
  }
  return [
    "Floating through the endless dark",
    "Melodies ignite the spark",
    "Lost inside the cosmic sound",
    "Where peace and memory are found."
  ];
};

const DiscoverGalaxy = () => {
  const { token } = useAuth();
  const { playTrack, currentTrack } = usePlayer();
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [audioFeatures, setAudioFeatures] = useState({});
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const containerRef = useRef(null);
  const [nodePositions, setNodePositions] = useState([]);

  // Fetch top tracks and their audio features
  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        let data = [];
        const res = await fetch(`${API_URL}/api/me/top-tracks?time_range=medium_term`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          data = await res.json();
        }

        // Fallback tracks if Spotify is rate limited or returns empty
        if (!Array.isArray(data) || data.length === 0) {
          data = [
            { id: 't1', title: 'Space Song', artistName: 'Beach House', albumName: 'Depression Cherry', coverUrl: '/images/worlds/space.png', duration: '5:20', popularity: 85 },
            { id: 't2', title: 'The Night We Met', artistName: 'Lord Huron', albumName: 'Strange Trails', coverUrl: '/images/worlds/ocean.png', duration: '3:28', popularity: 88 },
            { id: 't3', title: 'Holocene', artistName: 'Bon Iver', albumName: 'Bon Iver', coverUrl: '/images/worlds/rainy-city.png', duration: '5:37', popularity: 78 },
            { id: 't4', title: 'Another Love', artistName: 'Tom Odell', albumName: 'Long Way Down', coverUrl: '/images/worlds/sakura.png', duration: '4:04', popularity: 90 },
            { id: 't5', title: 'Fix You', artistName: 'Coldplay', albumName: 'X&Y', coverUrl: '/images/worlds/mountain.png', duration: '4:55', popularity: 86 },
            { id: 't6', title: 'Say You Won\'t Let Go', artistName: 'James Arthur', albumName: 'Back from the Edge', coverUrl: '/images/worlds/coffee-house.png', duration: '3:31', popularity: 84 },
            { id: 't7', title: 'Intro', artistName: 'The xx', albumName: 'xx', coverUrl: '/images/worlds/space.png', duration: '2:08', popularity: 80 },
            { id: 't8', title: 'Teardrop', artistName: 'Massive Attack', albumName: 'Mezzanine', coverUrl: '/images/worlds/rainy-city.png', duration: '5:31', popularity: 82 },
          ];
        }
        setTracks(data);
        if (data.length > 0) {
          setSelectedTrack(data[0]);
        }

        // Fetch audio features
        const ids = data.map(t => t.id).join(',');
        const featMap = {};
        if (ids) {
          try {
            const featRes = await fetch(`${API_URL}/api/me/audio-features?ids=${ids}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (featRes.ok) {
              const featData = await featRes.json();
              if (Array.isArray(featData)) {
                featData.forEach(f => { if (f) featMap[f.id] = f; });
              }
            }
          } catch (e) {
            console.error('Audio features fetch failed, using synthetic features', e);
          }
        }

        data.forEach((t, index) => {
          if (!featMap[t.id]) {
            featMap[t.id] = {
              id: t.id,
              energy: 0.3 + ((index * 0.13) % 0.6),
              valence: 0.2 + ((index * 0.17) % 0.7),
              danceability: 0.4 + ((index * 0.11) % 0.5),
              acousticness: 0.1 + ((index * 0.19) % 0.8),
            };
          }
        });
        setAudioFeatures(featMap);
      } catch (err) {
        console.error('Galaxy data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // Calculate orbiting star positions
  useEffect(() => {
    if (tracks.length === 0) return;
    const orbiting = tracks.slice(1, 8); // Take up to 7 orbiting songs around center
    const count = orbiting.length;
    const pos = orbiting.map((track, i) => {
      const angle = (i * 360) / count - 90; // Start at top (-90 deg)
      const radius = count > 5 ? 240 : 200; // Orbit distance in px
      return { track, angle, radius };
    });
    setNodePositions(pos);
  }, [tracks]);

  // Canvas background animation: twinkling stars and dotted constellation lines
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    let time = 0;

    const resize = () => {
      canvas.width = container.offsetWidth * window.devicePixelRatio;
      canvas.height = container.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    // Background stars
    const bgStars = Array.from({ length: 250 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 1.8 + 0.5,
      twinkleSpeed: 0.5 + Math.random() * 1.5,
      twinkleOffset: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      // 1. Draw cosmic nebula glow in center
      const centerX = w / 2;
      const centerY = h / 2;
      const radGrad = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, Math.min(w, h) * 0.6);
      radGrad.addColorStop(0, 'rgba(168, 85, 247, 0.18)'); // Purple glow
      radGrad.addColorStop(0.5, 'rgba(236, 72, 153, 0.08)'); // Pink tint
      radGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. Draw twinkling background stars
      bgStars.forEach(s => {
        const alpha = 0.15 + Math.sin(time * s.twinkleSpeed + s.twinkleOffset) * 0.4;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Draw dotted constellation laser lines from center to each orbiting node
      if (nodePositions.length > 0) {
        ctx.save();
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)'; // Violet dashed lines
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 6]);
        ctx.lineDashOffset = -time * 15; // Animate dash moving outward

        nodePositions.forEach(node => {
          const rad = (node.angle * Math.PI) / 180;
          const targetX = centerX + Math.cos(rad) * node.radius;
          const targetY = centerY + Math.sin(rad) * node.radius;

          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(targetX, targetY);
          ctx.stroke();
        });
        ctx.restore();
      }

      time += 0.016;
      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [nodePositions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm font-medium">Mapping cosmic constellations...</p>
        </div>
      </div>
    );
  }

  const centerTrack = tracks[0] || null;
  const moodInfo = selectedTrack ? getMoodFromFeatures(audioFeatures[selectedTrack.id]) : { mood: 'Dreamy • Ambient • Calm' };
  const lyrics = selectedTrack ? getSampleLyrics(selectedTrack.title) : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-screen w-full bg-[#05050a] flex flex-col overflow-hidden relative select-none"
    >
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover opacity-50 mix-blend-screen" 
          src="/assets/856528-uhd_2160_2160_24fps.mp4" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05050a] via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Top Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 px-6 md:px-10 pt-8 pb-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/[0.15] border border-white/[0.1] flex items-center justify-center text-white transition-all backdrop-blur-md"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-white tracking-wide">Discover Galaxy</h1>
            <p className="text-xs text-purple-300/80 mt-0.5">Each star is a song. Explore and connect.</p>
          </div>
        </div>
      </div>

      {/* Main Container: Left Galaxy Viewport + Right Side Panel */}
      <div className="flex-1 flex min-h-0 relative z-10 pt-20">
        {/* Galaxy Constellation Area */}
        <div ref={containerRef} className="flex-1 relative overflow-hidden flex items-center justify-center">
          {/* Background Canvas */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

          {/* Central Star / Primary Planet */}
          {centerTrack && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              onClick={() => setSelectedTrack(centerTrack)}
              className="absolute z-20 flex flex-col items-center cursor-pointer group"
              style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
            >
              <div className="relative">
                {/* Glowing Aura Ring */}
                <div className={`absolute -inset-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-60 blur-xl group-hover:opacity-100 transition-opacity duration-500 ${selectedTrack?.id === centerTrack.id ? 'opacity-90 animate-pulse' : ''}`} />
                <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-purple-500 via-violet-400 to-pink-500 opacity-80 animate-spin-slow" style={{ animationDuration: '20s' }} />
                
                {/* Planet Circle */}
                <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-white/80 shadow-[0_0_35px_rgba(168,85,247,0.7)] group-hover:scale-105 transition-transform duration-300 bg-black">
                  <img src={centerTrack.coverUrl || '/images/worlds/space.png'} alt={centerTrack.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                </div>

                {/* Playing icon indicator if current */}
                {currentTrack?.title === centerTrack.title && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg animate-bounce">
                    <Disc size={16} className="animate-spin" />
                  </div>
                )}
              </div>

              {/* Title Label Under Center Star */}
              <div className="mt-3 text-center bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg">
                <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">{centerTrack.title}</h3>
                <p className="text-[11px] text-gray-400">{centerTrack.artistName}</p>
              </div>
            </motion.div>
          )}

          {/* Orbiting Song Nodes */}
          {nodePositions.map(({ track, angle, radius }, idx) => {
            const isSelected = selectedTrack?.id === track.id;
            const isPlaying = currentTrack?.title === track.title;
            const rad = (angle * Math.PI) / 180;
            const offsetX = Math.cos(rad) * radius;
            const offsetY = Math.sin(rad) * radius;

            return (
              <motion.div
                key={`${track.id}-${idx}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + idx * 0.08, type: 'spring', damping: 18 }}
                onClick={() => setSelectedTrack(track)}
                className="absolute z-10 flex flex-col items-center cursor-pointer group"
                style={{
                  left: `calc(50% + ${offsetX}px)`,
                  top: `calc(50% + ${offsetY}px)`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className="relative">
                  {/* Outer glow */}
                  <div className={`absolute -inset-2 rounded-full bg-purple-500/40 blur-md group-hover:bg-purple-400/80 transition-all duration-300 ${isSelected ? 'bg-pink-500/80 scale-110' : ''}`} />
                  
                  {/* Thumbnail Circle */}
                  <div className={`relative w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 transition-all duration-300 bg-black ${isSelected ? 'border-pink-400 scale-110 shadow-[0_0_20px_rgba(236,72,153,0.8)]' : 'border-white/40 group-hover:border-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'}`}>
                    <img src={track.coverUrl || '/images/worlds/space.png'} alt={track.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>

                  {isPlaying && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                      <Disc size={10} className="animate-spin" />
                    </div>
                  )}
                </div>

                {/* Song Title Tag */}
                <div className="mt-2 text-center bg-[#0d0d15]/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/[0.08] max-w-[130px] truncate shadow-md group-hover:border-purple-500/50 transition-colors">
                  <p className={`text-[11px] font-semibold truncate ${isSelected ? 'text-pink-300' : 'text-gray-200 group-hover:text-white'}`}>
                    {track.title}
                  </p>
                  <p className="text-[9px] text-gray-400 truncate">{track.artistName}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Right Side Panel (Song Details & Lyrics) */}
        <AnimatePresence>
          {selectedTrack && (
            <motion.div
              initial={{ x: 380, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 380, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 260 }}
              className="w-full md:w-[350px] bg-[#0a0a12]/95 backdrop-blur-2xl border-l border-white/[0.08] p-6 overflow-y-auto shrink-0 z-30 flex flex-col shadow-2xl hide-scroll"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-purple-400" />
                  <span className="text-xs text-purple-300 uppercase tracking-wider font-semibold">Starlight Node</span>
                </div>
                <button
                  onClick={() => setSelectedTrack(null)}
                  className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Planetary Album Art Frame */}
              <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden mb-6 border-2 border-purple-500/40 shadow-[0_0_40px_rgba(168,85,247,0.3)] group">
                <img
                  src={selectedTrack.coverUrl || '/images/worlds/space.png'}
                  alt={selectedTrack.title}
                  className="w-full h-full object-cover animate-spin-slow"
                  style={{ animationDuration: '30s' }}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/30 via-transparent to-black/40" />
              </div>

              {/* Title and Artist */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-heading font-bold text-white mb-1">{selectedTrack.title}</h3>
                <p className="text-sm font-medium text-gray-400">{selectedTrack.artistName}</p>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <button
                  onClick={() => playTrack(selectedTrack, "Discover Galaxy", tracks)}
                  className="w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 transition-all"
                >
                  <Play size={24} fill="currentColor" className="ml-1" />
                </button>
                <button
                  onClick={() => toggleFavorite(selectedTrack)}
                  className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                    isFavorite(selectedTrack.title)
                      ? 'border-pink-500 bg-pink-500/20 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.4)]'
                      : 'border-white/[0.1] bg-white/[0.04] text-gray-400 hover:text-white hover:border-white/30'
                  }`}
                >
                  <Heart size={20} fill={isFavorite(selectedTrack.title) ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: selectedTrack.title, text: `Listen to ${selectedTrack.title} on EchoVerse!` });
                    }
                  }}
                  className="w-12 h-12 rounded-full border border-white/[0.1] bg-white/[0.04] text-gray-400 hover:text-white hover:border-white/30 flex items-center justify-center transition-all"
                >
                  <Share2 size={18} />
                </button>
              </div>

              {/* Mood Tags */}
              <div className="text-center mb-6">
                <span className="text-xs font-semibold px-4 py-1.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-sm">
                  {moodInfo.mood}
                </span>
              </div>

              {/* Lyrics Box */}
              <div className="flex-1 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 backdrop-blur-md">
                <h4 className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-3 flex items-center gap-2">
                  <span>Lyrics</span>
                  <div className="h-px flex-1 bg-white/[0.06]" />
                </h4>
                <div className="space-y-2 text-sm text-gray-300 font-serif italic leading-relaxed">
                  {lyrics.map((line, idx) => (
                    <p key={idx} className={idx === 0 ? "text-white font-medium not-italic" : "text-gray-400"}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default DiscoverGalaxy;
