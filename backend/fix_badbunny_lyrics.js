const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'public', 'artists', 'badbunny', 'data.json');
let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const lyricsLinks = {
    "DtMF": "https://genius.com/Bad-bunny-dtmf-lyrics",
    "NUEVAYoL": "https://genius.com/Bad-bunny-nuevayol-lyrics",
    "I Like It": "https://genius.com/Cardi-b-bad-bunny-and-j-balvin-i-like-it-lyrics"
};

data.songs.forEach(song => {
    if (lyricsLinks[song.title]) {
        song.lyricsLink = lyricsLinks[song.title];
    }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 4));
console.log("Updated Bad Bunny lyrics!");
