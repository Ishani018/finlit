import os
from PIL import Image
import sys

def verify_images(directory):
    """
    Verifies that all images in the given directory are 512x512 and have transparency.
    """
    full_path = os.path.abspath(directory)
    if not os.path.exists(full_path):
        print(f"Directory not found: {full_path}")
        return

    print(f"Scanning directory: {full_path}")
    
    files = [f for f in os.listdir(full_path) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    
    if not files:
        print("No image files found.")
        return

    for filename in files:
        filepath = os.path.join(full_path, filename)
        try:
            with Image.open(filepath) as img:
                width, height = img.size
                mode = img.mode
                
                print(f"Checking {filename}...")
                
                # Check dimensions
                if width != 512 or height != 512:
                    print(f"  [FAIL] Dimensions: {width}x{height} (Expected 512x512)")
                else:
                    print(f"  [PASS] Dimensions: 512x512")
                
                # Check transparency
                if mode in ('RGBA', 'LA') or (mode == 'P' and 'transparency' in img.info):
                    # For RGBA, checking if there is alpha channel is trivial, but checking if it's actually used verify pixels
                    # For now just checking mode is a good first step.
                    print(f"  [PASS] Transparency mode: {mode}")
                else:
                    print(f"  [FAIL] Transparency mode: {mode} (Expected RGBA or similar)")
                    
        except Exception as e:
            print(f"  [ERROR] Could not process {filename}: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        directory = sys.argv[1]
    else:
        # Default to checking the 'images' folder relative to project root if script is run from project root,
        # or 'images' folder if it exists.
        # Assuming script is run from project root
        directory = "images" 
        
    verify_images(directory)
