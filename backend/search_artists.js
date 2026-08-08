require('dotenv').config();
const axios = require('axios');

async function search() {
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
        
        const artists = ['Bad Bunny', 'Dua Lipa', 'Justin Bieber'];
        for (const name of artists) {
            const res = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(name)}&type=artist&limit=1`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log(`${name}: ${res.data.artists.items[0].id}`);
        }
    } catch (e) { console.error(e.message); }
}
search();
