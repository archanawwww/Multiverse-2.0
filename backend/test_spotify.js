const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config({path: '/Users/archana/Documents/MusicVerse/backend/.env'});

async function test() {
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
        console.log("Token:", response.data.access_token.substring(0, 10) + '...');
    } catch(e) {
        console.error(e.response ? e.response.data : e.message);
    }
}
test();
