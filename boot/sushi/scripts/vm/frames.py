#!/usr/bin/env python3
import argparse
import sys
from pathlib import Path

from PIL import Image, ImageChops


def main():
    parser = argparse.ArgumentParser(
        description="Summarize a recording from record.py: when the screen changes resolution, goes black, or stops moving"
    )
    parser.add_argument("frames", type=Path)
    options = parser.parse_args()

    stretches = []
    previous = None
    for frame in sorted(options.frames.glob("*.png")):
        at = int(frame.stem) / 1000
        image = Image.open(frame).convert("RGB")
        if max(high for _, high in image.getextrema()) < 12:
            look = "black"
        elif (
            previous is not None
            and previous.size == image.size
            and ImageChops.difference(previous, image).getbbox() is None
        ):
            look = "still"
        else:
            look = "moving"
        previous = image
        size = f"{image.width}x{image.height}"
        if stretches and stretches[-1][2:] == [size, look]:
            stretches[-1][1] = at
        else:
            stretches.append([at, at, size, look])

    for start, end, size, look in stretches:
        print(f"{start:8.2f} – {end:8.2f} s  {size:>10}  {look}")


if __name__ == "__main__":
    sys.exit(main())
