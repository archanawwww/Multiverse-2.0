import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Music, Search, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import SearchOverlay from './SearchOverlay';

const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleOpenSearch = () => setIsSearchOpen(true);
    document.addEventListener('open-search', handleOpenSearch);
    return () => document.removeEventListener('open-search', handleOpenSearch);
  }, []);

  return (
    <>
      <motion.nav 
        initial={{ y: -50, opacity: 0, x: "-50%" }}
        animate={{ y: 0, opacity: 1, x: "-50%" }}
        className="fixed top-6 left-1/2 w-[90%] max-w-5xl z-50 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.05)]"
      >
        <div className="px-5 md:px-8 py-3 md:py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-xl md:text-2xl font-heading font-bold group">
            <Music className="w-6 h-6 md:w-7 md:h-7 text-gray-300 group-hover:-rotate-12 transition-transform duration-300" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">MusicVerse</span>
          </Link>
          
          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden sm:flex gap-6 font-semibold text-sm">
              <Link to="/" className="hover:text-accent transition-colors">Discover</Link>
              <Link to="/library" className="hover:text-accent transition-colors">My Library</Link>
            </div>
            
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="text-gray-300 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all"
              title="Search (Cmd+K)"
            >
              <Search size={20} />
            </button>

            <button className="sm:hidden text-gray-300 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </motion.nav>
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;
