import argparse
import io
import urllib.request
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import soundfile
from dsp import RATE, highpass, normalize, seconds
from scipy import signal

OUTPUT = Path(__file__).resolve().parents[3] / "extensions/rain/sounds"
PREVIEWS = "https://cdn.freesound.org/previews"
LOOP_LENGTH = 30
SEAM = 4
THUNDER_LENGTH = 12
THUNDER_LEAD = 0.4
THUNDER_TAIL = 4


@dataclass(frozen=True)
class Recording:
    sound: int
    user: int
    page: str

    @property
    def preview(self):
        return f"{PREVIEWS}/{self.sound // 1000}/{self.sound}_{self.user}-hq.ogg"


@dataclass(frozen=True)
class Cut:
    recording: Recording
    start: float
    lufs: float


NIGHT_RAIN = Recording(547892, 7553603, "https://freesound.org/people/chromakei/sounds/547892/")
STREET_RAIN = Recording(572417, 97550, "https://freesound.org/people/TRP/sounds/572417/")
SUMMER_DOWNPOUR = Recording(575289, 4688703, "https://freesound.org/people/The_Runner_01/sounds/575289/")
CLOSE_THUNDER = Recording(574386, 97550, "https://freesound.org/people/TRP/sounds/574386/")
ROLLING_THUNDER = Recording(572432, 97550, "https://freesound.org/people/TRP/sounds/572432/")
STORM = Recording(817640, 664439, "https://freesound.org/people/iscence/sounds/817640/")
DRY_STORM = Recording(796529, 3557494, "https://freesound.org/people/fran_marenco/sounds/796529/")
RUMBLE = Recording(653664, 266548, "https://freesound.org/people/tams_kp/sounds/653664/")

LOOPS = {
    "drizzle": Cut(NIGHT_RAIN, 160, -28),
    "rain": Cut(STREET_RAIN, 105, -26),
    "downpour": Cut(SUMMER_DOWNPOUR, 130, -23),
}

THUNDER = [
    Cut(CLOSE_THUNDER, 8.1, -22),
    Cut(ROLLING_THUNDER, 1.8, -24),
    Cut(STORM, 15.7, -23),
    Cut(DRY_STORM, 34.3, -25),
    Cut(RUMBLE, 0.0, -27),
]


def fetch(recording, cache):
    path = cache / f"{recording.sound}.ogg"
    if not path.exists():
        with urllib.request.urlopen(urllib.request.Request(recording.preview, headers={"User-Agent": "Luft"})) as response:
            path.write_bytes(response.read())
    audio, rate = soundfile.read(io.BytesIO(path.read_bytes()), always_2d=True)
    if audio.shape[1] == 1:
        audio = np.repeat(audio, 2, axis=1)
    if rate != RATE:
        divisor = np.gcd(RATE, rate)
        audio = signal.resample_poly(audio, RATE // divisor, rate // divisor, axis=0)
    return audio


def excerpt(audio, start, length):
    begin = seconds(start)
    piece = audio[begin:begin + seconds(length)]
    if len(piece) < seconds(length):
        raise SystemExit(f"The recording ends before {start + length} s")
    return highpass(piece, 35)


def seamless(audio):
    seam = seconds(SEAM)
    body = audio[:seconds(LOOP_LENGTH)].copy()
    tail = audio[seconds(LOOP_LENGTH):seconds(LOOP_LENGTH) + seam]
    angle = np.linspace(0, np.pi / 2, seam)[:, None]
    body[:seam] = body[:seam] * np.sin(angle) + tail * np.cos(angle)
    return body


def faded(audio):
    lead, tail = seconds(THUNDER_LEAD), seconds(THUNDER_TAIL)
    audio = audio.copy()
    audio[:lead] *= np.linspace(0, 1, lead)[:, None]
    audio[-tail:] *= np.cos(np.linspace(0, np.pi / 2, tail))[:, None] ** 2
    return audio


def write(name, audio):
    soundfile.write(OUTPUT / f"{name}.oga", audio.astype(np.float32), RATE, format="OGG", subtype="OPUS")


def main():
    parser = argparse.ArgumentParser(description="Cuts the rain loops and thunder from CC0 recordings on Freesound")
    parser.add_argument("--cache", type=Path, default=Path.home() / ".cache/luft-rain")
    cache = parser.parse_args().cache
    cache.mkdir(parents=True, exist_ok=True)
    OUTPUT.mkdir(parents=True, exist_ok=True)

    for name, cut in LOOPS.items():
        audio = excerpt(fetch(cut.recording, cache), cut.start, LOOP_LENGTH + SEAM)
        write(name, normalize(seamless(audio), cut.lufs))
    for number, cut in enumerate(THUNDER, start=1):
        audio = faded(excerpt(fetch(cut.recording, cache), max(cut.start - THUNDER_LEAD, 0), THUNDER_LENGTH))
        write(f"thunder-{number}", normalize(audio, cut.lufs))


if __name__ == "__main__":
    main()
