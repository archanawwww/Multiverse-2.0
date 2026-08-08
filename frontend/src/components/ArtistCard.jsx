import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_URL } from '../config';


const ArtistCard = ({ artist }) => {
  return (
    <Link to={`/artist/${artist.id}`}>
      <motion.div 
        whileHover={{ scale: 1.05, y: -10 }}
        whileTap={{ scale: 0.95 }}
        className="relative group cursor-pointer rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.05)] bg-white/5 backdrop-blur-2xl border border-white/10"
      >
        <div className="h-80 w-full overflow-hidden relative p-2 pb-0">
          <img 
            src={`${API_URL}${artist.heroImage}`} 
            alt={artist.name} 
            className="w-full h-full object-cover rounded-xl transition-transform duration-700 group-hover:scale-110"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
        </div>
        
        <div className="absolute bottom-0 left-0 p-6 w-full">
          <h3 className="text-3xl font-heading font-bold text-white mb-1 drop-shadow-md group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-emerald-400 group-active:text-transparent group-active:bg-clip-text group-active:bg-gradient-to-r group-active:from-cyan-400 group-active:to-emerald-400 transition-all duration-300">
            {artist.name}
          </h3>
          <p className="text-gray-300 text-sm flex justify-between items-center mt-2">
            <span>{artist.genre}</span>
            <span className="bg-white/10 backdrop-blur-md border border-white/10 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-inner">
              {artist.albumCount} Albums
            </span>
          </p>
        </div>
        
        {/* Glow effect based on theme color */}
        <div 
          className="absolute -inset-1 opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-500 rounded-2xl -z-10"
          style={{ backgroundColor: artist.themeColors.primary }}
        />
      </motion.div>
    </Link>
  );
};

export default ArtistCard;
