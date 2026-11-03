import argparse
from pathlib import Path

import numpy as np
import soundfile
from dsp import RATE, highpass, lowpass, noise, normalize, seconds
from rain import (
    LOOP_LENGTH,
    LOOPS,
    SEAM,
    THUNDER,
    THUNDER_LEAD,
    THUNDER_LENGTH,
    Cut,
    Recording,
    excerpt,
    faded,
    fetch,
    seamless,
)
from scipy.ndimage import maximum_filter1d, minimum_filter1d, uniform_filter1d

OUTPUT = Path(__file__).resolve().parents[3] / "extensions/soundscapes/sounds"
STRIKE_LUFS = -28
DISTANT = 900
CEILING_DB = -1
LIMITER_ATTACK = 0.005
LIMITER_RELEASE = 0.08

WOODS = Recording(665156, 1661766, "https://freesound.org/people/felix.blume/sounds/665156/")
COFFEE_SHOP = Recording(125247, 1812576, "https://freesound.org/people/oliverbrotzman/sounds/125247/")
FIREPLACE = Recording(484338, 5902878, "https://freesound.org/people/BonnyOrbit/sounds/484338/")
BALTIC_SHORE = Recording(339517, 2367966, "https://freesound.org/people/pulswelle/sounds/339517/")
WIND_IN_TREES = Recording(335889, 2792951, "https://freesound.org/people/Yoyodaman234/sounds/335889/")
DISTANT_STORM = Recording(319568, 2752236, "https://freesound.org/people/Soojay/sounds/319568/")

RECORDED = {
    "forest": (Cut(WOODS, 182, -28), 120),
    "cafe": (Cut(COFFEE_SHOP, 222, -28), 80),
    "fire": (Cut(FIREPLACE, 70, -31), 60),
    "waves": (Cut(BALTIC_SHORE, 632, -26), 35),
    "wind": (Cut(WIND_IN_TREES, 170, -29), 35),
    "rain": (LOOPS["rain"], 35),
}

RUMBLE = Cut(DISTANT_STORM, 122, -32)
STRIKES = THUNDER[1:4]


def stereo_noise():
    return np.stack([noise(LOOP_LENGTH + SEAM, seed) for seed in (1, 2)], axis=1)


def white_noise():
    return seamless(lowpass(stereo_noise(), 9000, 2))


def brown_noise():
    return seamless(highpass(np.cumsum(stereo_noise(), axis=0), 25, 2))


def limited(audio):
    peaks = maximum_filter1d(np.abs(audio).max(axis=1), seconds(LIMITER_ATTACK) * 2 + 1)
    needed = np.minimum(1, 10 ** (CEILING_DB / 20) / np.maximum(peaks, 1e-9))
    gain = uniform_filter1d(minimum_filter1d(needed, seconds(LIMITER_RELEASE)), seconds(LIMITER_ATTACK))
    return audio * gain[:, None]


def write(name, audio):
    path = OUTPUT / f"{name}.oga"
    path.parent.mkdir(parents=True, exist_ok=True)
    soundfile.write(path, limited(audio).astype(np.float32), RATE, format="OGG", subtype="OPUS")


def main():
    parser = argparse.ArgumentParser(
        description="Cuts Soundscapes' loops from CC0 recordings on Freesound and makes its noise"
    )
    parser.add_argument("--cache", type=Path, default=Path.home() / ".cache/luft-soundscapes")
    cache = parser.parse_args().cache
    cache.mkdir(parents=True, exist_ok=True)

    for name, (cut, floor) in RECORDED.items():
        audio = highpass(excerpt(fetch(cut.recording, cache), cut.start, LOOP_LENGTH + SEAM), floor)
        write(name, normalize(seamless(audio), cut.lufs))
    rumble = lowpass(excerpt(fetch(RUMBLE.recording, cache), RUMBLE.start, LOOP_LENGTH + SEAM), DISTANT, 2)
    write("thunder", normalize(seamless(rumble), RUMBLE.lufs))
    for number, cut in enumerate(STRIKES, start=1):
        strike = faded(excerpt(fetch(cut.recording, cache), max(cut.start - THUNDER_LEAD, 0), THUNDER_LENGTH))
        write(f"thunder/strike-{number}", normalize(lowpass(strike, DISTANT * 2, 2), STRIKE_LUFS))
    write("white-noise", normalize(white_noise(), -31))
    write("brown-noise", normalize(brown_noise(), -27))


if __name__ == "__main__":
    main()
