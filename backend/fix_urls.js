const fs = require('fs');
const path = require('path');

const artistsDir = path.join(__dirname, 'public', 'artists');
const dirs = fs.readdirSync(artistsDir).filter(f => fs.statSync(path.join(artistsDir, f)).isDirectory());

const validUrl = "https://open.spotify.com/embed/track/50nfwKoDiSYg8zOCREWAm5?utm_source=generator";

// Known fake track IDs based on grep output
const fakeIds = [
    "1tqF9vcTyjBvkjGzH2Q4i8",
    "2Z76gH0iWjM8K23zY5zR4p",
    "4l0Mvzj72cgdVNbuZpm2Fv",
    "303ccjdEZmBqA8a7uB1W7J",
    "1sHxLzUxE7Guhi9RoRoZG",
    "4hQ6UGyWQIGJmHZNXqjOEp"
];

for (const dir of dirs) {
    const dataPath = path.join(artistsDir, dir, 'data.json');
    if (fs.existsSync(dataPath)) {
        let content = fs.readFileSync(dataPath, 'utf8');
        let modified = false;

        for (const fakeId of fakeIds) {
            const fakeUrl = `https://open.spotify.com/embed/track/${fakeId}?utm_source=generator`;
            if (content.includes(fakeUrl)) {
                content = content.split(fakeUrl).join(validUrl);
                modified = true;
            }
        }

        if (modified) {
            fs.writeFileSync(dataPath, content);
            console.log(`Fixed URLs in ${dir}/data.json`);
        }
    }
}
console.log("All done.");
