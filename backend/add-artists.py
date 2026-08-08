import os
import shutil
import json

base_dir = "/Users/archana/Documents/MusicVerse/backend/public/artists"
src_base = "/Users/archana/Documents/Olivia Rodriger copy 2"

artists = [
    {
        "id": "dualipa",
        "name": "Dua Lipa",
        "genre": "Pop / Disco",
        "src_folder": os.path.join(src_base, "Dua Lipa"),
        "landscape": "fa7bcc95c1f6b81e32f36884c8284984.jpg",
        "spotifyLink": "https://open.spotify.com/artist/6M2wZ9GZgrQXHCFfjv46we",
        "colors": {
            "primary": "#ff1493",
            "secondary": "#ff69b4",
            "background": "#1a0b12",
            "card": "#2a121c",
            "text": "#ffffff",
            "accent": "#ffb6c1"
        },
        "albums": [
            {
                "name": "Future Nostalgia",
                "releaseYear": "2020",
                "cover": "albums/futurenostalgia.jpg",
                "tracks": [
                    {"title": "Don't Start Now", "spotifyEmbedUrl": "https://open.spotify.com/embed/track/303ccjdEZmBqA8a7uB1W7J?utm_source=generator"},
                    {"title": "Levitating", "spotifyEmbedUrl": "https://open.spotify.com/embed/track/4l0Mvzj72cgdVNbuZpm2Fv?utm_source=generator"},
                    {"title": "Physical", "spotifyEmbedUrl": "https://open.spotify.com/embed/track/2Z76gH0iWjM8K23zY5zR4p?utm_source=generator"},
                    {"title": "Break My Heart", "spotifyEmbedUrl": "https://open.spotify.com/embed/track/1tqF9vcTyjBvkjGzH2Q4i8?utm_source=generator"}
                ]
            },
            {
                "name": "Radical Optimism",
                "releaseYear": "2024",
                "cover": "albums/radical.jpg",
                "tracks": [
                    {"title": "Houdini", "spotifyEmbedUrl": "https://open.spotify.com/embed/track/1tqF9vcTyjBvkjGzH2Q4i8?utm_source=generator"},
                    {"title": "Illusion", "spotifyEmbedUrl": "https://open.spotify.com/embed/track/2Z76gH0iWjM8K23zY5zR4p?utm_source=generator"},
                    {"title": "Training Season", "spotifyEmbedUrl": "https://open.spotify.com/embed/track/4l0Mvzj72cgdVNbuZpm2Fv?utm_source=generator"}
                ]
            }
        ]
    },
    {
        "id": "justinbieber",
        "name": "Justin Bieber",
        "genre": "Pop / R&B",
        "src_folder": os.path.join(src_base, "Justin Beiber"),
        "landscape": "aa55b9910711bb36e58dde995a11a672.jpg",
        "spotifyLink": "https://open.spotify.com/artist/1uNFoZAHBGtllmzznpCI3s",
        "colors": {
            "primary": "#ffa500",
            "secondary": "#ff8c00",
            "background": "#1a130b",
            "card": "#2a1e12",
            "text": "#ffffff",
            "accent": "#ffd700"
        },
        "albums": [
            {
                "name": "Purpose",
                "releaseYear": "2015",
                "cover": "albums/purpose.jpg",
                "tracks": [
                    {"title": "Sorry", "spotifyEmbedUrl": "https://open.spotify.com/embed/track/303ccjdEZmBqA8a7uB1W7J?utm_source=generator"},
                    {"title": "Love Yourself", "spotifyEmbedUrl": "https://open.spotify.com/embed/track/4l0Mvzj72cgdVNbuZpm2Fv?utm_source=generator"},
                    {"title": "What Do You Mean?", "spotifyEmbedUrl": "https://open.spotify.com/embed/track/1tqF9vcTyjBvkjGzH2Q4i8?utm_source=generator"}
                ]
            },
            {
                "name": "Justice",
                "releaseYear": "2021",
                "cover": "albums/justice.jpg",
                "tracks": [
                    {"title": "Peaches", "spotifyEmbedUrl": "https://open.spotify.com/embed/track/4l0Mvzj72cgdVNbuZpm2Fv?utm_source=generator"},
                    {"title": "Hold On", "spotifyEmbedUrl": "https://open.spotify.com/embed/track/303ccjdEZmBqA8a7uB1W7J?utm_source=generator"}
                ]
            }
        ]
    },
    {
        "id": "badbunny",
        "name": "Bad Bunny",
        "genre": "Reggaeton / Latin Trap",
        "src_folder": os.path.join(src_base, "Bad Bunny"),
        "landscape": "1508f7d5c030dec70d96ce345ffcf89f.webp",
        "spotifyLink": "https://open.spotify.com/artist/4q3ewBCX7Btwg8KWywVsxM",
        "colors": {
            "primary": "#ff4500",
            "secondary": "#ff0000",
            "background": "#1a0808",
            "card": "#2a0d0d",
            "text": "#ffffff",
            "accent": "#ff6347"
        },
        "albums": [
            {
                "name": "Un Verano Sin Ti",
                "releaseYear": "2022",
                "cover": "albums/verano.jpg",
                "tracks": [
                    {"title": "Moscow Mule", "spotifyEmbedUrl": "https://open.spotify.com/embed/track/1tqF9vcTyjBvkjGzH2Q4i8?utm_source=generator"},
                    {"title": "Tití Me Preguntó", "spotifyEmbedUrl": "https://open.spotify.com/embed/track/2Z76gH0iWjM8K23zY5zR4p?utm_source=generator"},
                    {"title": "Me Porto Bonito", "spotifyEmbedUrl": "https://open.spotify.com/embed/track/4l0Mvzj72cgdVNbuZpm2Fv?utm_source=generator"}
                ]
            },
            {
                "name": "YHLQMDLG",
                "releaseYear": "2020",
                "cover": "albums/yhlqmdlg.jpg",
                "tracks": [
                    {"title": "Safaera", "spotifyEmbedUrl": "https://open.spotify.com/embed/track/303ccjdEZmBqA8a7uB1W7J?utm_source=generator"},
                    {"title": "La Difícil", "spotifyEmbedUrl": "https://open.spotify.com/embed/track/1tqF9vcTyjBvkjGzH2Q4i8?utm_source=generator"}
                ]
            }
        ]
    }
]

for a in artists:
    artist_dir = os.path.join(base_dir, a["id"])
    gallery_dir = os.path.join(artist_dir, "gallery")
    albums_dir = os.path.join(artist_dir, "albums")
    
    os.makedirs(gallery_dir, exist_ok=True)
    os.makedirs(albums_dir, exist_ok=True)
    
    # Copy images
    gallery_images = []
    if os.path.exists(a["src_folder"]):
        for file in os.listdir(a["src_folder"]):
            if file.startswith('.') or not os.path.isfile(os.path.join(a["src_folder"], file)):
                continue
            
            src_path = os.path.join(a["src_folder"], file)
            
            if file == a["landscape"]:
                shutil.copy(src_path, os.path.join(artist_dir, "hero.jpg"))
                shutil.copy(src_path, os.path.join(artist_dir, "background.jpg"))
            
            dest_path = os.path.join(gallery_dir, file)
            shutil.copy(src_path, dest_path)
            gallery_images.append(f"gallery/{file}")
    
    for i, album in enumerate(a["albums"]):
        if i < len(gallery_images):
            # Extract filename from gallery path
            filename = gallery_images[i].split('/')[1]
            src_cover = os.path.join(gallery_dir, filename)
            album["cover"] = f"albums/cover_{i}.jpg"
            shutil.copy(src_cover, os.path.join(albums_dir, f"cover_{i}.jpg"))
            
    data = {
        "artistName": a["name"],
        "genre": a["genre"],
        "shortBiography": f"{a['name']} is a global superstar.",
        "heroImage": "hero.jpg",
        "backgroundImage": "background.jpg",
        "spotifyLink": a["spotifyLink"],
        "themeColors": a["colors"],
        "themeFonts": {
            "heading": "Playfair Display, serif",
            "body": "Inter, sans-serif"
        },
        "albums": a["albums"],
        "songs": [
            {
                "title": "Top Hit 1",
                "duration": "3:00",
                "spotifyEmbedUrl": "https://open.spotify.com/embed/track/1sHxLzUxE7Guhi9RoRoZG?utm_source=generator",
                "lyricsLink": "#"
            },
            {
                "title": "Top Hit 2",
                "duration": "3:30",
                "spotifyEmbedUrl": "https://open.spotify.com/embed/track/4hQ6UGyWQIGJmHZNXqjOEp?utm_source=generator",
                "lyricsLink": "#"
            }
        ],
        "gallery": gallery_images,
        "socialMedia": {
            "instagram": "https://instagram.com",
            "twitter": "https://twitter.com",
            "youtube": "https://youtube.com"
        },
        "animations": {
            "style": "luxury",
            "hoverEffect": "tilt"
        },
        "stats": {
            "albums": str(len(a["albums"])),
            "songs": "50+",
            "streams": "5B+",
            "awards": "Multiple"
        },
        "about": {
            "yearsActive": "2015-present",
            "nationality": "Global",
            "timeline": [
                { "year": "2020", "event": "Released a chart-topping album." }
            ]
        }
    }
    
    with open(os.path.join(artist_dir, "data.json"), "w") as f:
        json.dump(data, f, indent=4)
        
print("Successfully generated all new artists!")
