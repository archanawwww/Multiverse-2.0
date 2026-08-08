import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { useFavorites } from '../context/FavoritesContext';
import {
  ChevronDown, Play, Pause, SkipBack, SkipForward,
  Shuffle, Repeat, Repeat1, Heart, Maximize2, MoreHorizontal, ListMusic
} from 'lucide-react';

const MusicPlayerPage = () => {
  const navigate = useNavigate();
  const {
    currentTrack, isPlaying, togglePlay,
    skipNext, skipPrev, shuffle, repeat,
    toggleShuffle, toggleRepeat, progress, duration,
    setProgress, setDuration, audioRef, setIsPlaying
  } = usePlayer();
  const { isFavorite, toggleFavorite } = useFavorites();
  const localAudioRef = useRef(null);

  // Sync with global player state
  useEffect(() => {
    const ref = localAudioRef.current;
    if (currentTrack?.previewUrl && ref && ref.src !== currentTrack.previewUrl) {
      ref.src = currentTrack.previewUrl;
      if (isPlaying) ref.play().catch(() => {});
    }
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    const ref = localAudioRef.current;
    if (ref) {
      if (isPlaying) {
        ref.play().catch(() => {});
      } else {
        ref.pause();
      }
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    const ref = localAudioRef.current;
    if (ref && ref.duration) {
      setProgress((ref.currentTime / ref.duration) * 100);
      setDuration(ref.duration);
    }
  };

  const handleSeek = (e) => {
    const ref = localAudioRef.current;
    if (!ref || !ref.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    ref.currentTime = pct * ref.duration;
  };

  const handleEnded = () => {
    if (repeat === 'one') {
      const ref = localAudioRef.current;
      if (ref) { ref.currentTime = 0; ref.play(); }
    } else {
      skipNext();
    }
  };

  const formatTime = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (!currentTrack) {
    return (
      <div className="h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-heading font-bold mb-4">No track playing</h2>
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors">
          Go back
        </button>
      </div>
    );
  }

  const currentTime = localAudioRef.current?.currentTime || 0;

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[200] bg-[#050505] text-white flex flex-col md:flex-row overflow-hidden"
    >
      <audio
        ref={localAudioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {/* Left Side: Vinyl Player */}
      <div className="flex-1 flex flex-col items-center justify-center relative p-8">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-8 left-8 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <ChevronDown size={24} />
        </button>

        {/* Vinyl Record */}
        <div className="relative w-64 h-64 md:w-96 md:h-96 rounded-full bg-[#111] shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/5 flex items-center justify-center p-2 mt-12 md:mt-0">
          <div className="absolute inset-0 rounded-full bg-[repeating-radial-gradient(circle_at_center,transparent,transparent_2px,rgba(255,255,255,0.02)_2px,rgba(255,255,255,0.02)_4px)]" />
          <motion.div
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="w-full h-full rounded-full flex items-center justify-center border-4 border-black/40 overflow-hidden"
          >
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-[6px] border-[#222]">
              <img src={currentTrack.coverUrl} alt="Album Art" className="w-full h-full object-cover" />
            </div>
            <div className="absolute w-4 h-4 bg-[#111] rounded-full z-10" />
            <div className="absolute w-2 h-2 bg-gray-500 rounded-full z-20" />
          </motion.div>
          {/* Tone Arm (visual only) */}
          <div className={`absolute -right-8 top-8 w-4 h-48 bg-gray-300 rounded-full origin-top transform transition-transform duration-1000 ${isPlaying ? 'rotate-[25deg]' : 'rotate-0'} shadow-xl z-30`}>
            <div className="absolute -left-3 bottom-0 w-8 h-12 bg-[#222] rounded-md shadow-md" />
            <div className="absolute left-1 top-2 w-2 h-2 rounded-full bg-black/50" />
          </div>
        </div>
      </div>

      {/* Right Side: Details & Controls */}
      <div className="flex-1 flex flex-col justify-center p-8 md:p-16 border-l border-white/5 bg-gradient-to-l from-black/20 to-transparent">
        <div className="max-w-md w-full mx-auto md:mx-0">
          <div className="flex items-center justify-between mb-8">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Now Playing</span>
            <button className="text-gray-500 hover:text-white transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>

          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-2 truncate">
            {currentTrack.title}
          </h1>
          <p className="text-xl text-gray-400 mb-8 truncate">{currentTrack.artistName}</p>

          {/* Fake Lyrics */}
          <div className="h-32 overflow-hidden mb-12 relative fade-edges">
            <motion.div
              animate={{ y: isPlaying ? [-20, -100] : 0 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              className="space-y-4 text-lg md:text-xl font-heading font-medium text-gray-300/80 text-center md:text-left"
            >
              <p>Look at the stars</p>
              <p>Look how they shine for you</p>
              <p>And everything you do</p>
              <p>Yeah, they were all yellow</p>
              <p>I came along</p>
              <p>I wrote a song for you</p>
              <p>And all the things you do</p>
            </motion.div>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div
              className="w-full h-1.5 bg-white/10 rounded-full cursor-pointer group relative mb-3"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-emerald-400 rounded-full relative shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 shadow-md transition-opacity" />
              </div>
            </div>
            <div className="flex justify-between text-xs font-medium text-gray-500">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={toggleShuffle}
              className={`transition-colors ${shuffle ? 'text-emerald-400' : 'text-gray-500 hover:text-white'}`}
            >
              <Shuffle size={20} />
            </button>
            <button onClick={skipPrev} className="text-gray-300 hover:text-white transition-colors">
              <SkipBack size={28} fill="currentColor" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={!currentTrack.previewUrl}
              className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center text-black hover:scale-105 transition-transform shadow-[0_0_30px_rgba(52,211,153,0.3)] disabled:opacity-50"
            >
              {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-2" />}
            </button>
            <button onClick={skipNext} className="text-gray-300 hover:text-white transition-colors">
              <SkipForward size={28} fill="currentColor" />
            </button>
            <button
              onClick={toggleRepeat}
              className={`transition-colors ${repeat !== 'off' ? 'text-emerald-400' : 'text-gray-500 hover:text-white'}`}
            >
              {repeat === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
            </button>
          </div>
          
          {/* Bottom Actions */}
          <div className="flex items-center justify-between mt-10">
            <button
              onClick={() => toggleFavorite(currentTrack)}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isFavorite(currentTrack.title) ? 'text-emerald-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Heart size={18} fill={isFavorite(currentTrack.title) ? 'currentColor' : 'none'} />
              {isFavorite(currentTrack.title) ? 'Saved' : 'Save'}
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <ListMusic size={20} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Background blur of album art */}
      <div 
        className="absolute inset-0 z-[-1] opacity-20 bg-cover bg-center blur-3xl scale-110"
        style={{ backgroundImage: `url(${currentTrack.coverUrl})` }}
      />
    </motion.div>
  );
};

export default MusicPlayerPage;
