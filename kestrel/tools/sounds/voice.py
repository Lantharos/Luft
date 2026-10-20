from dataclasses import dataclass

import numpy as np
from dsp import RATE, noise, raised_cosine, resonator, seconds


@dataclass(frozen=True)
class Timbre:
    onset: float
    harmonics: tuple
    breath: float
    room: tuple


BREATH = Timbre(0.006, (1, 0.18, 0.06), 0.05, (0.6, 6000, 0.18))
BREATH_SIMPLE = Timbre(0.006, (1, 0.14, 0.04), 0.02, (0.45, 6500, 0.14))

SHAPES = {
    "ring": (0.32, 0.3, 0.05),
    "cue": (0.15, 0.15, 0.03),
    "dull": (0.1, 0.0, 0.0),
    "tick": (0.011, 0.0, 0.0),
}

CHORUS = ((0, 0.78), (4, 0.22))


def phase(freq, length):
    return 2 * np.pi * np.cumsum(np.full(seconds(length), freq)) / RATE


def tone(timbre, freq, length):
    out = np.zeros(seconds(length))
    for cents, gain in CHORUS:
        base = phase(freq * 2 ** (cents / 1200), length)
        out += gain * sum(level * np.sin(k * base) for k, level in enumerate(timbre.harmonics, 1) if level)
    return out


def envelope(length, onset, decay, swell_depth, swell_time):
    t = np.arange(seconds(length)) / RATE
    env = np.exp(-t / decay) * (1 - swell_depth * np.exp(-t / swell_time)) if swell_time else np.exp(-t / decay)
    rise = seconds(onset)
    env[:rise] *= raised_cosine(rise)
    return env / env.max()


def normalized(x):
    return x / np.abs(x).max()


def voice(timbre, freq, vel, articulation, length):
    decay, swell_depth, swell_time = SHAPES[articulation]
    onset = 0.002 if articulation == "tick" else timbre.onset
    body = tone(timbre, freq, length) * envelope(length, onset, decay, swell_depth, swell_time)
    if articulation == "tick":
        return vel * body
    breath_level = timbre.breath * (0.4 if articulation == "dull" else 1)
    breath = (
        breath_level
        * normalized(resonator(noise(length, int(freq * 10)), freq, 60))
        * envelope(length, onset, decay * 0.35, 0, 0)
    )
    return vel * (body + breath)
