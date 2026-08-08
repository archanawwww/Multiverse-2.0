import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Music, Disc, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { API_URL } from '../config';


const SearchOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ artists: [], albums: [], songs: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { playTrack } = usePlayer();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setResults({ artists: [], albums: [], songs: [] });
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        isOpen ? onClose() : document.dispatchEvent(new CustomEvent('open-search'));
      }
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ artists: [], albums: [], songs: [] });
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      setLoading(true);
      fetch(`${API_URL}/api/search?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => setResults(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleArtistClick = (id) => {
    navigate(`/artist/${id}`);
    onClose();
  };

  const handleAlbumClick = (artistId, albumName) => {
    navigate(`/artist/${artistId}/album/${encodeURIComponent(albumName)}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-xl flex flex-col items-center pt-20 px-4"
        >
          <div className="w-full max-w-3xl relative">
            <Search className="absolute left-6 top-6 text-gray-400" size={24} />
            <input 
              ref={inputRef}
              type="text"
              placeholder="Search artists, albums, or songs..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-full py-5 pl-16 pr-16 text-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:bg-white/15 transition-all shadow-2xl"
            />
            <button 
              onClick={onClose}
              className="absolute right-6 top-6 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="w-full max-w-3xl mt-8 overflow-y-auto max-h-[70vh] hide-scroll pb-20">
            {loading && <div className="text-center text-primary mt-10">Searching...</div>}
            
            {!loading && query && results.artists.length === 0 && results.albums.length === 0 && results.songs.length === 0 && (
              <div className="text-center text-gray-400 mt-10">No results found for "{query}"</div>
            )}

            {!loading && (
              <div className="space-y-8">
                {results.artists.length > 0 && (
                  <div>
                    <h3 className="text-gray-400 uppercase tracking-widest text-sm font-bold mb-4 flex items-center gap-2"><User size={16}/> Artists</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {results.artists.map(artist => (
                        <div key={artist.id} onClick={() => handleArtistClick(artist.id)} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-primary hover:bg-white/10 cursor-pointer transition-all text-center group">
                          <img src={`${API_URL}${artist.image}`} alt={artist.name} className="w-20 h-20 rounded-full mx-auto mb-3 object-cover group-hover:scale-105 transition-transform" />
                          <h4 className="text-white font-bold">{artist.name}</h4>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.albums.length > 0 && (
                  <div>
                    <h3 className="text-gray-400 uppercase tracking-widest text-sm font-bold mb-4 flex items-center gap-2"><Disc size={16}/> Albums</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {results.albums.map((album, idx) => (
                        <div key={idx} onClick={() => handleAlbumClick(album.artistId, album.name)} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-primary hover:bg-white/10 cursor-pointer transition-all text-center group">
                          <img src={`${API_URL}${album.cover}`} alt={album.name} className="w-full aspect-square rounded-lg mx-auto mb-3 object-cover group-hover:scale-105 transition-transform" />
                          <h4 className="text-white font-bold text-sm truncate">{album.name}</h4>
                          <p className="text-gray-400 text-xs">{album.artistName}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.songs.length > 0 && (
                  <div>
                    <h3 className="text-gray-400 uppercase tracking-widest text-sm font-bold mb-4 flex items-center gap-2"><Music size={16}/> Songs</h3>
                    <div className="flex flex-col gap-2">
                      {results.songs.map((song, idx) => (
                        <div key={idx} onClick={() => { playTrack(song, "Search Results"); onClose(); }} className="bg-white/5 rounded-lg p-3 border border-white/10 hover:border-primary hover:bg-white/10 cursor-pointer transition-all flex justify-between items-center group">
                          <div>
                            <h4 className="text-white font-bold group-hover:text-primary transition-colors">{song.title}</h4>
                            <p className="text-gray-400 text-sm">{song.artistName}</p>
                          </div>
                          <span className="text-gray-500 text-sm">{song.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
