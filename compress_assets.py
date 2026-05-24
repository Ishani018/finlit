"""
Compress large asset images (jobs, properties, etc.) to reduce EAS build archive size.
Resizes to max 1024px on longest side and optimizes PNG compression.
Original files are overwritten — run from the finlit root directory.
"""
import os
from pathlib import Path
from PIL import Image

ASSET_DIR = Path("MobileClient/assets")
# Folders containing large generated images
TARGET_FOLDERS = ["jobs", "properties", "groceries", "medicine", "achivements", "dependents"]
MAX_SIDE = 1024  # px — sufficient for any phone screen at 2x

def compress_image(path: Path):
    original_size = path.stat().st_size
    with Image.open(path) as img:
        # Preserve RGBA (transparency)
        if img.mode not in ("RGBA", "RGB"):
            img = img.convert("RGBA")

        w, h = img.size
        if max(w, h) > MAX_SIDE:
            scale = MAX_SIDE / max(w, h)
            img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)

        img.save(path, "PNG", optimize=True, compress_level=9)

    new_size = path.stat().st_size
    saved = original_size - new_size
    return original_size, new_size, saved

total_saved = 0
total_files = 0

for folder in TARGET_FOLDERS:
    folder_path = ASSET_DIR / folder
    if not folder_path.exists():
        continue

    pngs = list(folder_path.glob("*.png")) + list(folder_path.glob("*.PNG"))
    folder_saved = 0
    for png in pngs:
        try:
            orig, new, saved = compress_image(png)
            folder_saved += saved
            total_files += 1
        except Exception as e:
            print(f"  SKIP {png.name}: {e}")

    print(f"{folder:20s}  saved {folder_saved / 1024 / 1024:.1f} MB  ({len(pngs)} files)")
    total_saved += folder_saved

print(f"\nTotal: {total_files} files, {total_saved / 1024 / 1024:.1f} MB saved")
