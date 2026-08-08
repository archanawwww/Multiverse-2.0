require('dotenv').config();
const axios = require('axios');

async function check() {
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
        
        const id = '4q3ewBCX7sLwd24euDPV6v'; // known good ID? Let's search again.
        const res = await axios.get(`https://api.spotify.com/v1/search?q=artist:Bad%20Bunny&type=artist&limit=1`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log("Real Bad Bunny ID:", res.data.artists.items[0].id);
    } catch (e) { console.error(e.message); }
}
check();
