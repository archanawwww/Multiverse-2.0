import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { API_URL } from '../config';
import { Play, Pause, Heart, Sparkles } from 'lucide-react';

const EmotionJourney = () => {
  const { token } = useAuth();
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();
  const [activeMood, setActiveMood] = useState(0);
  const [journeyStates, setJourneyStates] = useState([
    {
      id: 'rain',
      title: 'Calm Rain',
      time: 'Morning Phase',
      image: '/images/worlds/rainy-city.png',
      color: '#4a6fa5',
      track: { id: 'ej1', title: 'Holocene', artistName: 'Bon Iver', coverUrl: '/images/worlds/rainy-city.png' }
    },
    {
      id: 'sunrise',
      title: 'Sunrise',
      time: 'Midday Phase',
      image: '/images/worlds/mountain.png',
      color: '#d97706',
      track: { id: 'ej2', title: 'Here Comes The Sun', artistName: 'The Beatles', coverUrl: '/images/worlds/mountain.png' }
    },
    {
      id: 'galaxy',
      title: 'Galaxy',
      time: 'Afternoon Phase',
      image: '/images/worlds/space.png',
      color: '#7c3aed',
      track: { id: 'ej3', title: 'Space Song', artistName: 'Beach House', coverUrl: '/images/worlds/space.png' }
    },
    {
      id: 'storm',
      title: 'Storm',
      time: 'Night Phase',
      image: '/images/worlds/ocean.png',
      color: '#0ea5e9',
      track: { id: 'ej4', title: 'Riders on the Storm', artistName: 'The Doors', coverUrl: '/images/worlds/ocean.png' }
    }
  ]);

  useEffect(() => {
    if (!token) return;
    const fetchJourneyTracks = async () => {
      try {
        const res = await fetch(`${API_URL}/api/me/recently-played`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const tracks = await res.json();
          if (Array.isArray(tracks) && tracks.length >= 4) {
            setJourneyStates([
              {
                id: 'rain',
                title: 'Calm Rain',
                time: 'Morning Phase',
                image: '/images/worlds/rainy-city.png',
                color: '#4a6fa5',
                track: tracks[0]
              },
              {
                id: 'sunrise',
                title: 'Sunrise',
                time: 'Midday Phase',
                image: '/images/worlds/mountain.png',
                color: '#d97706',
                track: tracks[1]
              },
              {
                id: 'galaxy',
                title: 'Galaxy',
                time: 'Afternoon Phase',
                image: '/images/worlds/space.png',
                color: '#7c3aed',
                track: tracks[2]
              },
              {
                id: 'storm',
                title: 'Storm',
                time: 'Night Phase',
                image: '/images/worlds/ocean.png',
                color: '#0ea5e9',
                track: tracks[3]
              }
            ]);
          }
        }
      } catch (e) {
        console.error('Failed to load real journey tracks:', e);
      }
    };
    fetchJourneyTracks();
  }, [token]);

  const handlePlay = () => {
    const state = journeyStates[activeMood];
    const queue = journeyStates.map(s => s.track);
    playTrack(state.track, state.title, queue);
  };

  // Auto-progress journey for demo
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMood(prev => (prev + 1) % journeyStates.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [journeyStates.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-8 px-6 md:px-10 pb-24 overflow-hidden relative"
    >
      {/* Background Image transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMood}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.15, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: `url(${journeyStates[activeMood].image})` }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between mb-12">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-emerald-400" />
            <span className="text-xs text-gray-400 font-medium tracking-wider">Your music. Your story. Your world.</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-white">Emotion Journey</h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-400">Journey Active</span>
        </div>
      </div>

      {/* Journey Timeline */}
      <div className="relative z-10 h-[50vh] flex items-center justify-center">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-10 right-10 h-[2px] bg-white/10 -translate-y-1/2">
          <motion.div
            className="h-full bg-emerald-400"
            initial={{ width: '0%' }}
            animate={{ width: `${(activeMood / (journeyStates.length - 1)) * 100}%` }}
            transition={{ duration: 1 }}
          />
        </div>

        <div className="w-full flex justify-between items-center px-4 relative">
          {journeyStates.map((state, idx) => {
            const isActive = idx === activeMood;
            const isPast = idx < activeMood;
            
            return (
              <div key={state.id} className="flex flex-col items-center relative z-10">
                {/* Node */}
                <div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-500 mb-6 ${
                    isActive ? 'bg-emerald-500 ring-4 ring-emerald-500/30' :
                    isPast ? 'bg-emerald-400/50' : 'bg-white/10'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                
                {/* Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: isActive ? 1 : 0.4, 
                    y: isActive ? 0 : 10,
                    scale: isActive ? 1 : 0.9
                  }}
                  className={`w-32 md:w-48 aspect-[2/3] rounded-2xl overflow-hidden relative border ${
                    isActive ? 'border-white/20 shadow-2xl' : 'border-transparent'
                  }`}
                >
                  <img src={state.image} alt={state.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <h3 className="text-sm font-bold text-white">{state.title}</h3>
                    <p className="text-[10px] text-gray-400">{state.time}</p>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Floating Info */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-10 w-[90%] max-w-xl">
        <motion.div 
          key={activeMood}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
              <img src={journeyStates[activeMood].image} alt="Art" className="w-full h-full object-cover" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{journeyStates[activeMood].track.title}</h4>
              <p className="text-xs text-gray-400">{journeyStates[activeMood].track.artistName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePlay}
              className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors"
            >
              <Play size={16} fill="currentColor" className="ml-0.5" />
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <Heart size={20} />
            </button>
          </div>
        </motion.div>
        <p className="text-center text-xs text-gray-500 mt-4 italic">
          The journey changes with your music.
        </p>
      </div>

    </motion.div>
  );
};

export default EmotionJourney;
