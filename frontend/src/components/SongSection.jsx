import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Heart, Play } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useFavorites } from '../context/FavoritesContext';

const SongSection = ({ songs }) => {
  const { playTrack, currentTrack } = usePlayer();
  const { isFavorite, toggleFavorite } = useFavorites();

  if (!songs || songs.length === 0) return null;

  return (
    <section className="py-24 px-6 max-w-5xl mx-auto">
      <h2 className="text-4xl md:text-5xl font-heading font-bold mb-12 text-center">
        Top Tracks
      </h2>
      
      <div className="space-y-6">
        {songs.map((song, idx) => {
          const favorite = isFavorite(song.title);
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`group flex flex-col md:flex-row items-center gap-6 p-4 rounded-xl bg-white/5 backdrop-blur-md border hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 ${currentTrack?.title === song.title ? 'border-primary shadow-[0_0_20px_rgba(255,255,255,0.05)]' : 'border-white/10 hover:border-primary/50'}`}
            >
              <div className="text-2xl font-bold text-gray-400/50 w-8 text-center">{idx + 1}</div>
              
              <button 
                onClick={() => playTrack(song, "Top Tracks")}
                className="w-12 h-12 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-lg hover:scale-110"
              >
                <Play size={24} fill="currentColor" className="ml-1" />
              </button>
              
              <div className="flex-grow text-center md:text-left cursor-pointer" onClick={() => playTrack(song, "Top Tracks")}>
                <h4 className={`text-xl font-bold mb-1 transition-colors ${currentTrack?.title === song.title ? 'text-primary' : 'text-white group-hover:text-primary'}`}>{song.title}</h4>
                <p className="text-gray-400">{song.duration}</p>
              </div>
              
              <div className="flex gap-4 items-center mt-4 md:mt-0">
                <a 
                  href={song.lyricsLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors bg-black/20 hover:bg-white/10 border border-white/10 rounded-full px-5 py-2.5 backdrop-blur-sm"
                >
                  Lyrics <ExternalLink size={16} />
                </a>
                <button 
                  onClick={() => toggleFavorite(song)}
                  className={`hover:scale-110 transition-all p-2 ${favorite ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
                >
                  <Heart size={24} fill={favorite ? "currentColor" : "none"} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default SongSection;
