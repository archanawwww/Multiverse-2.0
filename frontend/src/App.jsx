import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { PlayerProvider } from './context/PlayerContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AnimatePresence } from 'framer-motion';

import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ExploreWorlds from './pages/ExploreWorlds';
import DiscoverGalaxy from './pages/DiscoverGalaxy';
import MusicPlayerPage from './pages/MusicPlayerPage';
import EmotionJourney from './pages/EmotionJourney';
import LibraryPage from './pages/LibraryPage';
import ArtistPage from './pages/ArtistPage';
import AlbumPage from './pages/AlbumPage';
import LoginSuccess from './pages/LoginSuccess';
import AiCompanion from './pages/AiCompanion';
import MyYear from './pages/MyYear';
import Mood from './pages/Mood';
import Profile from './pages/Profile';

import Sidebar from './components/Sidebar';
import GlobalPlayer from './components/GlobalPlayer';

import SearchOverlay from './components/SearchOverlay';
import { useState, useEffect } from 'react';

// Wrapper for pages that should have the sidebar layout
const AppLayout = ({ children }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleOpenSearch = () => setIsSearchOpen(true);
    document.addEventListener('open-search', handleOpenSearch);
    return () => document.removeEventListener('open-search', handleOpenSearch);
  }, []);

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-[78px] overflow-y-auto relative z-10">
        {children}
      </main>
      <GlobalPlayer />
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};

function MainRoutes() {
  const location = useLocation();
  const { token } = useAuth();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Unauthenticated / No Sidebar */}
        <Route path="/" element={token ? <Navigate to="/dashboard" /> : <LandingPage />} />
        <Route path="/login-success" element={<LoginSuccess />} />
        
        {/* Player Page (Full Screen, No Sidebar) */}
        <Route path="/player" element={
          token ? <MusicPlayerPage /> : <Navigate to="/" />
        } />
        
        {/* Authenticated / Sidebar Layout */}
        <Route path="/dashboard" element={token ? <AppLayout><Dashboard /></AppLayout> : <Navigate to="/" />} />
        <Route path="/explore-worlds" element={token ? <AppLayout><ExploreWorlds /></AppLayout> : <Navigate to="/" />} />
        <Route path="/discover-galaxy" element={token ? <AppLayout><DiscoverGalaxy /></AppLayout> : <Navigate to="/" />} />
        <Route path="/mood" element={token ? <AppLayout><Mood /></AppLayout> : <Navigate to="/" />} />
        <Route path="/emotion-journey" element={token ? <AppLayout><EmotionJourney /></AppLayout> : <Navigate to="/" />} />
        <Route path="/ai-companion" element={token ? <AppLayout><AiCompanion /></AppLayout> : <Navigate to="/" />} />
        <Route path="/my-year" element={token ? <AppLayout><MyYear /></AppLayout> : <Navigate to="/" />} />
        <Route path="/profile" element={token ? <AppLayout><Profile /></AppLayout> : <Navigate to="/" />} />
        
        <Route path="/library" element={token ? <AppLayout><LibraryPage /></AppLayout> : <Navigate to="/" />} />
        <Route path="/artist/:id" element={token ? <AppLayout><ArtistPage /></AppLayout> : <Navigate to="/" />} />
        <Route path="/artist/:id/album/:albumName" element={token ? <AppLayout><AlbumPage /></AppLayout> : <Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <FavoritesProvider>
          <PlayerProvider>
            <Router>
              <MainRoutes />
            </Router>
          </PlayerProvider>
        </FavoritesProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
