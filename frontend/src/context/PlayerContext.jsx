import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [albumContext, setAlbumContext] = useState(null);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState('off'); // 'off' | 'all' | 'one'
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const playTrack = useCallback((track, album = null, trackList = null) => {
    setCurrentTrack(track);
    setAlbumContext(album);
    setIsPlaying(true);
    if (trackList) {
      setQueue(trackList);
      const idx = trackList.findIndex(t => t.id === track.id || t.title === track.title);
      setQueueIndex(idx >= 0 ? idx : 0);
    }
  }, []);

  const stopPlayback = useCallback(() => {
    setCurrentTrack(null);
    setAlbumContext(null);
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
  }, []);

  const skipNext = useCallback(() => {
    if (queue.length === 0) return;
    let nextIndex;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = queueIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeat === 'all') nextIndex = 0;
        else return;
      }
    }
    setQueueIndex(nextIndex);
    setCurrentTrack(queue[nextIndex]);
    setIsPlaying(true);
  }, [queue, queueIndex, shuffle, repeat]);

  const skipPrev = useCallback(() => {
    if (queue.length === 0) return;
    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) {
      if (repeat === 'all') prevIndex = queue.length - 1;
      else prevIndex = 0;
    }
    setQueueIndex(prevIndex);
    setCurrentTrack(queue[prevIndex]);
    setIsPlaying(true);
  }, [queue, queueIndex, repeat]);

  const toggleShuffle = useCallback(() => setShuffle(s => !s), []);
  const toggleRepeat = useCallback(() => {
    setRepeat(r => r === 'off' ? 'all' : r === 'all' ? 'one' : 'off');
  }, []);

  return (
    <PlayerContext.Provider value={{
      currentTrack, isPlaying, albumContext, queue, queueIndex,
      shuffle, repeat, progress, duration, audioRef,
      playTrack, stopPlayback, setIsPlaying,
      skipNext, skipPrev, toggleShuffle, toggleRepeat,
      setProgress, setDuration, setQueue, setQueueIndex
    }}>
      {children}
    </PlayerContext.Provider>
  );
};
