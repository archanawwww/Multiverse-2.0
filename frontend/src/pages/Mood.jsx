import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, CloudRain, Sun, Moon, Heart, Zap, Target, Cloud, Clock, ChevronRight } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { fetchRecommendations, searchSpotify, fetchGeminiRecommendations } from '../services/SpotifyService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MOODS = [
  {
    id: 'sad',
    label: 'Sad',
    icon: CloudRain,
    bgVideo: '/src/assets/49252-459186552.mp4',
    color: 'purple',
    seeds: { seed_genres: 'sad,acoustic,piano', target_valence: 0.2 }
  },
  {
    id: 'happy',
    label: 'Happy',
    icon: Sun,
    bgVideo: '/src/assets/56209-479197484.mp4',
    color: 'yellow',
    seeds: { seed_genres: 'happy,pop,summer', target_valence: 0.8, min_energy: 0.6 }
  },
  {
    id: 'chill',
    label: 'Chill',
    icon: Moon,
    bgVideo: '/src/assets/12275385-hd_1920_1028_60fps.mp4',
    color: 'teal',
    seeds: { seed_genres: 'chill,ambient,study', max_energy: 0.5 }
  },
  {
    id: 'romantic',
    label: 'Romantic',
    icon: Heart,
    bgVideo: '/src/assets/15574406_1920_1080_30fps.mp4',
    color: 'pink',
    seeds: { seed_genres: 'romance,r-n-b', target_valence: 0.6 }
  },
  {
    id: 'motivated',
    label: 'Motivated',
    icon: Zap,
    bgVideo: '/src/assets/856528-uhd_2160_2160_24fps.mp4',
    color: 'orange',
    seeds: { seed_genres: 'workout,electronic,bossanova', min_energy: 0.8, target_tempo: 120 }
  },
  {
    id: 'focused',
    label: 'Focused',
    icon: Target,
    bgVideo: '/src/assets/12286527-hd_1920_1028_60fps.mp4',
    color: 'blue',
    seeds: { seed_genres: 'study,classical', min_instrumentalness: 0.8 }
  },
  {
    id: 'dreamy',
    label: 'Dreamy',
    icon: Cloud,
    bgVideo: '/src/assets/14512643_1920_1080_24fps.mp4',
    color: 'indigo',
    seeds: { seed_genres: 'indie,sleep,chill', min_acousticness: 0.4 }
  },
  {
    id: 'nostalgic',
    label: 'Nostalgic',
    icon: Clock,
    bgVideo: '/src/assets/15568067_1920_1080_30fps.mp4',
    color: 'amber',
    seeds: { seed_genres: 'synth-pop,indie-pop', target_valence: 0.4 }
  }
];

const Mood = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [activeMood, setActiveMood] = useState(MOODS[0]);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playTrack } = usePlayer();

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    const loadMoodTracks = async () => {
      setLoading(true);
      let fetchedTracks = [];
      try {
        // Use Gemini AI to curate a list of songs instead of strict Spotify seeds
        const aiResult = await fetchGeminiRecommendations(activeMood.label);
        fetchedTracks = aiResult.tracks || [];

        // Fallback: If Gemini AI fails or returns empty, use basic Spotify Search
        if (fetchedTracks.length === 0) {
          const searchResult = await searchSpotify(`${activeMood.label} mood`, 'track', 15);
          if (searchResult.tracks && searchResult.tracks.items && searchResult.tracks.items.length > 0) {
            fetchedTracks = searchResult.tracks.items;
          }
        }
      } catch (err) {
        console.error('Failed to fetch mood tracks, applying fallback:', err);
      }

      // Hard fallback if EVERYTHING fails (API throws error, or returns 0 items)
      if (fetchedTracks.length === 0) {
        fetchedTracks = [
          { id: 'f1', name: 'Space Song', artists: [{ name: 'Beach House' }], album: { name: 'Depression Cherry', images: [{ url: '/images/worlds/space.png' }] }, duration_ms: 320000 },
          { id: 'f2', name: 'Holocene', artists: [{ name: 'Bon Iver' }], album: { name: 'Bon Iver', images: [{ url: '/images/worlds/rainy-city.png' }] }, duration_ms: 337000 },
          { id: 'f3', name: 'Yellow', artists: [{ name: 'Coldplay' }], album: { name: 'Parachutes', images: [{ url: '/images/worlds/mountain.png' }] }, duration_ms: 269000 },
          { id: 'f4', name: 'Night Call', artists: [{ name: 'Kavinsky' }], album: { name: 'Outrun', images: [{ url: '/images/worlds/ocean.png' }] }, duration_ms: 258000 }
        ];
      }

      // Map whatever we got (real or fallback) to the UI state
      try {
        const mappedTracks = fetchedTracks.map(track => {
          const minutes = Math.floor((track?.duration_ms || 0) / 60000);
          const seconds = (((track?.duration_ms || 0) % 60000) / 1000).toFixed(0);
          return {
            id: track?.id,
            title: track?.name,
            artistName: track?.artists?.[0]?.name || 'Unknown Artist',
            albumName: track?.album?.name || 'Unknown Album',
            coverUrl: track?.album?.images?.[0]?.url || '',
            duration: minutes + ":" + (seconds < 10 ? '0' : '') + seconds,
            durationMs: track?.duration_ms || 0,
            previewUrl: track?.preview_url || '',
            spotifyUrl: track?.external_urls?.spotify || ''
          };
        });
        setTracks(mappedTracks);
      } catch (err) {
        console.error('Error mapping tracks:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMoodTracks();
  }, [activeMood, token, navigate]);

  return (
    <div className="relative min-h-screen pb-24 overflow-y-auto bg-black flex flex-col font-body selection:bg-white/20 text-white">
      
      {/* Dynamic Video Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMood.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="fixed inset-0 z-0"
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-60"
            src={activeMood.bgVideo}
          />
        </motion.div>
      </AnimatePresence>

      {/* Dark overlay gradient to ensure text readability */}
      <div className="fixed inset-0 z-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 px-8 md:px-12 pt-16 flex-1 flex flex-col max-w-7xl mx-auto w-full">
        
        {/* Header Texts */}
        <div className="mb-10">
          <h1 className="text-5xl font-heading font-semibold text-white mb-3 tracking-wide drop-shadow-lg">Mood</h1>
          <p className="text-white/80 text-lg drop-shadow">How do you feel today?</p>
          <p className="text-white/50 text-sm">We'll play the perfect music for you.</p>
        </div>

        {/* Mood Selector Row */}
        <div className="flex gap-4 overflow-x-auto pt-4 -mt-4 pb-6 mb-8 hide-scroll items-center snap-x">
          {MOODS.map((mood) => {
            const isActive = activeMood.id === mood.id;
            const Icon = mood.icon;
            
            return (
              <div key={mood.id} className="flex flex-col items-center gap-2 snap-center shrink-0">
                <button
                  onClick={() => setActiveMood(mood)}
                  className={`w-24 h-24 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all duration-500 backdrop-blur-2xl border ${
                    isActive
                      ? 'bg-white/20 border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.2)] scale-105 text-white'
                      : 'bg-white/[0.05] border-white/[0.08] hover:bg-white/[0.1] hover:border-white/20 text-white/50 hover:text-white'
                  }`}
                >
                  <Icon size={28} strokeWidth={isActive ? 2 : 1.5} />
                  <span className="text-xs font-medium">{mood.label}</span>
                </button>
                {/* Active Indicator Dot */}
                <div 
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 bg-white ${
                    isActive ? 'opacity-100 scale-100 shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'opacity-0 scale-0'
                  }`} 
                />
              </div>
            );
          })}
        </div>

        {/* Playing Songs Section */}
        <AnimatePresence mode="wait">
          {!loading && (
            <motion.div
              key={activeMood.id + '-content'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-black/20 backdrop-blur-[40px] border border-white/[0.08] rounded-[2rem] p-8 mt-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-medium text-white/90">
                  Playing songs that match your <span className="font-semibold text-white">{activeMood.label.toLowerCase()}</span> mood
                </h2>
              </div>

              <div className="flex gap-6 overflow-x-auto pb-4 hide-scroll">
                {tracks.map((track, idx) => (
                  <div 
                    key={`${track.id}-${idx}`}
                    className="shrink-0 group cursor-pointer"
                    style={{ width: '176px' }}
                    onClick={() => playTrack(track, activeMood.label + " Mood", tracks)}
                  >
                    <div 
                      className="relative rounded-2xl overflow-hidden mb-4 shadow-lg border border-white/[0.08] group-hover:border-white/30 transition-all duration-500 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
                      style={{ width: '176px', height: '176px' }}
                    >
                      <img 
                        src={track.coverUrl} 
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors" />
                      
                      {/* Floating Play Button */}
                      <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl">
                        <Play size={18} fill="currentColor" className="ml-1" />
                      </div>
                    </div>
                    <h3 className="text-white/90 font-semibold text-base truncate tracking-tight">{track.title}</h3>
                    <p className="text-white/50 text-xs truncate mt-1">{track.artistName}</p>
                  </div>
                ))}
                
                {tracks.length === 0 && (
                  <div className="text-white/50 text-sm">No tracks found for this mood right now.</div>
                )}
              </div>
            </motion.div>
          )}
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="flex justify-center py-20"
            >
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Mood;
