#!/usr/bin/env python3
"""
Resize public/logo.png and save as public/favicon.ico.
Requires Pillow: pip install Pillow
"""

from pathlib import Path
from PIL import Image

SRC = Path(__file__).parent / "public" / "logo.png"
DEST = Path(__file__).parent / "public" / "favicon.ico"

# Standard favicon sizes (multi-size ICO)
SIZES = [(16, 16), (32, 32), (48, 48)]

def main():
    print(f"Opening {SRC}  ({SRC.stat().st_size / 1024:.1f} KB)")

    with Image.open(SRC) as img:
        # Convert to RGBA so transparency is preserved
        img = img.convert("RGBA")
        print(f"Original size: {img.size}")

        icons = []
        for size in SIZES:
            resized = img.resize(size, Image.LANCZOS)
            icons.append(resized)
            print(f"  Prepared {size[0]}×{size[1]} layer")

        # Save as multi-resolution ICO
        icons[0].save(
            DEST,
            format="ICO",
            sizes=SIZES,
            append_images=icons[1:],
        )

    print(f"\nDone! Saved {DEST}  ({DEST.stat().st_size / 1024:.1f} KB)")


if __name__ == "__main__":
    main()
