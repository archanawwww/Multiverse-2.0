import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { Settings, Edit3, MapPin, Link as LinkIcon, Music, Play } from 'lucide-react';
import { API_URL } from '../config';

const Profile = () => {
  const { user, token, logout } = useAuth();
  const { playTrack } = usePlayer();
  const [activeTab, setActiveTab] = useState('overview');
  const [genres, setGenres] = useState(['Indie Rock', 'Dream Pop', 'Synthwave', 'Lo-fi Beats', 'Ambient']);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    if (!token) return;

    const fetchProfileData = async () => {
      // Fetch genres from top artists
      try {
        const artRes = await fetch(`${API_URL}/api/me/top-artists?time_range=medium_term`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (artRes.ok) {
          const artists = await artRes.json();
          if (Array.isArray(artists) && artists.length > 0) {
            const allGenres = new Set();
            artists.forEach(a => {
              if (Array.isArray(a.genres)) {
                a.genres.forEach(g => allGenres.add(g.replace(/\b\w/g, l => l.toUpperCase())));
              }
            });
            if (allGenres.size > 0) {
              setGenres(Array.from(allGenres).slice(0, 10));
            }
          }
        }
      } catch (e) {
        console.error('Profile top artists error:', e);
      }

      // Fetch recently played activity
      try {
        const recRes = await fetch(`${API_URL}/api/me/recently-played`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (recRes.ok) {
          const recent = await recRes.json();
          if (Array.isArray(recent) && recent.length > 0) {
            setRecentActivity(recent.slice(0, 5));
          } else {
            setRecentActivity([
              { id: 'p1', title: 'Space Song', artistName: 'Beach House', albumName: 'Depression Cherry', coverUrl: '/images/worlds/space.png' },
              { id: 'p2', title: 'Holocene', artistName: 'Bon Iver', albumName: 'Bon Iver', coverUrl: '/images/worlds/rainy-city.png' },
              { id: 'p3', title: 'Yellow', artistName: 'Coldplay', albumName: 'Parachutes', coverUrl: '/images/worlds/mountain.png' }
            ]);
          }
        }
      } catch (e) {
        console.error('Profile recent activity error:', e);
        setRecentActivity([
          { id: 'p1', title: 'Space Song', artistName: 'Beach House', albumName: 'Depression Cherry', coverUrl: '/images/worlds/space.png' },
          { id: 'p2', title: 'Holocene', artistName: 'Bon Iver', albumName: 'Bon Iver', coverUrl: '/images/worlds/rainy-city.png' }
        ]);
      }
    };

    fetchProfileData();
  }, [token]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-24 overflow-y-auto relative"
    >
      {/* Background Video */}
      <div className="fixed inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover opacity-40 mix-blend-screen" 
          src="/assets/14512643_1920_1080_24fps.mp4" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#05050a]/80 to-[#05050a] pointer-events-none" />
      </div>

      {/* Cover Photo */}
      <div className="h-64 md:h-80 w-full relative z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20" />
        <img 
          src="/assets/be9b28661a704dcca1ee71336f846d6a.jpg" 
          alt="Cover" 
          className="w-full h-full object-cover mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05050a] to-transparent" />
      </div>

      <div className="px-6 md:px-10 max-w-6xl mx-auto -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-8">
          {/* Avatar */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#050505] overflow-hidden bg-[#111] shrink-0 shadow-2xl">
            {user?.images?.[0] ? (
              <img src={user.images[0].url} alt={user.display_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-700">
                {user?.display_name?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          
          {/* Info & Actions */}
          <div className="flex-1 w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-heading font-bold text-white mb-2">{user?.display_name || 'Explorer'}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1"><MapPin size={14} /> {user?.country || 'Earth'}</span>
                <span className="flex items-center gap-1"><Users size={14} /> {user?.followers?.total || 0} Followers</span>
                <span className="flex items-center gap-1"><LinkIcon size={14} /> {user?.id || 'spotify_explorer'}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="px-4 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white text-sm font-medium transition-colors flex items-center gap-2">
                <Edit3 size={16} /> Edit Profile
              </button>
              <button className="w-10 h-10 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white flex items-center justify-center transition-colors">
                <Settings size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8 border-b border-white/[0.05] mb-8">
          {['overview', 'playlists', 'following'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-medium capitalize transition-colors relative ${
                activeTab === tab ? 'text-emerald-400' : 'text-gray-500 hover:text-white'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="profile-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((track, idx) => (
                  <div 
                    key={`${track.id}-${idx}`}
                    onClick={() => playTrack(track, track.albumName, recentActivity)}
                    className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 flex items-center justify-between hover:bg-white/[0.05] cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      {track.coverUrl && (
                        <img src={track.coverUrl} alt={track.title} className="w-12 h-12 rounded-xl object-cover" />
                      )}
                      <div>
                        <h4 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">{track.title}</h4>
                        <p className="text-xs text-gray-400">{track.artistName}</p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play size={14} className="text-emerald-400 ml-0.5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 flex items-center justify-center h-48">
                <p className="text-gray-500 text-sm">No recent activity to show.</p>
              </div>
            )}
          </div>
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white mb-4">Favorite Genres</h3>
            <div className="flex flex-wrap gap-2">
              {genres.map(genre => (
                <span key={genre} className="px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] text-xs text-gray-300">
                  {genre}
                </span>
              ))}
            </div>
            
            <button onClick={logout} className="w-full mt-8 py-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-semibold">
              Disconnect Spotify (Logout)
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Helper for followers icon
const Users = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <line x1="20" y1="8" x2="20" y2="14"></line>
    <line x1="23" y1="11" x2="17" y2="11"></line>
  </svg>
);

export default Profile;
