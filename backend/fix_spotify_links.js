const fs = require('fs');
const path = require('path');

const SPOTIFY_ARTIST_IDS = {
    'olivia': '1McMsnEElThX1knmY4oliG',
    'selena': '0C8ZW7ezQRs4K0R991CEUP',
    'badbunny': '4q3ewBCX7sLwd24euuV69X',
    'dualipa': '6M2wZ9GZgrQXHCFfjv46we',
    'justinbieber': '1uNFoZAHBGtllmzznpCI3s'
};

const artistsDir = path.join(__dirname, 'public', 'artists');
const dirs = fs.readdirSync(artistsDir).filter(f => fs.statSync(path.join(artistsDir, f)).isDirectory());

for (const dir of dirs) {
    const dataPath = path.join(artistsDir, dir, 'data.json');
    if (fs.existsSync(dataPath)) {
        let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const spotifyArtistId = SPOTIFY_ARTIST_IDS[dir];
        
        if (spotifyArtistId) {
            data.spotifyLink = `https://open.spotify.com/artist/${spotifyArtistId}`;
            fs.writeFileSync(dataPath, JSON.stringify(data, null, 4));
            console.log(`Updated spotifyLink for ${dir}`);
        }
    }
}
