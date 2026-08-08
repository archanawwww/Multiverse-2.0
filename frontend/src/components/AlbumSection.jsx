import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';


const AlbumSection = ({ albums, id }) => {
  if (!albums || albums.length === 0) return null;

  const getObjectPosition = (artistId, albumName) => {
    if (artistId === 'dualipa') return 'object-top';
    if (albumName === 'Justice' || albumName === 'SOUR') return 'object-top';
    return 'object-center';
  };

  const getZoomClasses = (albumName) => {
    if (albumName === 'Stars Dance') {
      return 'scale-[1.15] group-hover:scale-[1.20] group-hover:rotate-1';
    }
    return 'group-hover:scale-105 group-hover:rotate-1';
  };

  return (
    <section className="py-24 px-6 bg-black/40">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-heading font-bold mb-16 text-center">
          Discography
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {albums.map((album, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -10 }}
            >
              <Link
                to={`/artist/${id}/album/${encodeURIComponent(album.name)}`}
                className="group block relative rounded-xl overflow-hidden shadow-2xl bg-card border border-white/5 h-full"
              >
              <div className="aspect-square w-full overflow-hidden">
                <img 
                  src={`${API_URL}/artists/${id}/${album.cover}`} 
                  alt={album.name}
                  className={`w-full h-full object-cover transition-transform duration-500 ${getZoomClasses(album.name)} ${getObjectPosition(id, album.name)}`}
                />
              </div>
              <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{album.name}</h3>
                <div className="flex justify-between items-center text-sm text-gray-300">
                  <span>{album.releaseYear}</span>
                  <span>{album.trackCount} Tracks</span>
                </div>
              </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AlbumSection;
