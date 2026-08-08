import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Maximize2, Heart, ListMusic } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useFavorites } from '../context/FavoritesContext';
import { useNavigate } from 'react-router-dom';

const GlobalPlayer = () => {
  const {
    currentTrack, isPlaying, albumContext,
    stopPlayback, setIsPlaying, skipNext, skipPrev,
    shuffle, repeat, toggleShuffle, toggleRepeat,
    progress, setProgress, duration, setDuration, audioRef
  } = usePlayer();
  const { isFavorite, toggleFavorite } = useFavorites();
  const localAudioRef = useRef(null);
  const navigate = useNavigate();

  // Use the shared audioRef or local
  const audio = audioRef?.current || localAudioRef.current;

  useEffect(() => {
    const ref = localAudioRef.current;
    if (currentTrack?.previewUrl && ref) {
      ref.src = currentTrack.previewUrl;
      ref.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [currentTrack, setIsPlaying]);

  const togglePlay = () => {
    const ref = localAudioRef.current;
    if (!ref) return;
    if (isPlaying) {
      ref.pause();
    } else {
      ref.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

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

  if (!currentTrack) return null;

  const currentTime = localAudioRef.current?.currentTime || 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-[100] h-[80px] bg-black/40 backdrop-blur-[60px] border-t border-white/[0.08]"
      >
        <audio
          ref={localAudioRef}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        />

        <div className="flex items-center h-full px-4 md:px-6 gap-4">
          {/* Track Info */}
          <div className="flex items-center gap-3 min-w-0 w-[30%]">
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-lg">
              <img
                src={currentTrack.coverUrl || '/images/landing-bg.png'}
                alt={currentTrack.title}
                className={`w-full h-full object-cover ${isPlaying ? 'animate-[spin_12s_linear_infinite]' : ''}`}
                style={{ borderRadius: isPlaying ? '50%' : '8px' }}
              />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-white truncate">{currentTrack.title}</h4>
              <p className="text-xs text-gray-400 truncate">{currentTrack.artistName || 'Artist'}</p>
            </div>
            <button
              onClick={() => toggleFavorite(currentTrack)}
              className={`ml-2 shrink-0 transition-colors ${isFavorite(currentTrack.title) ? 'text-emerald-400' : 'text-gray-500 hover:text-white'}`}
            >
              <Heart size={16} fill={isFavorite(currentTrack.title) ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Controls + Progress */}
          <div className="flex flex-col items-center flex-1 max-w-2xl gap-1">
            <div className="flex items-center gap-5">
              <button
                onClick={toggleShuffle}
                className={`transition-colors ${shuffle ? 'text-emerald-400' : 'text-gray-500 hover:text-white'}`}
              >
                <Shuffle size={16} />
              </button>
              <button onClick={skipPrev} className="text-gray-400 hover:text-white transition-colors">
                <SkipBack size={18} fill="currentColor" />
              </button>
              <button
                onClick={togglePlay}
                disabled={!currentTrack.previewUrl}
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 transition-transform disabled:opacity-40"
              >
                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
              </button>
              <button onClick={skipNext} className="text-gray-400 hover:text-white transition-colors">
                <SkipForward size={18} fill="currentColor" />
              </button>
              <button
                onClick={toggleRepeat}
                className={`transition-colors ${repeat !== 'off' ? 'text-emerald-400' : 'text-gray-500 hover:text-white'}`}
              >
                {repeat === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
              </button>
            </div>
            <div className="flex items-center gap-2 w-full">
              <span className="text-[10px] text-gray-500 w-8 text-right">{formatTime(currentTime)}</span>
              <div
                className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer group relative"
                onClick={handleSeek}
              >
                <div
                  className="h-full bg-white group-hover:bg-emerald-400 rounded-full transition-colors relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow" />
                </div>
              </div>
              <span className="text-[10px] text-gray-500 w-8">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3 w-[20%] justify-end">
            <button
              onClick={() => navigate('/library')}
              className="text-gray-500 hover:text-emerald-400 transition-colors"
              title="Library"
            >
              <ListMusic size={16} />
            </button>
            <button
              onClick={() => navigate('/player')}
              className="text-gray-500 hover:text-white transition-colors hidden md:block"
              title="Full Screen Player"
            >
              <Maximize2 size={16} />
            </button>
            <button
              onClick={stopPlayback}
              className="text-gray-500 hover:text-red-400 transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {!currentTrack.previewUrl && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-t-lg text-[10px] text-red-300 font-medium">
            No audio preview available
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default GlobalPlayer;
