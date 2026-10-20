import argparse
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path

import soundfile
from dsp import RATE, finish, loudness, normalize, true_peak_db
from sounds import SOUNDS
from takes import TAKES, render

THEME = Path(__file__).resolve().parents[2] / "engine/data/sounds/luft/stereo"
FLOOR = 150
TICK_FADE = 0.02
CEILING_DB = -1.0


@dataclass(frozen=True)
class Event:
    theme_name: str
    lufs: float
    tick: bool = False


EVENTS = {
    "notification": Event("message-new-instant", -18),
    "notification-low": Event("dialog-information", -23),
    "new-mail": Event("message-new-email", -18),
    "mail-sent": Event("message-sent-email", -20),
    "device-plugged": Event("device-added", -19),
    "device-unplugged": Event("device-removed", -19),
    "charger-connected": Event("power-plug", -19),
    "low-battery": Event("battery-low", -18),
    "screenshot": Event("screen-capture", -20),
    "volume-tick": Event("audio-volume-change", -27, tick=True),
    "error": Event("dialog-error", -18),
    "warning": Event("dialog-warning", -18),
    "question": Event("dialog-question", -22),
    "recording-started": Event("recording-started", -19),
    "recording-stopped": Event("recording-stopped", -19),
    "sign-in": Event("desktop-login", -19),
    "keyboard-tap": Event("keyboard-tap", -30, tick=True),
    "keyboard-tap-delete": Event("keyboard-tap-delete", -30, tick=True),
    "keyboard-tap-space": Event("keyboard-tap-space", -31, tick=True),
}


def master(stereo, event):
    length = len(stereo) / RATE
    fade_out = TICK_FADE if event.tick else max(0.06, length * 0.3)
    out = normalize(finish(stereo, length, fade_out=fade_out, floor=FLOOR), event.lufs)
    return out * min(1, 10 ** ((CEILING_DB - true_peak_db(out)) / 20))


def synthesize(name):
    if name in TAKES:
        return render(TAKES[name])
    return SOUNDS[name][0]()


def encode(wav, oga):
    subprocess.run(
        [
            "ffmpeg",
            "-v",
            "error",
            "-y",
            "-i",
            str(wav),
            "-map_metadata",
            "-1",
            "-fflags",
            "+bitexact",
            "-flags:a",
            "+bitexact",
            "-c:a",
            "libvorbis",
            "-q:a",
            "6",
            str(oga),
        ],
        check=True,
    )


def main():
    parser = argparse.ArgumentParser(description="Renders Luft's sound theme.")
    parser.add_argument("--wav", type=Path, help="also keep the 24-bit WAV masters in this folder")
    args = parser.parse_args()
    THEME.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as scratch:
        wavs = args.wav or Path(scratch)
        wavs.mkdir(parents=True, exist_ok=True)
        for name, event in EVENTS.items():
            stereo = master(synthesize(name), event)
            wav = wavs / f"{name}.wav"
            soundfile.write(wav, stereo, RATE, subtype="PCM_24")
            encode(wav, THEME / f"{event.theme_name}.oga")
            peak = true_peak_db(stereo)
            print(
                f"{name:20s} {event.theme_name:22s} {len(stereo) / RATE:.3f}s {loudness(stereo):6.1f} LUFS {peak:5.1f} dBTP"
            )


if __name__ == "__main__":
    main()
