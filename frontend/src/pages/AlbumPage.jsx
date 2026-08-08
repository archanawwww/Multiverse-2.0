import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { usePlayer } from '../context/PlayerContext';
import { useFavorites } from '../context/FavoritesContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Heart } from 'lucide-react';
import { API_URL } from '../config';


const AlbumPage = () => {
  const { id, albumName } = useParams();
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const { playTrack, currentTrack } = usePlayer();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const [artist, setArtist] = useState(null);
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    fetch(`${API_URL}/api/artists/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        setTheme(data);
        setArtist(data);
        
        const foundAlbum = data.albums.find(a => a.name === decodeURIComponent(albumName));
        if (!foundAlbum) throw new Error('Album not found');
        
        setAlbum(foundAlbum);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        navigate(`/artist/${id}`);
      });
  }, [id, albumName, setTheme, navigate]);

  if (loading || !album) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="animate-spin-slow rounded-full h-20 w-20 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Use a strictly unique image for every track by calculating its absolute index across all albums
  const getTrackImage = (idx) => {
    const gallery = artist.gallery || [];
    if (gallery.length === 0) return `${API_URL}/artists/${id}/${album.cover}`;
    
    // Find how many tracks belong to albums that came before this one
    let previousTracksCount = 0;
    if (artist.albums) {
      for (let i = 0; i < artist.albums.length; i++) {
        if (artist.albums[i].name === album.name) break;
        previousTracksCount += artist.albums[i].tracks.length;
      }
    }
    
    return `${API_URL}/artists/${id}/${gallery[(idx + previousTracksCount) % gallery.length]}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      className="min-h-screen bg-background relative overflow-hidden pb-32"
    >
      {/* Dynamic Background Image */}
      <div 
        className="fixed inset-0 z-0 opacity-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${API_URL}/artists/${id}/${artist.backgroundImage})` }}
      />
      
      <div className="relative z-10 pt-32 max-w-[100vw]">
        <div className="px-6 md:px-12 mb-12">
          <button 
            onClick={() => navigate(`/artist/${id}`)}
            className="flex items-center gap-2 text-primary hover:text-white transition-colors mb-6 font-bold uppercase tracking-widest text-sm"
          >
            <ArrowLeft size={16} /> Back to {artist.artistName}
          </button>

          <h1 className="text-5xl md:text-8xl font-heading font-bold text-white leading-none tracking-tighter mb-2">
            {album.name}
          </h1>
          <p className="text-xl text-gray-400 font-light italic">
            Select a track to play
          </p>
        </div>

        {/* Cinematic Horizontal Scroll */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 px-6 md:px-12 pb-12 pt-4 hide-scroll">
          {album.tracks && album.tracks.map((track, idx) => {
            const favorite = isFavorite(track.title);
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => playTrack(track, album.name)}
                className={`snap-center shrink-0 relative group cursor-pointer w-[75vw] md:w-[400px] h-[60vh] md:h-[600px] rounded-3xl overflow-hidden shadow-2xl border ${currentTrack?.title === track.title ? 'border-primary shadow-[0_0_40px_rgba(255,255,255,0.1)]' : 'border-white/10'}`}
              >
                <img 
                  src={getTrackImage(idx)} 
                  alt={track.title}
                  className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${id === 'dualipa' ? 'object-top' : 'object-center'}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-16 h-16 rounded-full bg-primary/80 backdrop-blur-md flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform">
                    <Play size={32} fill="currentColor" className="ml-1" />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-8 text-left flex justify-between items-end">
                  <div>
                    <p className="text-primary font-bold tracking-widest text-sm uppercase mb-2">Track {idx + 1}</p>
                    <h3 className="text-3xl md:text-4xl font-heading font-bold text-white group-hover:text-primary transition-colors">
                      {track.title}
                    </h3>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(track); }}
                    className={`hover:scale-110 transition-all p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10 ${favorite ? 'text-red-500' : 'text-white hover:text-red-400'}`}
                  >
                    <Heart size={24} fill={favorite ? "currentColor" : "none"} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default AlbumPage;
