import os
import re

directory = '/Users/archana/Documents/MusicVerse/frontend/src'

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.js') or file.endswith('.jsx'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            if '127.0.0.1:5001' in content:
                # Replace src="http://127.0.0.1:5001/..." with src={`http://${window.location.hostname}:5001/...`}
                content = re.sub(r'(\w+)="http://127\.0\.0\.1:5001([^"]*)"', r'\1={`http://${window.location.hostname}:5001\2`}', content)
                
                # Replace 'http://127.0.0.1:5001/...' with `http://${window.location.hostname}:5001/...`
                content = re.sub(r'[\'"`]http://127\.0\.0\.1:5001([^\'"`]*)[\'"`]', r'`http://${window.location.hostname}:5001\1`', content)
                
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated {path}")
