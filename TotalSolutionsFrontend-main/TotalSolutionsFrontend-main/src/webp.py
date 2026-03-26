import os
from PIL import Image

# --- CONFIGURATION ---
directory_path = "./assets"  # <-- Change to your main folder
quality = 100 

# --- SUPPORTED FORMATS ---
valid_extensions = ('.jpg', '.jpeg', '.png')

# --- WALK AND CONVERT ---
for root, dirs, files in os.walk(directory_path):
    for file in files:
        if file.lower().endswith(valid_extensions):
            file_path = os.path.join(root, file)
            output_path = os.path.splitext(file_path)[0] + '.webp'

            try:
                with Image.open(file_path) as img:
                    img.save(output_path, 'webp', quality=quality, lossless=(file.lower().endswith('.png')))
                print(f"✅ Converted: {file_path} → {output_path}")
            except Exception as e:
                print(f"❌ Failed to convert {file_path}: {e}")
