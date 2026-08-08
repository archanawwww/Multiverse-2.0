import React from 'react';
import { Music } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-black/80 backdrop-blur-xl border-t border-white/10 pt-16 pb-32 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <Link to="/" className="flex items-center gap-2 text-2xl font-heading font-bold mb-4 group">
            <Music className="w-8 h-8 text-primary group-hover:-rotate-12 transition-transform duration-300" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">MusicVerse</span>
          </Link>
          <p className="text-gray-400 max-w-sm">
            Experience your favorite artists in a fully immersive, personalized musical journey. Tailored aesthetics for every album.
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-4">Explore</h4>
          <ul className="space-y-2 text-gray-400">
            <li><Link to="/" className="hover:text-primary transition-colors">Discover</Link></li>
            <li><Link to="/library" className="hover:text-primary transition-colors">My Library</Link></li>
            <li><button onClick={() => document.dispatchEvent(new CustomEvent('open-search'))} className="hover:text-primary transition-colors">Search</button></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-4">Connect</h4>
          <div className="flex gap-4 text-gray-400">
          </div>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto mt-12 pt-8 border-t border-white/10 text-center text-gray-500 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <p>&copy; {new Date().getFullYear()} MusicVerse. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
