import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Heart, HeartCrack, Library, Sparkles } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const LibraryPage = () => {
  const { favorites, toggleFavorite } = useFavorites();
  const { playTrack, currentTrack } = usePlayer();
  const { token } = useAuth();
  const [spotifyTracks, setSpotifyTracks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchSavedTracks = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/me/saved-tracks`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setSpotifyTracks(data);
          } else {
            // Fallback saved tracks
            setSpotifyTracks([
              { id: 'st1', title: 'Space Song', artistName: 'Beach House', albumName: 'Depression Cherry', coverUrl: '/images/worlds/space.png', duration: '5:20' },
              { id: 'st2', title: 'Holocene', artistName: 'Bon Iver', albumName: 'Bon Iver', coverUrl: '/images/worlds/rainy-city.png', duration: '5:37' },
              { id: 'st3', title: 'Yellow', artistName: 'Coldplay', albumName: 'Parachutes', coverUrl: '/images/worlds/mountain.png', duration: '4:29' },
            ]);
          }
        } else {
          setSpotifyTracks([
            { id: 'st1', title: 'Space Song', artistName: 'Beach House', albumName: 'Depression Cherry', coverUrl: '/images/worlds/space.png', duration: '5:20' },
            { id: 'st2', title: 'Holocene', artistName: 'Bon Iver', albumName: 'Bon Iver', coverUrl: '/images/worlds/rainy-city.png', duration: '5:37' },
          ]);
        }
      } catch (e) {
        console.error('Failed to fetch saved tracks:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchSavedTracks();
  }, [token]);

  // Merge favorites and spotify tracks, deduplicate by title
  const allTracks = [...favorites, ...spotifyTracks].filter(
    (track, idx, arr) => arr.findIndex(t => t.title === track.title) === idx
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      className="min-h-screen bg-background relative overflow-y-auto pt-32 pb-32 px-6"
    >
      <div className="fixed inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover opacity-60 mix-blend-screen" 
          src="/assets/12286527-hd_1920_1028_60fps.mp4" 
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#05050a]/90 via-[#05050a]/70 to-transparent pointer-events-none" />
      </div>
      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex items-center gap-4"
        >
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-primary">
            <Library size={32} />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-2">My Library</h1>
            <p className="text-gray-400">{allTracks.length} saved & liked songs</p>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          </div>
        ) : allTracks.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 px-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl"
          >
            <HeartCrack size={64} className="mx-auto text-gray-500 mb-6" />
            <h2 className="text-3xl font-heading font-bold text-white mb-4">Your library is empty</h2>
            <p className="text-gray-400 text-lg max-w-md mx-auto">
              Explore artists and click the heart icon on any track to save it to your personal library.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {allTracks.map((song, idx) => (
              <motion.div
                key={`${song.id || song.title}-${idx}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`group flex flex-col md:flex-row items-center gap-6 p-4 rounded-xl bg-white/5 backdrop-blur-md border hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 ${currentTrack?.title === song.title ? 'border-primary shadow-[0_0_20px_rgba(255,255,255,0.05)]' : 'border-white/10 hover:border-primary/50'}`}
              >
                {song.coverUrl ? (
                  <img src={song.coverUrl} alt={song.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                ) : (
                  <button 
                    onClick={() => playTrack(song, "My Library", allTracks)}
                    className="w-12 h-12 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-lg hover:scale-110"
                  >
                    <Play size={24} fill="currentColor" className="ml-1" />
                  </button>
                )}
                
                <div className="flex-grow text-center md:text-left cursor-pointer" onClick={() => playTrack(song, "My Library", allTracks)}>
                  <h4 className={`text-xl font-bold mb-1 transition-colors ${currentTrack?.title === song.title ? 'text-primary' : 'text-white group-hover:text-primary'}`}>{song.title}</h4>
                  <p className="text-gray-400">{song.artistName || 'Unknown artist'} • {song.duration || '3:30'}</p>
                </div>
                
                <div className="flex gap-4 items-center mt-4 md:mt-0">
                  {song.lyricsLink && (
                    <a 
                      href={song.lyricsLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors bg-black/20 hover:bg-white/10 border border-white/10 rounded-full px-5 py-2.5 backdrop-blur-sm"
                    >
                      Lyrics
                    </a>
                  )}
                  <button 
                    onClick={() => toggleFavorite(song)}
                    className="text-red-500 hover:scale-110 transition-all p-2"
                  >
                    <Heart size={24} fill="currentColor" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LibraryPage;
