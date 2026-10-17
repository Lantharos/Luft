#!/usr/bin/env python3
"""Turn recorded motion clips into contact sheets and real-time videos."""

import json
import subprocess
import sys
from pathlib import Path

LAST_FRAME = 0.5


def sheet(clip: Path, frames: list[dict]) -> None:
    args = ['montage']
    for frame in frames:
        label = f"#{frame['index']}  {frame['ms']:.0f} ms  p={frame['progress']:.2f}"
        args += ['-label', label, str(clip / f"{frame['index']:03d}.jpg")]
    args += ['-tile', '6x', '-geometry', '360x225+4+4', '-pointsize', '14',
             '-background', '#1b1b1f', '-fill', '#e8e8ea', str(clip / 'sheet.jpg')]
    subprocess.run(args, check=True)


def video(clip: Path, frames: list[dict]) -> None:
    lines = []
    for frame, following in zip(frames, frames[1:] + [None]):
        seconds = (following['ms'] - frame['ms']) / 1000 if following else LAST_FRAME
        lines += [f"file '{frame['index']:03d}.jpg'", f'duration {seconds:.4f}']
    lines.append(f"file '{frames[-1]['index']:03d}.jpg'")
    concat = clip / 'concat.txt'
    concat.write_text('\n'.join(lines) + '\n')
    try:
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(concat),
                        '-fps_mode', 'vfr', '-pix_fmt', 'yuv420p', '-c:v', 'libx264', str(clip / 'clip.mp4')], check=True)
    finally:
        concat.unlink()


def main() -> None:
    for meta in sorted(Path(sys.argv[1]).glob('*/frames.json')):
        frames = json.loads(meta.read_text())['frames']
        if len(frames) < 2:
            continue
        sheet(meta.parent, frames)
        video(meta.parent, frames)


main()
