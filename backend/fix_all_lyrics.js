const fs = require('fs');
const path = require('path');

const artistsDir = path.join(__dirname, 'public', 'artists');

const lyricsMap = {
    // Dua Lipa
    "Levitating": "https://genius.com/Dua-lipa-levitating-lyrics",
    "Levitating (feat. DaBaby)": "https://genius.com/Dua-lipa-levitating-remix-lyrics",
    "No Lie": "https://genius.com/Sean-paul-no-lie-lyrics",

    // Justin Bieber
    "Baby": "https://genius.com/Justin-bieber-baby-lyrics",
    "Let Me Love You": "https://genius.com/Dj-snake-let-me-love-you-lyrics",
    "STAY (with Justin Bieber)": "https://genius.com/The-kid-laroi-and-justin-bieber-stay-lyrics",

    // Olivia Rodrigo
    "deja vu": "https://genius.com/Olivia-rodrigo-deja-vu-lyrics",
    "honeybee": "https://genius.com/search?q=Olivia+Rodrigo+honeybee",
    "stupid song": "https://genius.com/search?q=Olivia+Rodrigo+stupid+song",

    // Selena Gomez
    "Wolves": "https://genius.com/Selena-gomez-and-marshmello-wolves-lyrics",
    "We Don't Talk Anymore (feat. Selena Gomez)": "https://genius.com/Charlie-puth-we-dont-talk-anymore-lyrics"
};

const dirs = fs.readdirSync(artistsDir).filter(f => fs.statSync(path.join(artistsDir, f)).isDirectory());

for (const dir of dirs) {
    const dataPath = path.join(artistsDir, dir, 'data.json');
    if (fs.existsSync(dataPath)) {
        let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        
        let updated = false;
        if (data.songs) {
            data.songs.forEach(song => {
                if (lyricsMap[song.title]) {
                    song.lyricsLink = lyricsMap[song.title];
                    updated = true;
                }
            });
        }
        
        if (updated) {
            fs.writeFileSync(dataPath, JSON.stringify(data, null, 4));
            console.log(`Updated lyrics links for ${dir}`);
        }
    }
}
