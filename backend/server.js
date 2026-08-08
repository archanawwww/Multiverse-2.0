const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.static('public'));
// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Helper function to read json
const readJsonFile = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return null;
    }
};

// GET all artists
app.get('/api/artists', (req, res) => {
    const artistsDir = path.join(__dirname, 'public', 'artists');
    fs.readdir(artistsDir, (err, folders) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read artists directory' });
        }
        
        const artists = folders
            .filter(folder => fs.statSync(path.join(artistsDir, folder)).isDirectory())
            .map(folder => {
                const data = readJsonFile(path.join(artistsDir, folder, 'data.json'));
                if (data) {
                    return {
                        id: folder,
                        name: data.artistName,
                        genre: data.genre,
                        heroImage: `/artists/${folder}/${data.heroImage}`,
                        albumCount: data.albums ? data.albums.length : 0,
                        themeColors: data.themeColors
                    };
                }
                return null;
            })
            .filter(artist => artist !== null);

        res.json(artists);
    });
});

// GET specific artist by ID
app.get('/api/artists/:id', (req, res) => {
    const artistId = req.params.id;
    const dataPath = path.join(__dirname, 'public', 'artists', artistId, 'data.json');
    const data = readJsonFile(dataPath);
    
    if (data) {
        // Automatically inject the ID into the payload for convenience
        data.id = artistId;
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.json(data);
    } else {
        res.status(404).json({ error: 'Artist not found' });
    }
});

// GET search query
app.get('/api/search', (req, res) => {
    const query = req.query.q?.toLowerCase() || '';
    if (!query) return res.json({ artists: [], albums: [], songs: [] });

    const artistsDir = path.join(__dirname, 'public', 'artists');
    const results = { artists: [], albums: [], songs: [] };

    try {
        const folders = fs.readdirSync(artistsDir);
        for (const folder of folders) {
            if (!fs.statSync(path.join(artistsDir, folder)).isDirectory()) continue;
            const data = readJsonFile(path.join(artistsDir, folder, 'data.json'));
            if (!data) continue;

            // Search artists
            if (data.artistName.toLowerCase().includes(query)) {
                results.artists.push({
                    id: folder,
                    name: data.artistName,
                    image: `/artists/${folder}/${data.heroImage}`
                });
            }

            // Search albums
            if (data.albums) {
                for (const album of data.albums) {
                    if (album.name.toLowerCase().includes(query)) {
                        results.albums.push({
                            id: folder,
                            artistId: folder,
                            artistName: data.artistName,
                            name: album.name,
                            cover: `/artists/${folder}/${album.cover}`
                        });
                    }
                }
            }

            // Search songs
            if (data.songs) {
                for (const song of data.songs) {
                    if (song.title.toLowerCase().includes(query)) {
                        results.songs.push({
                            artistId: folder,
                            artistName: data.artistName,
                            title: song.title,
                            duration: song.duration,
                            spotifyEmbedUrl: song.spotifyEmbedUrl
                        });
                    }
                }
            }
        }
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: 'Search failed' });
    }
});


// Spotify Token Management
let spotifyAccessToken = null;
let tokenExpirationTime = null;

const getSpotifyToken = async () => {
    if (spotifyAccessToken && tokenExpirationTime && Date.now() < tokenExpirationTime) {
        return spotifyAccessToken;
    }

    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', 
            'grant_type=client_credentials',
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')
                }
            }
        );
        spotifyAccessToken = response.data.access_token;
        // Set expiration time to 1 hour from now (in ms), subtract 1 min for buffer
        tokenExpirationTime = Date.now() + (response.data.expires_in * 1000) - 60000;
        return spotifyAccessToken;
    } catch (error) {
        console.error('Error fetching Spotify token:', error.message);
        throw new Error('Failed to authenticate with Spotify');
    }
};

// ==========================================
// SERVER-SIDE SPOTIFY RESPONSE CACHE
// Prevents 429 rate limit by caching responses per user+endpoint for 5 minutes
// Also tracks 429 cooldowns and deduplicates in-flight requests
// ==========================================
const apiCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Track when we got rate-limited so we don't keep hammering Spotify
let rateLimitedUntil = 0; // timestamp when we can try again
const RATE_LIMIT_COOLDOWN_MS = 60 * 1000; // Wait 60 seconds after a 429

// In-flight request deduplication: if endpoint X is already being fetched, don't fire another
const inFlightRequests = new Map();

const getCacheKey = (token, endpoint) => {
    const userKey = token ? token.slice(-10) : 'anon';
    return `${userKey}:${endpoint}`;
};

const getCachedResponse = (token, endpoint) => {
    const key = getCacheKey(token, endpoint);
    const cached = apiCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        console.log(`[CACHE] HIT for ${endpoint} (age: ${Math.round((Date.now() - cached.timestamp) / 1000)}s)`);
        return cached.data;
    }
    if (cached) {
        apiCache.delete(key); // expired
    }
    return null;
};

const setCachedResponse = (token, endpoint, data) => {
    const key = getCacheKey(token, endpoint);
    apiCache.set(key, { data, timestamp: Date.now() });
    console.log(`[CACHE] STORED for ${endpoint}`);
};

const isRateLimited = () => {
    if (Date.now() < rateLimitedUntil) {
        console.log(`[RATE_LIMIT] Still in cooldown for ${Math.round((rateLimitedUntil - Date.now()) / 1000)}s more`);
        return true;
    }
    return false;
};

const markRateLimited = (retryAfterHeader) => {
    const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) * 1000 : RATE_LIMIT_COOLDOWN_MS;
    rateLimitedUntil = Date.now() + retryAfter;
    console.log(`[RATE_LIMIT] Rate limited! Cooling down for ${retryAfter / 1000}s`);
};

// Wrapper for Spotify API calls with deduplication and rate limit awareness
const spotifyApiCall = async (authHeader, endpoint, axiosConfig) => {
    // Check cache first
    const cached = getCachedResponse(authHeader, endpoint);
    if (cached) return { data: cached, fromCache: true };

    // Check rate limit cooldown
    if (isRateLimited()) {
        return { error: true, status: 429, message: 'Rate limited - in cooldown' };
    }

    // Deduplicate: if this exact request is already in-flight, wait for it
    const dedupeKey = getCacheKey(authHeader, endpoint);
    if (inFlightRequests.has(dedupeKey)) {
        console.log(`[DEDUP] Waiting for existing request for ${endpoint}`);
        try {
            const result = await inFlightRequests.get(dedupeKey);
            return { data: result, fromCache: true };
        } catch (e) {
            return { error: true, status: 500, message: e.message };
        }
    }

    // Make the actual request
    const promise = (async () => {
        const response = await axios(axiosConfig);
        return response.data;
    })();

    inFlightRequests.set(dedupeKey, promise);

    try {
        const data = await promise;
        inFlightRequests.delete(dedupeKey);
        return { data, fromCache: false };
    } catch (error) {
        inFlightRequests.delete(dedupeKey);
        if (error.response?.status === 429) {
            markRateLimited(error.response?.headers?.['retry-after']);
        }
        throw error;
    }
};

// ==========================================
// SPOTIFY OAUTH (USER LOGIN)
// ==========================================
const NETWORK_IP = '10.81.69.156';

const getRedirectUri = () => {
    if (process.env.PUBLIC_URL) return `${process.env.PUBLIC_URL}/api/auth/callback`;
    return 'http://localhost:5001/api/auth/callback';
};

const getFrontendUrl = () => {
    if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL;
    return `http://${NETWORK_IP}:5173`;
};

app.get('/api/auth/login', (req, res) => {
    console.log('[OAUTH] /api/auth/login hit by client');
    const scope = [
        'user-read-private',
        'user-read-email',
        'user-top-read',
        'user-read-recently-played',
        'user-library-read',
        'user-library-modify',
        'user-read-playback-state',
        'user-modify-playback-state',
        'user-read-currently-playing',
        'streaming',
        'playlist-read-private',
        'playlist-read-collaborative',
        'playlist-modify-public',
        'playlist-modify-private',
    ].join(' ');
    const authUrl = new URL('https://accounts.spotify.com/authorize');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', process.env.SPOTIFY_CLIENT_ID);
    authUrl.searchParams.append('scope', scope);
    const redirectUri = getRedirectUri();
    authUrl.searchParams.append('redirect_uri', redirectUri);
    
    console.log('[OAUTH] Redirecting to Spotify with redirect_uri:', redirectUri);
    res.redirect(authUrl.toString());
});

app.get('/api/auth/callback', async (req, res) => {
    const code = req.query.code || null;
    const error = req.query.error || null;
    console.log('[OAUTH] /api/auth/callback hit with code:', code ? 'YES' : 'NO', 'error:', error);

    const frontendUrl = getFrontendUrl();

    if (error) {
        console.error('[OAUTH] Spotify returned an error:', error);
        return res.redirect(`${frontendUrl}/?error=${encodeURIComponent(error)}`);
    }

    if (!code) {
        return res.redirect(`${frontendUrl}/?error=no_code`);
    }

    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', 
            new URLSearchParams({
                code: code,
                redirect_uri: getRedirectUri(),
                grant_type: 'authorization_code'
            }).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')
                }
            }
        );

        const { access_token, refresh_token, expires_in } = response.data;
        console.log('[OAUTH] Successfully exchanged code for tokens. Redirecting to frontend login-success...');
        res.redirect(`${frontendUrl}/login-success#access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`);
    } catch (error) {
        console.error('[OAUTH] Error during Spotify OAuth callback token exchange:', error.response?.data || error.message);
        res.redirect(`${frontendUrl}/?error=auth_failed`);
    }
});

// GET current user profile using their token
app.get('/api/me', async (req, res) => {
    const authHeader = req.headers.authorization;
    console.log('[API] /api/me hit');
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    try {
        const result = await spotifyApiCall(authHeader, '/me', {
            method: 'get',
            url: 'https://api.spotify.com/v1/me',
            headers: { 'Authorization': authHeader }
        });
        if (result.error) return res.status(result.status).json({ error: result.message });
        if (!result.fromCache) {
            console.log('[API] /api/me success for user:', result.data.display_name);
            setCachedResponse(authHeader, '/me', result.data);
        }
        res.json(result.data);
    } catch (error) {
        console.error('[API] /api/me failed:', error.response?.status, error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch user profile', details: error.response?.data });
    }
});

// ==========================================

// Map local IDs to Spotify Artist IDs
const SPOTIFY_ARTIST_IDS = {
    'olivia': '1McMsnEElThX1knmY4oliG',
    'selena': '0C8ZW7ezQVs4URX5aX7Kqx',
    'badbunny': '4q3ewBCX7sLwd24euuV69X',
    'dualipa': '6M2wZ9GZgrQXHCFfjv46we',
    'justinbieber': '1uNFoZAHBGtllmzznpCI3s'
};

// GET artist albums from Spotify
app.get('/api/spotify/artist/:id/albums', async (req, res) => {
    try {
        const localId = req.params.id;
        const spotifyArtistId = SPOTIFY_ARTIST_IDS[localId] || localId; // Use map, fallback to direct ID

        const token = await getSpotifyToken();
        const response = await axios.get(`https://api.spotify.com/v1/artists/${spotifyArtistId}/albums`, {
            params: {
                include_groups: 'album', // only full albums
                limit: 50
            },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        // Remove duplicates by name (Spotify often returns deluxe versions as separate albums)
        const uniqueAlbums = [];
        const seenNames = new Set();
        for (const item of response.data.items) {
            if (!seenNames.has(item.name)) {
                seenNames.add(item.name);
                uniqueAlbums.push({
                    id: item.id,
                    name: item.name,
                    releaseDate: item.release_date,
                    totalTracks: item.total_tracks,
                    coverUrl: item.images[0]?.url,
                    spotifyUrl: item.external_urls.spotify
                });
            }
        }

        res.json(uniqueAlbums);
    } catch (error) {
        console.error('Spotify API Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch albums from Spotify' });
    }
});

// GET artist top tracks from Spotify
app.get('/api/spotify/artist/:id/top-tracks', async (req, res) => {
    try {
        const localId = req.params.id;
        const spotifyArtistId = SPOTIFY_ARTIST_IDS[localId] || localId;

        const token = await getSpotifyToken();
        const response = await axios.get(`https://api.spotify.com/v1/artists/${spotifyArtistId}/top-tracks`, {
            params: {
                market: 'US'
            },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const tracks = response.data.tracks.map(track => {
            const minutes = Math.floor(track.duration_ms / 60000);
            const seconds = ((track.duration_ms % 60000) / 1000).toFixed(0);
            return {
                id: track.id,
                title: track.name,
                duration: minutes + ":" + (seconds < 10 ? '0' : '') + seconds,
                durationMs: track.duration_ms,
                previewUrl: track.preview_url, // Used for 30s preview playback
                spotifyUrl: track.external_urls.spotify,
                coverUrl: track.album.images[0]?.url,
                albumName: track.album.name,
                artistName: track.artists[0]?.name
            };
        });

        res.json(tracks);
    } catch (error) {
        console.error('Spotify API Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch top tracks from Spotify' });
    }
});

// GET album tracks from Spotify
app.get('/api/spotify/album/:id/tracks', async (req, res) => {
    try {
        const albumId = req.params.id;
        const token = await getSpotifyToken();
        
        // First get album details for the cover art
        const albumResponse = await axios.get(`https://api.spotify.com/v1/albums/${albumId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const coverUrl = albumResponse.data.images[0]?.url;

        // Then get tracks
        const tracksResponse = await axios.get(`https://api.spotify.com/v1/albums/${albumId}/tracks`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const tracks = tracksResponse.data.items.map(track => {
            const minutes = Math.floor(track.duration_ms / 60000);
            const seconds = ((track.duration_ms % 60000) / 1000).toFixed(0);
            return {
                id: track.id,
                title: track.name,
                duration: minutes + ":" + (seconds < 10 ? '0' : '') + seconds,
                durationMs: track.duration_ms,
                trackNumber: track.track_number,
                previewUrl: track.preview_url,
                spotifyUrl: track.external_urls.spotify,
                coverUrl: coverUrl, // Spotify tracks in album endpoint don't have images, so use album cover
                artistName: track.artists[0]?.name
            };
        });

        res.json({
            albumName: albumResponse.data.name,
            artistName: albumResponse.data.artists[0]?.name,
            coverUrl: coverUrl,
            tracks: tracks
        });
    } catch (error) {
        console.error('Spotify API Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch tracks from Spotify' });
    }
});

// GET user's recently played tracks
app.get('/api/me/recently-played', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    try {
        const result = await spotifyApiCall(authHeader, '/recently-played', {
            method: 'get',
            url: 'https://api.spotify.com/v1/me/player/recently-played',
            params: { limit: 20 },
            headers: { 'Authorization': authHeader }
        });
        if (result.error) return res.status(result.status).json({ error: result.message });

        let tracks;
        if (result.fromCache) {
            tracks = result.data;
        } else {
            tracks = result.data.items.map(item => {
                const track = item.track;
                const minutes = Math.floor(track.duration_ms / 60000);
                const seconds = ((track.duration_ms % 60000) / 1000).toFixed(0);
                return {
                    id: track.id,
                    title: track.name,
                    artistName: track.artists[0]?.name,
                    albumName: track.album.name,
                    coverUrl: track.album.images[0]?.url,
                    duration: minutes + ":" + (seconds < 10 ? '0' : '') + seconds,
                    durationMs: track.duration_ms,
                    previewUrl: track.preview_url,
                    spotifyUrl: track.external_urls.spotify,
                    playedAt: item.played_at
                };
            });
            setCachedResponse(authHeader, '/recently-played', tracks);
        }
        res.json(tracks);
    } catch (error) {
        console.error('[API] Recently played error:', error.response?.status, error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch recently played' });
    }
});

// GET user's top tracks
app.get('/api/me/top-tracks', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const timeRange = req.query.time_range || 'medium_term';
    try {
        const result = await spotifyApiCall(authHeader, `/top-tracks-${timeRange}`, {
            method: 'get',
            url: 'https://api.spotify.com/v1/me/top/tracks',
            params: { limit: 50, time_range: timeRange },
            headers: { 'Authorization': authHeader }
        });
        if (result.error) return res.status(result.status).json({ error: result.message });

        let tracks;
        if (result.fromCache) {
            tracks = result.data;
        } else {
            tracks = result.data.items.map(track => {
                const minutes = Math.floor(track.duration_ms / 60000);
                const seconds = ((track.duration_ms % 60000) / 1000).toFixed(0);
                return {
                    id: track.id,
                    title: track.name,
                    artistName: track.artists[0]?.name,
                    albumName: track.album.name,
                    coverUrl: track.album.images[0]?.url,
                    duration: minutes + ":" + (seconds < 10 ? '0' : '') + seconds,
                    durationMs: track.duration_ms,
                    previewUrl: track.preview_url,
                    spotifyUrl: track.external_urls.spotify,
                    popularity: track.popularity
                };
            });
            setCachedResponse(authHeader, `/top-tracks-${timeRange}`, tracks);
        }
        res.json(tracks);
    } catch (error) {
        console.error('Top tracks error:', error.response?.status, error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch top tracks' });
    }
});

// GET user's top artists
app.get('/api/me/top-artists', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const timeRange = req.query.time_range || 'medium_term';
    try {
        const result = await spotifyApiCall(authHeader, `/top-artists-${timeRange}`, {
            method: 'get',
            url: 'https://api.spotify.com/v1/me/top/artists',
            params: { limit: 50, time_range: timeRange },
            headers: { 'Authorization': authHeader }
        });
        if (result.error) return res.status(result.status).json({ error: result.message });

        let artists;
        if (result.fromCache) {
            artists = result.data;
        } else {
            artists = result.data.items.map(artist => ({
                id: artist.id,
                name: artist.name,
                genres: artist.genres || [],
                popularity: artist.popularity,
                coverUrl: artist.images[0]?.url || '/images/worlds/space.png',
                followers: artist.followers?.total || 0,
                spotifyUrl: artist.external_urls?.spotify
            }));
            setCachedResponse(authHeader, `/top-artists-${timeRange}`, artists);
        }
        res.json(artists);
    } catch (error) {
        console.error('Top artists error:', error.response?.status, error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch top artists' });
    }
});

// GET user's saved tracks (liked songs)
app.get('/api/me/saved-tracks', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    try {
        const result = await spotifyApiCall(authHeader, '/saved-tracks', {
            method: 'get',
            url: 'https://api.spotify.com/v1/me/tracks',
            params: { limit: 50 },
            headers: { 'Authorization': authHeader }
        });
        if (result.error) return res.status(result.status).json({ error: result.message });

        let tracks;
        if (result.fromCache) {
            tracks = result.data;
        } else {
            tracks = result.data.items.map(item => {
                const track = item.track;
                const minutes = Math.floor(track.duration_ms / 60000);
                const seconds = ((track.duration_ms % 60000) / 1000).toFixed(0);
                return {
                    id: track.id,
                    title: track.name,
                    artistName: track.artists[0]?.name,
                    albumName: track.album.name,
                    coverUrl: track.album.images[0]?.url,
                    duration: minutes + ":" + (seconds < 10 ? '0' : '') + seconds,
                    durationMs: track.duration_ms,
                    previewUrl: track.preview_url,
                    spotifyUrl: track.external_urls.spotify,
                    addedAt: item.added_at
                };
            });
            setCachedResponse(authHeader, '/saved-tracks', tracks);
        }
        res.json(tracks);
    } catch (error) {
        console.error('Saved tracks error:', error.response?.status, error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch saved tracks' });
    }
});

// GET audio features for multiple tracks (for mood/emotion analysis)
app.get('/api/me/audio-features', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const ids = req.query.ids;
    if (!ids) return res.status(400).json({ error: 'No track IDs provided' });

    try {
        const response = await axios.get('https://api.spotify.com/v1/audio-features', {
            params: { ids },
            headers: { 'Authorization': authHeader }
        });

        res.json(response.data.audio_features);
    } catch (error) {
        console.error('Audio features error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch audio features' });
    }
});

// ==========================================
// TOKEN REFRESH
// ==========================================
app.post('/api/auth/refresh', async (req, res) => {
    const refreshToken = req.headers['x-refresh-token'] || req.query.refresh_token;
    if (!refreshToken) return res.status(400).json({ error: 'No refresh token provided' });

    try {
        const response = await axios.post('https://accounts.spotify.com/api/token',
            new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
            }).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')
                }
            }
        );

        const { access_token, expires_in, refresh_token: newRefreshToken } = response.data;
        console.log('[AUTH] Token refreshed successfully');
        res.json({
            access_token,
            expires_in,
            refresh_token: newRefreshToken || refreshToken // Spotify may or may not return a new refresh token
        });
    } catch (error) {
        console.error('[AUTH] Token refresh failed:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to refresh token' });
    }
});

// ==========================================
// CURRENTLY PLAYING
// ==========================================
app.get('/api/me/player/currently-playing', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    try {
        const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: { 'Authorization': authHeader }
        });
        // Spotify returns 204 when nothing is playing
        if (response.status === 204 || !response.data) {
            return res.json({ is_playing: false, item: null });
        }
        res.json(response.data);
    } catch (error) {
        if (error.response?.status === 204) return res.json({ is_playing: false, item: null });
        console.error('Currently playing error:', error.response?.status, error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch currently playing' });
    }
});

// ==========================================
// SPOTIFY SEARCH (USER TOKEN)
// ==========================================
app.get('/api/spotify/search', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const { q, type = 'track,artist,album,playlist', limit = 20, offset = 0 } = req.query;
    if (!q) return res.status(400).json({ error: 'No search query provided' });

    try {
        const result = await spotifyApiCall(authHeader, `/search-${q}-${type}-${offset}`, {
            method: 'get',
            url: 'https://api.spotify.com/v1/search',
            params: { q, type, limit, offset, market: 'US' },
            headers: { 'Authorization': authHeader }
        });
        if (result.error) return res.status(result.status).json({ error: result.message });
        if (!result.fromCache) {
            setCachedResponse(authHeader, `/search-${q}-${type}-${offset}`, result.data);
        }
        res.json(result.data);
    } catch (error) {
        console.error('Search error:', error.response?.status, error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: 'Search failed' });
    }
});

// ==========================================
// SPOTIFY RECOMMENDATIONS
// ==========================================
app.get('/api/spotify/recommendations', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const { seed_artists, seed_tracks, seed_genres, limit = 20, ...targetParams } = req.query;

    try {
        const params = { limit, market: 'US' };
        if (seed_artists) params.seed_artists = seed_artists;
        if (seed_tracks) params.seed_tracks = seed_tracks;
        if (seed_genres) params.seed_genres = seed_genres;
        // Forward target audio feature params (e.g., target_valence, target_energy)
        Object.keys(targetParams).forEach(key => {
            if (key.startsWith('target_') || key.startsWith('min_') || key.startsWith('max_')) {
                params[key] = targetParams[key];
            }
        });

        const cacheKey = `/recommendations-${JSON.stringify(params)}`;
        const result = await spotifyApiCall(authHeader, cacheKey, {
            method: 'get',
            url: 'https://api.spotify.com/v1/recommendations',
            params,
            headers: { 'Authorization': authHeader }
        });
        if (result.error) return res.status(result.status).json({ error: result.message });
        if (!result.fromCache) {
            setCachedResponse(authHeader, cacheKey, result.data);
        }
        res.json(result.data);
    } catch (error) {
        console.error('Recommendations error:', error.response?.status, error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch recommendations' });
    }
});

// ==========================================
// USER PLAYLISTS
// ==========================================
app.get('/api/me/playlists', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const { limit = 50, offset = 0 } = req.query;

    try {
        const result = await spotifyApiCall(authHeader, `/playlists-${offset}`, {
            method: 'get',
            url: 'https://api.spotify.com/v1/me/playlists',
            params: { limit, offset },
            headers: { 'Authorization': authHeader }
        });
        if (result.error) return res.status(result.status).json({ error: result.message });
        if (!result.fromCache) {
            setCachedResponse(authHeader, `/playlists-${offset}`, result.data);
        }
        res.json(result.data);
    } catch (error) {
        console.error('Playlists error:', error.response?.status, error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch playlists' });
    }
});

// ==========================================
// SAVED ALBUMS
// ==========================================
app.get('/api/me/albums', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const { limit = 50, offset = 0 } = req.query;

    try {
        const result = await spotifyApiCall(authHeader, `/albums-${offset}`, {
            method: 'get',
            url: 'https://api.spotify.com/v1/me/albums',
            params: { limit, offset },
            headers: { 'Authorization': authHeader }
        });
        if (result.error) return res.status(result.status).json({ error: result.message });
        if (!result.fromCache) {
            setCachedResponse(authHeader, `/albums-${offset}`, result.data);
        }
        res.json(result.data);
    } catch (error) {
        console.error('Albums error:', error.response?.status, error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch albums' });
    }
});

// ==========================================
// AVAILABLE GENRES FOR RECOMMENDATIONS
// ==========================================
app.get('/api/spotify/genres', async (req, res) => {
    try {
        const token = await getSpotifyToken();
        const response = await axios.get('https://api.spotify.com/v1/recommendations/available-genre-seeds', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Genres error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch genres' });
    }
});

// ==========================================
// GEMINI AI MUSIC RECOMMENDATION ENDPOINT
// ==========================================
app.get('/api/ai/recommend', async (req, res) => {
    const { mood } = req.query;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Gemini API key is not configured in backend/.env' });
    }
    
    if (!mood) {
        return res.status(400).json({ error: 'Mood query parameter is required' });
    }

    try {
        const prompt = `Act as an expert music DJ. Give me a JSON list of exactly 15 song titles and their artist names that perfectly match the mood: "${mood}".
        Format the response EXACTLY as a JSON array of objects with keys "title" and "artist". Only return the JSON, no markdown, no other text.`;

        const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                response_mime_type: "application/json",
            }
        });

        const textResponse = response.data.candidates[0].content.parts[0].text;
        
        // Parse the JSON array
        const tracks = JSON.parse(textResponse);
        res.json({ tracks });
    } catch (error) {
        console.error('Gemini API Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to generate recommendations from AI' });
    }
});

// ==========================================
// REACT ROUTER FALLBACK
// ==========================================
// Any route that doesn't match an API route should serve the React app
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`EchoVerse API running on http://0.0.0.0:${PORT}`);
});
