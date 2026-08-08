import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Hero from '../components/Hero';
import AboutSection from '../components/AboutSection';
import AlbumSection from '../components/AlbumSection';
import SongSection from '../components/SongSection';

import { motion } from 'framer-motion';
import { API_URL } from '../config';


const ArtistPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const [artistData, setArtistData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scroll to top when changing artist
    window.scrollTo(0, 0);
    setLoading(true);

    Promise.all([
      fetch(`${API_URL}/api/artists/${id}`).then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      }),
      fetch(`${API_URL}/api/spotify/artist/${id}/top-tracks`).then(res => res.json().catch(() => []))
    ])
    .then(([artistData, topTracks]) => {
      setTheme(artistData);
      
      // Override static songs with live Spotify data if available
      if (topTracks && topTracks.length > 0) {
        artistData.songs = topTracks;
      }
      
      setArtistData(artistData);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      navigate('/');
    });
  }, [id, setTheme, navigate]);

  if (loading || !artistData) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="animate-spin-slow rounded-full h-20 w-20 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      className="min-h-screen bg-background relative overflow-hidden"
    >
      {/* Dynamic Background Image */}
      <div 
        className="fixed inset-0 z-0 opacity-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${API_URL}/artists/${id}/${artistData.backgroundImage})` }}
      />
      
      <div className="relative z-10">
        <Hero artist={artistData} id={id} />
        <AboutSection artist={artistData} />
        <AlbumSection albums={artistData.albums} id={id} />
        <SongSection songs={artistData.songs} />
      </div>
    </motion.div>
  );
};

export default ArtistPage;
