import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass, Smile, BookOpen, Bot, CalendarHeart, Users, User, LogOut, Library, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: Compass, label: 'Explore', path: '/explore-worlds' },
  { icon: Smile, label: 'Mood', path: '/mood' },
  { icon: Sparkles, label: 'Galaxy', path: '/discover-galaxy' },
  { icon: Library, label: 'Library', path: '/library' },
  { icon: Bot, label: 'AI Guide', path: '/ai-companion' },
  { icon: CalendarHeart, label: 'My Year', path: '/my-year' },
  { icon: User, label: 'Profile', path: '/profile' },
];

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed left-0 top-0 bottom-0 w-[78px] bg-black/40 backdrop-blur-[60px] border-r border-white/[0.06] z-50 flex flex-col items-center py-6 gap-2"
    >
      {/* EchoVerse Logo */}
      <NavLink to="/dashboard" className="mb-6 group">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12a4 4 0 0 0 8 0" />
            <circle cx="12" cy="10" r="2" />
          </svg>
        </div>
      </NavLink>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col items-center gap-1 w-full px-2">
        {navItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `relative w-full flex flex-col items-center gap-1 py-3 rounded-xl transition-all duration-300 group ${
                isActive
                  ? 'text-white bg-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.5} />
                <span className="text-[10px] font-medium tracking-wide">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="text-gray-600 hover:text-red-400 transition-colors p-3 rounded-xl hover:bg-white/[0.04]"
        title="Logout"
      >
        <LogOut size={18} />
      </button>
    </motion.aside>
  );
};

export default Sidebar;
