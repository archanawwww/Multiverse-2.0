import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Play } from 'lucide-react';
import { API_URL } from '../config';


const Hero = ({ artist, id }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background with parallax */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ y }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background z-10" />
        <img 
          src={`${API_URL}/artists/${id}/${artist.heroImage}`} 
          alt={artist.artistName}
          className="w-full h-full object-cover object-top opacity-60"
        />
      </motion.div>

      {/* Content */}
      <motion.div 
        style={{ opacity }}
        className="relative z-20 text-center px-10 py-16 mt-20 max-w-4xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(255,255,255,0.05)] mx-6"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
      >
        <h1 className="text-5xl md:text-7xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-6 tracking-tighter drop-shadow-lg leading-normal pb-4">
          {artist.artistName}
        </h1>
        <p className="text-xl md:text-2xl text-gray-200 mb-8 font-light italic">
          {artist.genre}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-sm mx-auto sm:max-w-none">
          <a 
            href={artist.spotifyLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-primary text-white px-8 py-3 md:py-4 rounded-full font-bold hover:bg-opacity-80 transition-all hover:scale-105 shadow-lg shadow-primary/30 w-full sm:w-auto whitespace-nowrap text-lg"
          >
            <Play fill="currentColor" size={20} />
            Listen on Spotify
          </a>
          <button 
            onClick={() => document.getElementById('gallery') ? document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' }) : window.scrollTo({ top: 800, behavior: 'smooth' })}
            className="px-8 py-3 md:py-4 rounded-full font-bold border border-white/20 bg-white/10 backdrop-blur-xl hover:bg-white/20 transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:-translate-y-1 w-full sm:w-auto whitespace-nowrap text-lg"
          >
            Explore Gallery
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Hero;
