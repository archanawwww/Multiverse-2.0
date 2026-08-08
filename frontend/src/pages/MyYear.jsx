import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Play, CalendarHeart, Music } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { API_URL } from '../config';

const MyYear = () => {
  const { user, token } = useAuth();
  const { playTrack } = usePlayer();
  const [topArtists, setTopArtists] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [topGenre, setTopGenre] = useState('Dream Pop');
  const [minutesListened, setMinutesListened] = useState('42,501');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchYearStats = async () => {
      try {
        // Fetch long term top artists
        let artistsData = [];
        try {
          const artRes = await fetch(`${API_URL}/api/me/top-artists?time_range=long_term`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (artRes.ok) artistsData = await artRes.json();
        } catch (e) {
          console.error('Top artists fetch error in MyYear:', e);
        }

        if (Array.isArray(artistsData) && artistsData.length > 0) {
          setTopArtists(artistsData.slice(0, 5));
          // Calculate top genre by counting occurrences across all top artists
          const genreCounts = {};
          artistsData.forEach(art => {
            if (Array.isArray(art.genres)) {
              art.genres.forEach(g => {
                genreCounts[g] = (genreCounts[g] || 0) + 1;
              });
            }
          });
          const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
          if (sortedGenres.length > 0) {
            // Capitalize each word of genre
            const capitalized = sortedGenres[0][0].replace(/\b\w/g, l => l.toUpperCase());
            setTopGenre(capitalized);
          }
        } else {
          setTopArtists([
            { id: '1', name: 'Beach House', coverUrl: '/images/worlds/space.png' },
            { id: '2', name: 'Coldplay', coverUrl: '/images/worlds/mountain.png' },
            { id: '3', name: 'Bon Iver', coverUrl: '/images/worlds/rainy-city.png' },
            { id: '4', name: 'The Neighbourhood', coverUrl: '/images/worlds/ocean.png' },
            { id: '5', name: 'Tame Impala', coverUrl: '/images/worlds/dream-forest.png' }
          ]);
        }

        // Fetch long term top tracks
        let tracksData = [];
        try {
          const trkRes = await fetch(`${API_URL}/api/me/top-tracks?time_range=long_term`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (trkRes.ok) tracksData = await trkRes.json();
        } catch (e) {
          console.error('Top tracks fetch error in MyYear:', e);
        }

        if (Array.isArray(tracksData) && tracksData.length > 0) {
          setTopTracks(tracksData.slice(0, 5));
          // Estimate minutes based on number of top tracks and average plays
          const totalMs = tracksData.reduce((acc, t) => acc + (t.durationMs || 210000), 0);
          const estimatedMins = Math.floor((totalMs / 60000) * 18 + 12000);
          setMinutesListened(estimatedMins.toLocaleString());
        } else {
          setTopTracks([
            { id: 't1', title: 'Space Song', artistName: 'Beach House', albumName: 'Depression Cherry', coverUrl: '/images/worlds/space.png' },
            { id: 't2', title: 'Yellow', artistName: 'Coldplay', albumName: 'Parachutes', coverUrl: '/images/worlds/mountain.png' },
            { id: 't3', title: 'Holocene', artistName: 'Bon Iver', albumName: 'Bon Iver', coverUrl: '/images/worlds/rainy-city.png' }
          ]);
        }

      } catch (err) {
        console.error('MyYear stats fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchYearStats();
  }, [token]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-8 px-6 md:px-10 pb-24 relative overflow-y-auto"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex items-start justify-between mb-12 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarHeart size={16} className="text-purple-400" />
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Your musical journey</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-white">
            {user?.display_name ? `${user.display_name}'s Year so far` : 'My Year so far'} ✨
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="col-span-1 md:col-span-2 bg-gradient-to-br from-purple-500/20 to-blue-500/10 border border-white/[0.08] rounded-3xl p-8 flex flex-col justify-center">
            <h2 className="text-5xl font-heading font-bold text-white mb-2">{minutesListened}</h2>
            <p className="text-gray-400 font-medium uppercase tracking-widest text-sm">Estimated Minutes Listened</p>
          </motion.div>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 flex flex-col justify-center">
            <h3 className="text-gray-500 font-medium uppercase tracking-widest text-xs mb-4">Top Genre</h3>
            <div className="text-3xl font-heading font-bold text-emerald-400">{topGenre}</div>
            <p className="text-sm text-gray-400 mt-2">You were definitely floating in this vibe.</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8">
            <h3 className="text-gray-500 font-medium uppercase tracking-widest text-xs mb-6">Top Artists of the Year</h3>
            <div className="space-y-4">
              {topArtists.map((artist, idx) => (
                <div key={artist.id || idx} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-gray-600 group-hover:text-emerald-400 transition-colors">#{idx + 1}</span>
                    {artist.coverUrl && (
                      <img src={artist.coverUrl} alt={artist.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                    )}
                    <span className="text-white font-medium">{artist.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8">
            <h3 className="text-gray-500 font-medium uppercase tracking-widest text-xs mb-6">Top Anthems</h3>
            <div className="space-y-4">
              {topTracks.map((track, idx) => (
                <div 
                  key={track.id || idx} 
                  onClick={() => playTrack(track, track.albumName, topTracks)}
                  className="flex items-center justify-between group cursor-pointer hover:bg-white/[0.04] p-2 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <span className="text-lg font-bold text-gray-600 group-hover:text-emerald-400 transition-colors">#{idx + 1}</span>
                    {track.coverUrl && (
                      <img src={track.coverUrl} alt={track.title} className="w-10 h-10 rounded-lg object-cover border border-white/10" />
                    )}
                    <div className="truncate">
                      <div className="text-white font-medium truncate group-hover:text-emerald-400 transition-colors">{track.title}</div>
                      <div className="text-xs text-gray-500 truncate">{track.artistName}</div>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={14} className="text-emerald-400 ml-0.5" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-white/[0.08] rounded-3xl p-8 flex flex-col items-center justify-center text-center">
          <Sparkles size={32} className="text-emerald-400 mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Your 2026 Aura: {topGenre} Resonance</h3>
          <p className="text-gray-400 mb-6 max-w-md">Your listening habits reflect a profound connection to immersive soundscapes, blending high energy rhythms with deep emotional resonance.</p>
          <div className="w-32 h-32 rounded-full blur-xl bg-gradient-to-r from-emerald-400 via-purple-500 to-blue-500 opacity-60 mix-blend-screen animate-pulse" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MyYear;
