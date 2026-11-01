# Sounds

Renders Luft's sound theme into `kestrel/engine/data/sounds/luft`. Every sound is synthesized here, so changing one means changing its recipe and rendering again:

```sh
python3 -m venv ~/.cache/luft-sounds && ~/.cache/luft-sounds/bin/pip install -r requirements.txt
~/.cache/luft-sounds/bin/python build.py --wav /tmp/luft-sounds
```

`build.py` lists each event with its theme name and loudness target, `takes.py` the sounds built from a few notes, and `sounds.py` the rest. Rendering needs FFmpeg with libvorbis. `--wav` keeps the 48 kHz, 24-bit masters next to the encoded theme.

`rain.py` cuts the rain loops and thunder in `kestrel/engine/data/rain` from CC0 recordings on Freesound, listed at the top of the script with the second each cut starts at. It downloads them once into `~/.cache/luft-rain`.
