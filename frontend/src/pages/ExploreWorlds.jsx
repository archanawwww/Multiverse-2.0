import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Play, X, Volume2, Music } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { searchSpotify, fetchGeminiRecommendations } from '../services/SpotifyService';
import { useAuth } from '../context/AuthContext';

const worlds = [
  {
    id: 'rainy-city',
    name: 'Rainy City',
    video: '/assets/49252-459186552.mp4',
    genres: ['Lo-fi', 'Jazz', 'Chill'],
    color: '#4a6fa5',
    description: 'Neon-lit streets, rain on windows, and the quiet hum of a sleeping city.',
    searchQuery: 'lofi rain city',
    ambientSound: 'Rain & City Ambience',
  },
  {
    id: 'space',
    name: 'Space',
    video: '/assets/14512643_1920_1080_24fps.mp4',
    genres: ['Ambient', 'Synthwave'],
    color: '#7c3aed',
    description: 'Float through cosmic nebulas and let the universe speak through sound.',
    searchQuery: 'ambient space synthwave',
    ambientSound: 'Deep Space Ambience',
  },
  {
    id: 'sakura',
    name: 'Sakura',
    video: '/assets/15574406_1920_1080_30fps.mp4',
    genres: ['Piano', 'Japanese Indie'],
    color: '#ec4899',
    description: 'Cherry blossoms fall as gentle melodies paint the twilight sky.',
    searchQuery: 'japanese lofi sakura piano',
    ambientSound: 'Wind & Chimes',
  },
  {
    id: 'mountain',
    name: 'Mountain',
    video: '/assets/12275385-hd_1920_1028_60fps.mp4',
    genres: ['Acoustic', 'Nature'],
    color: '#d97706',
    description: 'Crisp air, vast peaks, and songs that echo through the valleys.',
    searchQuery: 'mountain acoustic folk',
    ambientSound: 'Mountain Wind & Birds',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    video: '/assets/15568067_1920_1080_30fps.mp4',
    genres: ['Chill Electronic', 'Deep'],
    color: '#0ea5e9',
    description: 'Bioluminescent waves under a canopy of stars. Pure serenity.',
    searchQuery: 'ocean waves deep focus',
    ambientSound: 'Ocean Waves',
  },
  {
    id: 'coffee-house',
    name: 'Coffee House',
    video: '/assets/56209-479197484.mp4',
    genres: ['Jazz', 'Acoustic'],
    color: '#b45309',
    description: 'Warm lighting, the aroma of coffee, and soft jazz filling the room.',
    searchQuery: 'coffee house jazz cafe',
    ambientSound: 'Café Ambience',
  },
];

const ExploreWorlds = () => {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorld, setSelectedWorld] = useState(null);
  const [worldTracks, setWorldTracks] = useState([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const { playTrack } = usePlayer();

  const filtered = worlds.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.genres.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    if (selectedWorld && token) {
      const loadTracks = async () => {
        setLoadingTracks(true);
        let fetchedTracks = [];
        try {
          // Use Gemini AI to curate a list of songs perfectly matching the world
          const promptMood = `${selectedWorld.name} world. Vibe: ${selectedWorld.description}`;
          const aiResult = await fetchGeminiRecommendations(promptMood);
          fetchedTracks = aiResult.tracks || [];

          // Fallback if AI fails or returns empty
          if (fetchedTracks.length === 0) {
            const searchResult = await searchSpotify(selectedWorld.searchQuery, 'track', 10);
            if (searchResult.tracks && searchResult.tracks.items) {
              fetchedTracks = searchResult.tracks.items;
            }
          }
        } catch (err) {
          console.error('Failed to fetch world tracks:', err);
        }
        
        // Map whatever we got to the UI state
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
          setWorldTracks(mappedTracks);
        } catch (err) {
           console.error(err);
        } finally {
          setLoadingTracks(false);
        }
      };
      loadTracks();
    }
  }, [selectedWorld, token]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-24 px-6 md:px-10 pt-8 font-body text-white"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-white tracking-wide">Explore Worlds</h1>
          <p className="text-sm text-white/50 mt-1">Step into the sound. Feel the music.</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-8 max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
        <input
          type="text"
          placeholder="Search worlds..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-sm placeholder-white/40 backdrop-blur-xl focus:outline-none focus:border-white/30 transition-colors shadow-inner"
        />
      </div>

      {/* World Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((world, idx) => (
          <motion.div
            key={world.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => setSelectedWorld(world)}
            className="relative rounded-[2rem] overflow-hidden cursor-pointer group aspect-[4/3] border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_12px_40px_rgba(255,255,255,0.1)] hover:border-white/20 transition-all duration-500"
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
              src={world.video}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />

            {/* Play button on hover */}
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
              <button 
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-xl"
              >
                <Play size={20} fill="currentColor" className="ml-0.5" />
              </button>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-3 h-3 rounded-full shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                  style={{ backgroundColor: world.color }}
                />
                <h3 className="text-2xl font-heading font-bold text-white tracking-wide drop-shadow-md">{world.name}</h3>
              </div>
              <div className="flex gap-2 flex-wrap">
                {world.genres.map(g => (
                  <span key={g} className="text-[11px] text-white/80 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md border border-white/10 font-medium tracking-wide">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* World Detail Modal */}
      <AnimatePresence>
        {selectedWorld && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-2xl flex items-center justify-center p-4 md:p-6"
            onClick={() => setSelectedWorld(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-black/40 border border-white/[0.1] shadow-[0_20px_60px_rgba(0,0,0,0.8)] hide-scroll flex flex-col"
            >
              {/* World Video Header */}
              <div className="relative h-72 md:h-80 shrink-0">
                <video autoPlay loop muted playsInline className="w-full h-full object-cover" src={selectedWorld.video} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <button
                  onClick={() => setSelectedWorld(null)}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="absolute bottom-6 left-8">
                  <h2 className="text-4xl font-heading font-bold text-white mb-3 drop-shadow-lg tracking-wide">{selectedWorld.name}</h2>
                  <div className="flex gap-2">
                    {selectedWorld.genres.map(g => (
                      <span key={g} className="text-xs text-white/90 bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20 font-medium">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* World Details */}
              <div className="p-8 bg-black/40 backdrop-blur-3xl flex-1">
                <p className="text-white/70 text-base mb-8 leading-relaxed font-medium">{selectedWorld.description}</p>

                {/* Ambient Sound */}
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] mb-8 hover:bg-white/[0.05] transition-colors cursor-pointer group shadow-inner">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: selectedWorld.color + '30' }}>
                    <Volume2 size={20} style={{ color: selectedWorld.color }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white/90">Ambient Sound</h4>
                    <p className="text-xs text-white/50 mt-0.5">{selectedWorld.ambientSound}</p>
                  </div>
                  <button 
                    className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all"
                  >
                    <Play size={16} fill="currentColor" className="ml-0.5" />
                  </button>
                </div>

                {/* Dynamic Songs from Gemini */}
                <h3 className="text-lg font-heading font-semibold text-white/90 mb-4 flex items-center gap-2">
                  <Music size={18} className="text-white/50" /> AI Curated Songs
                </h3>
                
                {loadingTracks ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white/50"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
                    {worldTracks.map((track, i) => (
                      <div
                        key={i}
                        onClick={() => playTrack(track, selectedWorld.name + " World", worldTracks)}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] cursor-pointer transition-all duration-300 group shadow-md hover:shadow-lg"
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden shadow-md shrink-0">
                           <img src={track.coverUrl || '/images/landing-bg.png'} alt={track.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <h4 className="text-sm font-semibold text-white/90 truncate group-hover:text-white transition-colors">{track.title}</h4>
                           <p className="text-xs text-white/40 mt-1 truncate">{track.artistName}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full shrink-0 bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <Play size={14} fill="white" className="ml-0.5 text-white" />
                        </div>
                      </div>
                    ))}
                    {worldTracks.length === 0 && (
                      <p className="text-white/40 text-sm col-span-2">No tracks found. Try again later.</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ExploreWorlds;
