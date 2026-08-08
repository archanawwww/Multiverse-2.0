import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, Sparkles, User, Music, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { API_URL } from '../config';

const AiCompanion = () => {
  const { user, token } = useAuth();
  const { playTrack } = usePlayer();
  const [messages, setMessages] = useState([
    { id: 1, text: `Hi ${user?.display_name || 'Explorer'}! I'm Echo, your AI music companion. How are you feeling today? You can choose a vibe below or tell me what you need.`, sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [availableTracks, setAvailableTracks] = useState([]);
  const [loadingReply, setLoadingReply] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchTracks = async () => {
      try {
        const res = await fetch(`${API_URL}/api/me/top-tracks?time_range=medium_term`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setAvailableTracks(data);
            return;
          }
        }
      } catch (e) {
        console.error('Failed to fetch AI companion tracks:', e);
      }
      // Fallback tracks
      setAvailableTracks([
        { id: 'ai1', title: 'Space Song', artistName: 'Beach House', albumName: 'Depression Cherry', coverUrl: '/images/worlds/space.png', duration: '5:20' },
        { id: 'ai2', title: 'Holocene', artistName: 'Bon Iver', albumName: 'Bon Iver', coverUrl: '/images/worlds/rainy-city.png', duration: '5:37' },
        { id: 'ai3', title: 'Yellow', artistName: 'Coldplay', albumName: 'Parachutes', coverUrl: '/images/worlds/mountain.png', duration: '4:29' },
        { id: 'ai4', title: 'Night Call', artistName: 'Kavinsky', albumName: 'Outrun', coverUrl: '/images/worlds/ocean.png', duration: '4:18' },
        { id: 'ai5', title: 'Teardrop', artistName: 'Massive Attack', albumName: 'Mezzanine', coverUrl: '/images/worlds/sakura.png', duration: '5:31' },
      ]);
    };
    fetchTracks();
  }, [token]);

  const generateAIResponse = (userQuery) => {
    setLoadingReply(true);
    setTimeout(() => {
      const lower = userQuery.toLowerCase();
      let selected = availableTracks[Math.floor(Math.random() * availableTracks.length)] || {
        id: 'default',
        title: 'Space Song',
        artistName: 'Beach House',
        albumName: 'Depression Cherry',
        coverUrl: '/images/worlds/space.png'
      };

      if (lower.includes('calm') || lower.includes('relax') || lower.includes('sleep') || lower.includes('rain')) {
        selected = availableTracks.find(t => t.title.toLowerCase().includes('holocene') || t.artistName.toLowerCase().includes('bon')) || selected;
      } else if (lower.includes('energy') || lower.includes('workout') || lower.includes('pump') || lower.includes('fast')) {
        selected = availableTracks.find(t => t.title.toLowerCase().includes('night') || t.artistName.toLowerCase().includes('kavinsky')) || selected;
      } else if (lower.includes('happy') || lower.includes('sun') || lower.includes('morning')) {
        selected = availableTracks.find(t => t.title.toLowerCase().includes('yellow') || t.artistName.toLowerCase().includes('coldplay')) || selected;
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: `I sense the mood you're in. Here is an immersive track that will align perfectly with your energy right now:`,
        sender: 'ai',
        suggestion: selected
      }]);
      setLoadingReply(false);
    }, 1200);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const query = input;
    const newMsg = { id: Date.now(), text: query, sender: 'user' };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    generateAIResponse(query);
  };

  const handleQuickPrompt = (promptText) => {
    const newMsg = { id: Date.now(), text: promptText, sender: 'user' };
    setMessages(prev => [...prev, newMsg]);
    generateAIResponse(promptText);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-8 px-6 md:px-10 pb-24 flex flex-col h-screen overflow-y-auto relative"
    >
      {/* Background Video */}
      <div className="fixed inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover opacity-70" 
          src="/src/assets/12275385-hd_1920_1028_60fps.mp4" 
        />
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      </div>

      <div className="flex items-start justify-between mb-6 shrink-0 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-blue-400" />
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Your personal guide</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-white">AI Companion</h1>
        </div>
      </div>

      {/* Quick Mood Prompts */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-2 shrink-0 hide-scroll relative z-10">
        {[
          "Need something calm & relaxing 🌧️",
          "High energy workout beats 🔥",
          "Late night drive vibes 🌃",
          "Focus study session 📚",
          "Dreamy celestial soundscape ✨"
        ].map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleQuickPrompt(prompt)}
            className="shrink-0 px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] text-xs text-gray-300 hover:text-white transition-all hover:border-blue-500/50 backdrop-blur-sm"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white/[0.02] border border-white/[0.05] rounded-3xl overflow-hidden shadow-2xl relative max-w-4xl mx-auto w-full mb-6 z-10 backdrop-blur-md">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 hide-scroll">
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-4 max-w-[85%] md:max-w-[75%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {msg.sender === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`flex flex-col gap-3 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-emerald-500/20 text-white rounded-tr-sm border border-emerald-500/30' : 'bg-white/[0.05] text-gray-200 rounded-tl-sm border border-white/[0.05]'}`}>
                  {msg.text}
                </div>
                {msg.suggestion && (
                  <div 
                    onClick={() => playTrack(msg.suggestion, "AI Companion Suggestion", availableTracks)}
                    className="flex items-center gap-4 p-3 bg-white/[0.04] border border-white/[0.1] hover:border-blue-400/50 rounded-2xl cursor-pointer hover:bg-white/[0.08] transition-all group pr-6 shadow-lg"
                  >
                    <img src={msg.suggestion.coverUrl || '/images/worlds/space.png'} alt="Cover" className="w-14 h-14 rounded-xl object-cover" />
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{msg.suggestion.title}</p>
                      <p className="text-xs text-gray-400">{msg.suggestion.artistName || msg.suggestion.artist}</p>
                    </div>
                    <div className="ml-4 w-10 h-10 rounded-full bg-blue-500/20 group-hover:bg-blue-500 flex items-center justify-center text-blue-400 group-hover:text-white transition-all">
                      <Play size={18} fill="currentColor" className="ml-0.5" />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {loadingReply && (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Bot size={20} />
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/[0.05] flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce delay-100" />
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce delay-200" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-white/[0.02] border-t border-white/[0.05]">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tell Echo how you're feeling or pick a vibe above..."
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-full py-4 pl-6 pr-16 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center disabled:opacity-50 disabled:bg-gray-600 hover:bg-blue-400 transition-colors"
            >
              <Send size={16} className="ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default AiCompanion;
