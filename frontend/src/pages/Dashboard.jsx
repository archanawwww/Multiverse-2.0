import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { Bell, Play, ChevronRight, Sparkles, Compass, Headphones } from 'lucide-react';
import WeatherWidget from '../components/WeatherWidget';
import {
  fetchUserProfile,
  fetchRecentlyPlayed,
  fetchTopArtists,
  fetchTopTracks,
  analyzeMood,
} from '../services/SpotifyService';

const Dashboard = () => {
  const { token, user, setUser } = useAuth();
  const { playTrack } = usePlayer();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [continueListening, setContinueListening] = useState(null);
  const [topArtists, setTopArtists] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [moodData, setMoodData] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch all data in parallel
        const [profileResult, recentResult, artistsResult, tracksResult, moodResult] = await Promise.allSettled([
          fetchUserProfile(),
          fetchRecentlyPlayed(),
          fetchTopArtists('short_term'),
          fetchTopTracks('short_term'),
          analyzeMood(),
        ]);

        // Profile
        if (profileResult.status === 'fulfilled' && profileResult.value && !profileResult.value.error) {
          setUser(profileResult.value);
        }

        // Recently Played
        if (recentResult.status === 'fulfilled' && Array.isArray(recentResult.value) && recentResult.value.length > 0) {
          setRecentlyPlayed(recentResult.value);
          setContinueListening(recentResult.value[0]);
        }

        // Top Artists
        if (artistsResult.status === 'fulfilled' && Array.isArray(artistsResult.value) && artistsResult.value.length > 0) {
          setTopArtists(artistsResult.value.slice(0, 10));
        }

        // Top Tracks
        if (tracksResult.status === 'fulfilled' && Array.isArray(tracksResult.value) && tracksResult.value.length > 0) {
          setTopTracks(tracksResult.value.slice(0, 10));
        }

        // Mood
        if (moodResult.status === 'fulfilled' && moodResult.value) {
          setMoodData(moodResult.value);
        }
      } catch (err) {
        console.error('[Dashboard] Critical error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate, setUser]);

  // Greeting
  const hour = new Date().getHours();
  let greeting = 'Good Evening';
  let greetingEmoji = '🌙';
  if (hour < 12) { greeting = 'Good Morning'; greetingEmoji = '☀️'; }
  else if (hour < 18) { greeting = 'Good Afternoon'; greetingEmoji = '🌤️'; }

  // Unique recently played (deduplicate by title)
  const uniqueRecent = recentlyPlayed.filter(
    (track, idx, arr) => arr.findIndex(t => t.title === track.title) === idx
  ).slice(0, 8);

  // Mood suggestion (dynamic from mood engine)
  const moodSuggestion = moodData ? {
    title: moodData.mood,
    description: moodData.description,
    icon: moodData.emoji,
  } : {
    title: 'Analyzing...',
    description: 'We\'re reading your recent vibes to understand your mood.',
    icon: '✨',
  };

  // Stagger animation container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-ping" />
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <div className="absolute inset-3 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <Headphones size={20} className="text-emerald-400" />
          </div>
        </div>
        <p className="text-sm text-gray-500 tracking-wider uppercase">Loading your universe...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen pb-32 font-body selection:bg-white/20 text-white"
    >
      {/* Full Screen Video Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          src="/assets/90877-629483574.mp4"
        />
        {/* Subtle vignette/overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/40 to-black/80" />
      </div>

      <div className="relative z-10 px-8 pt-6 max-w-[1400px] mx-auto">

        {/* ===== TOP BAR ===== */}
        <div className="flex items-center justify-between mb-16 gap-8">
          
          {/* Glass Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div 
              onClick={() => document.dispatchEvent(new CustomEvent('open-search'))}
              className="cursor-text bg-white/[0.05] border border-white/[0.1] rounded-2xl px-5 py-3 flex items-center gap-3 backdrop-blur-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] transition-all duration-300 hover:bg-white/[0.08] hover:border-white/[0.2]"
            >
              <Compass size={18} className="text-white/60" />
              <div className="text-sm text-white/50 font-medium tracking-wide w-full text-left">
                Search for songs, artists, albums...
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center justify-end gap-6">
            <div className="bg-white/[0.05] border border-white/[0.1] backdrop-blur-3xl rounded-2xl px-4 py-2 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] hidden md:block">
              <WeatherWidget />
            </div>
            <button
              onClick={() => alert('No new notifications')}
              className="w-11 h-11 rounded-2xl bg-white/[0.05] border border-white/[0.1] backdrop-blur-3xl flex items-center justify-center text-white/80 hover:text-white hover:bg-white/[0.1] transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] cursor-pointer"
            >
              <Bell size={20} />
            </button>
            {user?.images?.[0] ? (
              <button
                onClick={() => navigate('/profile')}
                className="w-11 h-11 rounded-2xl overflow-hidden cursor-pointer border border-white/20 hover:border-white/50 transition-all shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]"
              >
                <img
                  src={user.images[0].url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </button>
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md" />
            )}
          </div>
        </div>

        {/* ===== GREETING ===== */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-14"
        >
          <motion.div variants={itemVariants}>
            <p className="text-white/70 text-lg font-medium tracking-wide mb-1 flex items-center gap-2">
              {greeting} <span className="text-xl">{greetingEmoji}</span>
            </p>
            <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight drop-shadow-sm mb-3">
              {user?.display_name || 'Explorer'}
            </h1>
            <p className="text-white/50 text-sm font-medium tracking-wide">
              Continue where your emotions left off.
            </p>
          </motion.div>
        </motion.div>

        {/* ===== RECENTLY PLAYED ===== */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white/90 flex items-center gap-1 tracking-tight cursor-pointer hover:text-white transition-colors">
              Recently Played <ChevronRight size={18} className="text-white/50 ml-1" />
            </h2>
            <div className="flex items-center gap-3">
              <button className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/[0.1] backdrop-blur-md hover:bg-white/[0.1] flex items-center justify-center transition-colors">
                <ChevronRight size={18} className="rotate-180 text-white/70" />
              </button>
              <button className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/[0.1] backdrop-blur-md hover:bg-white/[0.1] flex items-center justify-center transition-colors">
                <ChevronRight size={18} className="text-white/70" />
              </button>
            </div>
          </motion.div>

          <div className="flex gap-5 overflow-x-auto pb-6 hide-scroll">
            {uniqueRecent.map((track, idx) => (
              <motion.div
                key={`${track.id}-${idx}`}
                variants={itemVariants}
                onClick={() => playTrack(track, track.albumName, uniqueRecent)}
                className="shrink-0 w-[150px] cursor-pointer group"
              >
                <div className="relative w-[150px] h-[150px] rounded-[1.25rem] overflow-hidden mb-4 shadow-[0_8px_24px_rgba(0,0,0,0.3)] border border-white/[0.08] group-hover:border-white/[0.2] transition-all duration-500">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                </div>
                <h3 className="text-[15px] font-semibold text-white/90 truncate tracking-tight">{track.title}</h3>
                <p className="text-[13px] text-white/50 truncate mt-1">{track.artistName}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ===== TOP ARTISTS ===== */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-14"
        >
          <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white/90 flex items-center gap-1 tracking-tight cursor-pointer hover:text-white transition-colors">
              Your Top Artists <ChevronRight size={18} className="text-white/50 ml-1" />
            </h2>
          </motion.div>

          <div className="flex gap-7 overflow-x-auto pb-6 hide-scroll">
            {topArtists.map((artist, idx) => (
              <motion.div
                key={`${artist.id}-${idx}`}
                variants={itemVariants}
                className="shrink-0 w-[130px] text-center group cursor-pointer"
              >
                <div className="w-[130px] h-[130px] rounded-full overflow-hidden mb-4 mx-auto border border-white/[0.08] group-hover:border-white/[0.3] shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all duration-500 group-hover:shadow-[0_12px_32px_rgba(255,255,255,0.1)]">
                  <img
                    src={artist.coverUrl}
                    alt={artist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <h3 className="text-[15px] font-semibold text-white/90 truncate tracking-tight">{artist.name}</h3>
                <p className="text-[12px] text-white/50 truncate capitalize mt-1 tracking-wide">{artist.genres?.[0] || 'Artist'}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ===== TOP TRACKS ===== */}
        {topTracks.length > 0 && (
          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-14"
          >
            <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white/90 flex items-center gap-1 tracking-tight cursor-pointer hover:text-white transition-colors">
                Your Top Tracks <ChevronRight size={18} className="text-white/50 ml-1" />
              </h2>
            </motion.div>

            <div className="bg-white/[0.03] backdrop-blur-[40px] border border-white/[0.1] rounded-[2rem] overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
              {topTracks.map((track, idx) => (
                <motion.div
                  key={`${track.id}-${idx}`}
                  variants={itemVariants}
                  onClick={() => playTrack(track, track.albumName, topTracks)}
                  className={`flex items-center gap-4 px-6 py-4 cursor-pointer group hover:bg-white/[0.04] transition-colors ${idx < topTracks.length - 1 ? 'border-b border-white/[0.05]' : ''}`}
                >
                  <span className="text-sm text-white/30 w-6 text-right font-medium">{idx + 1}</span>
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-md border border-white/[0.08]">
                    <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-semibold text-white/90 truncate tracking-tight group-hover:text-white transition-colors">{track.title}</h3>
                    <p className="text-[13px] text-white/50 truncate">{track.artistName}</p>
                  </div>
                  <span className="text-[13px] text-white/40 font-medium">{track.duration}</span>
                  <div className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={14} fill="white" className="ml-0.5 text-white" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ===== BOTTOM CARDS ROW ===== */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col lg:flex-row gap-6 mb-10"
        >
          {/* Glass Continue Listening Card */}
          {continueListening && (
            <motion.div
              variants={itemVariants}
              onClick={() => playTrack(continueListening, continueListening.albumName, [continueListening])}
              className="flex-1 bg-white/[0.03] backdrop-blur-[40px] border border-white/[0.1] rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between cursor-pointer group hover:bg-white/[0.06] transition-all duration-500 shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
            >
              <h3 className="text-sm font-semibold text-white/70 tracking-wide mb-6 uppercase">Continue Listening</h3>
              
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl overflow-hidden shrink-0 shadow-xl border border-white/[0.08]">
                  <img
                    src={continueListening.coverUrl}
                    alt={continueListening.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0 pr-6">
                  <h4 className="text-2xl font-bold text-white truncate tracking-tight mb-1">{continueListening.title}</h4>
                  <p className="text-sm text-white/60 truncate mb-5 tracking-wide">{continueListening.artistName} · {continueListening.albumName}</p>
                  
                  {/* Minimalist Progress Bar */}
                  <div className="w-full">
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-white/80 w-[40%] rounded-full group-hover:bg-white transition-colors duration-300 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                    </div>
                    <div className="flex justify-between text-[11px] text-white/40 font-medium tracking-wider">
                      <span>1:32</span>
                      <span>3:52</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 pl-2 hidden sm:block">
                  <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform duration-300 shadow-[0_8px_20px_rgba(255,255,255,0.2)]">
                    <Play fill="black" size={22} className="ml-1" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Glass Mood For You Card */}
          <motion.div
            variants={itemVariants}
            onClick={() => navigate('/mood')}
            className="w-full lg:w-[400px] bg-purple-900/10 backdrop-blur-[40px] border border-white/[0.1] rounded-[2rem] p-6 lg:p-8 flex flex-col justify-center relative overflow-hidden cursor-pointer group hover:bg-purple-900/20 hover:border-white/[0.15] transition-all duration-500 shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
          >
            {/* Soft decorative glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="relative z-10">
              <div className="bg-white/[0.08] backdrop-blur-md border border-white/[0.05] w-fit px-3 py-1.5 rounded-lg mb-6">
                <h3 className="text-xs font-semibold text-white/80 tracking-wide uppercase">Mood For You</h3>
              </div>
              
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl drop-shadow-lg">🌙</span>
                <h4 className="text-2xl font-bold text-white tracking-tight">{moodSuggestion.title}</h4>
              </div>
              
              <p className="text-[15px] text-white/60 mb-8 leading-relaxed font-medium">
                {moodSuggestion.description}
              </p>
              
              <button className="flex items-center gap-2 text-sm text-black font-semibold bg-white hover:bg-white/90 px-5 py-2.5 rounded-full w-fit transition-colors shadow-[0_4px_15px_rgba(255,255,255,0.2)]">
                <Play size={16} fill="black" />
                Play Mood Mix
              </button>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default Dashboard;
