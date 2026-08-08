const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'public', 'artists', 'selena', 'data.json');
let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

data.spotifyLink = 'https://open.spotify.com/artist/0C8ZW7ezQVs4URX5aX7Kqx';

fs.writeFileSync(dataPath, JSON.stringify(data, null, 4));
console.log("Updated Selena Gomez spotifyLink");
