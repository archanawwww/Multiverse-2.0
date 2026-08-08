/**
 * SpotifyService.js
 * Centralized API client for all Spotify interactions.
 * Handles: token refresh, error handling, rate limiting, caching.
 */
import { API_URL } from '../config';

// ─── Token Management ───────────────────────────────────────────────
let refreshPromise = null; // Prevents multiple simultaneous refresh calls

const getTokens = () => ({
  accessToken: localStorage.getItem('spotify_access_token'),
  refreshToken: localStorage.getItem('spotify_refresh_token'),
  expiresAt: parseInt(localStorage.getItem('spotify_expires_at') || '0', 10),
});

const setTokens = ({ access_token, refresh_token, expires_in }) => {
  localStorage.setItem('spotify_access_token', access_token);
  if (refresh_token) localStorage.setItem('spotify_refresh_token', refresh_token);
  // Store absolute expiration timestamp (with 2 min buffer)
  const expiresAt = Date.now() + (expires_in * 1000) - 120000;
  localStorage.setItem('spotify_expires_at', expiresAt.toString());
  return access_token;
};

const isTokenExpired = () => {
  const { expiresAt } = getTokens();
  return !expiresAt || Date.now() >= expiresAt;
};

const refreshAccessToken = async () => {
  // Deduplicate: if a refresh is already in-flight, wait for it
  if (refreshPromise) return refreshPromise;

  const { refreshToken } = getTokens();
  if (!refreshToken) {
    throw new Error('NO_REFRESH_TOKEN');
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'X-Refresh-Token': refreshToken },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Token refresh failed');
      }
      const data = await res.json();
      return setTokens(data);
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// ─── Core Fetch Wrapper ─────────────────────────────────────────────
const spotifyFetch = async (endpoint, options = {}) => {
  let { accessToken } = getTokens();

  // Auto-refresh if expired
  if (isTokenExpired()) {
    try {
      accessToken = await refreshAccessToken();
    } catch (err) {
      // If refresh fails, force logout
      console.error('[SpotifyService] Token refresh failed:', err.message);
      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_refresh_token');
      localStorage.removeItem('spotify_expires_at');
      window.location.href = '/';
      throw err;
    }
  }

  const url = `${API_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      ...(options.headers || {}),
    },
  });

  // Handle 401 — token might have been invalidated server-side
  if (res.status === 401) {
    try {
      accessToken = await refreshAccessToken();
      const retryRes = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          ...(options.headers || {}),
        },
      });
      if (!retryRes.ok) throw new Error(`API error: ${retryRes.status}`);
      return retryRes.json();
    } catch (err) {
      localStorage.clear();
      window.location.href = '/';
      throw err;
    }
  }

  if (res.status === 429) {
    console.warn('[SpotifyService] Rate limited. Try again later.');
    throw new Error('RATE_LIMITED');
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `API error: ${res.status}`);
  }

  return res.json();
};

// ─── API Methods ────────────────────────────────────────────────────

// User Profile
export const fetchUserProfile = () => spotifyFetch('/api/me');

// Recently Played
export const fetchRecentlyPlayed = () => spotifyFetch('/api/me/recently-played');

// Top Tracks
export const fetchTopTracks = (timeRange = 'medium_term') =>
  spotifyFetch(`/api/me/top-tracks?time_range=${timeRange}`);

// Top Artists
export const fetchTopArtists = (timeRange = 'medium_term') =>
  spotifyFetch(`/api/me/top-artists?time_range=${timeRange}`);

// Saved (Liked) Tracks
export const fetchSavedTracks = (limit = 50, offset = 0) =>
  spotifyFetch(`/api/me/saved-tracks?limit=${limit}&offset=${offset}`);

// User Playlists
export const fetchUserPlaylists = (limit = 50, offset = 0) =>
  spotifyFetch(`/api/me/playlists?limit=${limit}&offset=${offset}`);

// Saved Albums
export const fetchSavedAlbums = (limit = 50, offset = 0) =>
  spotifyFetch(`/api/me/albums?limit=${limit}&offset=${offset}`);

// Currently Playing
export const fetchCurrentlyPlaying = () =>
  spotifyFetch('/api/me/player/currently-playing');

// Audio Features (for mood analysis)
export const fetchAudioFeatures = (trackIds) => {
  if (!trackIds || trackIds.length === 0) return Promise.resolve([]);
  return spotifyFetch(`/api/me/audio-features?ids=${trackIds.join(',')}`);
};

// Search
export const searchSpotify = (query, type = 'track,artist,album,playlist', limit = 20, offset = 0) =>
  spotifyFetch(`/api/spotify/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}&offset=${offset}`);

// Recommendations
export const fetchRecommendations = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });
  return spotifyFetch(`/api/spotify/recommendations?${searchParams.toString()}`);
};

// Available Genres
export const fetchAvailableGenres = () => spotifyFetch('/api/spotify/genres');

// ─── Mood Engine ────────────────────────────────────────────────────
/**
 * Analyzes audio features of recently played tracks to determine the user's current mood.
 * Returns a mood object with label, description, emoji, and confidence score.
 */
export const analyzeMood = async () => {
  try {
    const recentTracks = await fetchRecentlyPlayed();
    if (!recentTracks || recentTracks.length === 0) {
      return { mood: 'Unknown', emoji: '🎵', description: 'Play some music and we\'ll figure out your vibe!', confidence: 0 };
    }

    const trackIds = recentTracks.slice(0, 20).map(t => t.id).filter(Boolean);
    if (trackIds.length === 0) {
      return { mood: 'Unknown', emoji: '🎵', description: 'Unable to analyze your recent tracks.', confidence: 0 };
    }

    const features = await fetchAudioFeatures(trackIds);
    const validFeatures = (features || []).filter(Boolean);

    if (validFeatures.length === 0) {
      return { mood: 'Unknown', emoji: '🎵', description: 'Audio data unavailable for recent tracks.', confidence: 0 };
    }

    // Average out the features
    const avg = validFeatures.reduce((acc, f) => ({
      valence: acc.valence + f.valence,
      energy: acc.energy + f.energy,
      danceability: acc.danceability + f.danceability,
      acousticness: acc.acousticness + f.acousticness,
      tempo: acc.tempo + f.tempo,
      instrumentalness: acc.instrumentalness + (f.instrumentalness || 0),
    }), { valence: 0, energy: 0, danceability: 0, acousticness: 0, tempo: 0, instrumentalness: 0 });

    const count = validFeatures.length;
    Object.keys(avg).forEach(k => avg[k] /= count);

    // Mood classification
    if (avg.valence > 0.7 && avg.energy > 0.6) {
      return { mood: 'Happy', emoji: '😊', description: 'You\'re radiating positive energy! Your music is upbeat and joyful.', confidence: avg.valence, features: avg };
    }
    if (avg.energy > 0.75 && avg.danceability > 0.65) {
      return { mood: 'Energetic', emoji: '⚡', description: 'You\'re in beast mode! High energy tracks dominate your recent plays.', confidence: avg.energy, features: avg };
    }
    if (avg.danceability > 0.7 && avg.valence > 0.5) {
      return { mood: 'Groovy', emoji: '💃', description: 'Your playlist is making everyone want to dance!', confidence: avg.danceability, features: avg };
    }
    if (avg.acousticness > 0.6 && avg.energy < 0.4) {
      return { mood: 'Peaceful', emoji: '🧘', description: 'You\'re in a calm, introspective space with acoustic vibes.', confidence: avg.acousticness, features: avg };
    }
    if (avg.valence < 0.3 && avg.energy < 0.4) {
      return { mood: 'Melancholy', emoji: '🌧️', description: 'Your music reflects a contemplative, emotional state.', confidence: 1 - avg.valence, features: avg };
    }
    if (avg.valence < 0.4 && avg.energy > 0.6) {
      return { mood: 'Intense', emoji: '🔥', description: 'Dark but powerful — you\'re channeling deep emotions through energetic music.', confidence: avg.energy, features: avg };
    }
    if (avg.instrumentalness > 0.5) {
      return { mood: 'Focused', emoji: '🎯', description: 'Instrumental and ambient — perfect for deep concentration.', confidence: avg.instrumentalness, features: avg };
    }
    if (avg.valence > 0.4 && avg.valence < 0.6 && avg.energy > 0.4 && avg.energy < 0.6) {
      return { mood: 'Chill', emoji: '😎', description: 'Balanced and relaxed — you\'re vibing with easygoing tunes.', confidence: 0.6, features: avg };
    }
    if (avg.tempo > 140) {
      return { mood: 'Workout', emoji: '💪', description: 'Fast-paced tracks — looks like you\'re pushing your limits!', confidence: Math.min(avg.tempo / 180, 1), features: avg };
    }

    return { mood: 'Dreamy', emoji: '✨', description: 'A blend of textures and emotions — your taste is eclectic and rich.', confidence: 0.5, features: avg };
  } catch (err) {
    console.error('[MoodEngine] Analysis failed:', err);
    return { mood: 'Unknown', emoji: '🎵', description: 'Something went wrong analyzing your mood.', confidence: 0 };
  }
};

// ─── AI Recommendations ───────────────────────────────────────────────
export const fetchGeminiRecommendations = async (mood) => {
  try {
    // 1. Ask the backend (Gemini) for 15 songs matching the mood
    const aiResponse = await fetch(`${API_URL}/api/ai/recommend?mood=${encodeURIComponent(mood)}`);
    if (!aiResponse.ok) {
      throw new Error('Failed to get Gemini recommendations');
    }
    const { tracks } = await aiResponse.json();

    if (!tracks || tracks.length === 0) return { tracks: [] };

    // 2. Search Spotify for each of those songs to get real playable data
    const spotifyPromises = tracks.map(async (t) => {
      const query = `track:"${t.title}" artist:"${t.artist}"`;
      try {
        const res = await searchSpotify(query, 'track', 1);
        if (res.tracks && res.tracks.items && res.tracks.items.length > 0) {
          return res.tracks.items[0];
        }
      } catch (err) {
        console.warn('Failed to find track on Spotify:', t);
      }
      return null;
    });

    const spotifyTracks = await Promise.all(spotifyPromises);
    const validTracks = spotifyTracks.filter(Boolean);

    return { tracks: validTracks };
  } catch (err) {
    console.error('Gemini Recommendation Error:', err);
    throw err;
  }
};

export default {
  fetchUserProfile,
  fetchRecentlyPlayed,
  fetchTopTracks,
  fetchTopArtists,
  fetchSavedTracks,
  fetchUserPlaylists,
  fetchSavedAlbums,
  fetchCurrentlyPlaying,
  fetchAudioFeatures,
  searchSpotify,
  fetchRecommendations,
  fetchAvailableGenres,
  analyzeMood,
  fetchGeminiRecommendations,
};
