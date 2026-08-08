require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const SPOTIFY_ARTIST_IDS = {
    'olivia': '1McMsnEElThX1knmY4oliG',
    'selena': '0C8ZW7ezQRs4K0R991CEUP',
    'badbunny': '4q3ewBCX7sLwd24euuV69X',
    'dualipa': '6M2wZ9GZgrQXHCFfjv46we',
    'justinbieber': '1uNFoZAHBGtllmzznpCI3s'
};

function msToMinutesSeconds(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

async function fixData() {
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
        const token = response.data.access_token;
        const artistsDir = path.join(__dirname, 'public', 'artists');
        const dirs = fs.readdirSync(artistsDir).filter(f => fs.statSync(path.join(artistsDir, f)).isDirectory());

        for (const dir of dirs) {
            const dataPath = path.join(artistsDir, dir, 'data.json');
            if (fs.existsSync(dataPath)) {
                let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
                const artistName = data.artistName;
                const spotifyArtistId = SPOTIFY_ARTIST_IDS[dir];
                
                // 1. Fix Top Tracks
                if (spotifyArtistId) {
                    try {
                        const searchRes = await axios.get(`https://api.spotify.com/v1/search?q=artist:${encodeURIComponent(artistName)}&type=track&limit=5`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        const topTracks = searchRes.data.tracks.items;
                        data.songs = topTracks.map(t => ({
                            title: t.name,
                            duration: msToMinutesSeconds(t.duration_ms),
                            spotifyEmbedUrl: `https://open.spotify.com/embed/track/${t.id}?utm_source=generator`,
                            lyricsLink: "#"
                        }));
                        console.log(`Updated Top Tracks for ${artistName}`);
                    } catch(e) {
                        console.error(`Failed top tracks for ${artistName}`, e.message);
                    }
                }

                // 2. Fix Album Tracks
                if (data.albums) {
                    for (let i = 0; i < data.albums.length; i++) {
                        const album = data.albums[i];
                        if (album.tracks) {
                            for (let j = 0; j < album.tracks.length; j++) {
                                const track = album.tracks[j];
                                try {
                                    const query = `track:${track.title} artist:${artistName}`;
                                    const searchRes = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`, {
                                        headers: { 'Authorization': `Bearer ${token}` }
                                    });
                                    if (searchRes.data.tracks.items.length > 0) {
                                        const realTrack = searchRes.data.tracks.items[0];
                                        track.spotifyEmbedUrl = `https://open.spotify.com/embed/track/${realTrack.id}?utm_source=generator`;
                                    }
                                } catch (e) {
                                    console.error(`Failed to find track ${track.title} for ${artistName}`);
                                }
                            }
                        }
                    }
                    console.log(`Updated Album Tracks for ${artistName}`);
                }

                fs.writeFileSync(dataPath, JSON.stringify(data, null, 4));
                console.log(`Saved ${dir}/data.json`);
            }
        }
    } catch (e) {
        console.error(e);
    }
}
fixData();
