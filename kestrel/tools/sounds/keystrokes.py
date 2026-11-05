import argparse
import json
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np
import soundfile
from dsp import RATE, bandpass, finish, highpass, loudness, lowpass, normalize, seconds, timeline, true_peak_db

EXTENSION = Path(__file__).resolve().parents[3] / "extensions/keystrokes"
CEILING_DB = -2.0
ROUNDING = 2.2
CRISP = 13000
FADE_IN = 0.0002
FADE_OUT = 0.012
VARIANTS = 5


@dataclass(frozen=True)
class Mode:
    hertz: float
    decay: float
    level: float


@dataclass(frozen=True)
class Hit:
    """One thing striking another: a burst of noise, what it sets ringing, and how far into the sound it lands."""

    modes: tuple[Mode, ...]
    noise: float = 0.6
    band: tuple[float, float] = (900, 9000)
    burst: float = 0.0025
    at: float = 0.0
    level: float = 1.0


@dataclass(frozen=True)
class Recipe:
    hits: tuple[Hit, ...]
    length: float
    lufs: float = -20
    detune: float = 0.035
    drift: float = 0.0015
    extra: object = None
    bright: float = CRISP


@dataclass(frozen=True)
class Pack:
    name: str
    title: str
    description: str
    sounds: dict = field(default_factory=dict)


def ring(mode, length, detune, rng):
    t = timeline(length)
    hertz = mode.hertz * (1 + rng.uniform(-detune, detune))
    return mode.level * rng.uniform(0.8, 1.2) * np.exp(-t / mode.decay) * np.sin(2 * np.pi * hertz * t + rng.uniform(0, 2 * np.pi))


def burst(hit, length, rng):
    t = timeline(length)
    noise = rng.standard_normal(len(t)) * np.exp(-t / hit.burst)
    return hit.noise * bandpass(noise, *hit.band)


def strike(hit, length, detune, rng):
    out = burst(hit, length, rng)
    for mode in hit.modes:
        out = out + ring(mode, length, detune, rng)
    return hit.level * out


def render(recipe, seed):
    rng = np.random.default_rng(seed)
    out = np.zeros(seconds(recipe.length))
    for hit in recipe.hits:
        start = seconds(max(0, hit.at + rng.uniform(-recipe.drift, recipe.drift) * (hit.at > 0)))
        sound = strike(hit, recipe.length - start / RATE, recipe.detune, rng)
        out[start:] += sound[: len(out) - start]
    if recipe.extra:
        out = out + recipe.extra(recipe.length, rng)
    return master(out, recipe)


def rounded(mono):
    return np.tanh(ROUNDING * mono / np.abs(mono).max())


def master(mono, recipe):
    stereo = finish(np.stack([rounded(mono)] * 2, axis=1), recipe.length, fade_in=FADE_IN, fade_out=FADE_OUT, air_cutoff=recipe.bright, floor=60)
    stereo = normalize(stereo, recipe.lufs)
    return stereo * min(1, 10 ** ((CEILING_DB - true_peak_db(stereo)) / 20))


def ratchet(start, teeth, spacing, level, rng, length, tick=4200):
    out = np.zeros(seconds(length))
    t = timeline(0.02)
    for tooth in range(teeth):
        at = seconds(start + tooth * spacing * rng.uniform(0.92, 1.08))
        hertz = tick * rng.uniform(0.9, 1.1)
        click = level * rng.uniform(0.7, 1.1) * np.exp(-t / 0.0028) * np.sin(2 * np.pi * hertz * t)
        end = min(len(out), at + len(click))
        out[at:end] += click[: end - at]
    return out


def bell(start, level, length, rng):
    out = np.zeros(seconds(length))
    at = seconds(start)
    t = timeline(length - start)
    tone = sum(amp * np.exp(-t / decay) * np.sin(2 * np.pi * hertz * rng.uniform(0.997, 1.003) * t) for hertz, amp, decay in ((2750, 1.0, 0.22), (5480, 0.3, 0.1), (7340, 0.16, 0.06)))
    out[at:] += level * tone[: len(out) - at]
    return out


def carriage(length, rng):
    return ratchet(0.03, 15, 0.024, 0.34, rng, length) + bell(0.14, 0.42, length, rng) + 0.5 * lowpass(rng.standard_normal(seconds(length)), 700) * np.exp(-timeline(length) / 0.2)


def escapement(length, rng):
    return ratchet(0.028, 2, 0.016, 0.3, rng, length, tick=3600)


def spring(length, rng):
    t = timeline(length)
    return 0.05 * np.exp(-t / 0.02) * np.sin(2 * np.pi * rng.uniform(5400, 6200) * t)


def rubber(length, rng):
    t = timeline(length)
    sweep = np.cumsum(520 * np.exp(-t / 0.012) + 180) / RATE
    return 0.3 * np.exp(-t / 0.014) * np.sin(2 * np.pi * sweep)


def plate(*modes):
    return tuple(Mode(*mode) for mode in modes)


MECHANICAL = Pack("mechanical", "Mechanical", "Crisp switches on a metal plate", {
    "key": Recipe((
        Hit(plate((3900, 0.0025, 0.22)), noise=0.28, band=(2500, 11000), burst=0.0008),
        Hit(plate((2150, 0.006, 0.5), (3350, 0.004, 0.32), (5200, 0.003, 0.2), (440, 0.018, 0.75), (185, 0.02, 0.6)), noise=0.7, at=0.004),
    ), 0.09, extra=spring),
    "space": Recipe((
        Hit(plate((1500, 0.009, 0.42), (2500, 0.006, 0.26), (310, 0.03, 0.9), (150, 0.034, 0.8)), noise=0.5, band=(500, 6000)),
        Hit(plate((1950, 0.006, 0.3), (240, 0.026, 0.5)), noise=0.34, band=(700, 5000), at=0.0045, level=0.7),
    ), 0.13, lufs=-21),
    "enter": Recipe((
        Hit(plate((3300, 0.003, 0.22)), noise=0.3, band=(2000, 9000), burst=0.001),
        Hit(plate((1750, 0.008, 0.5), (2900, 0.005, 0.28), (360, 0.026, 0.9), (165, 0.03, 0.8)), noise=0.7, band=(700, 7500), at=0.005),
        Hit(plate((2300, 0.005, 0.2), (280, 0.02, 0.4)), noise=0.24, band=(800, 5000), at=0.012, level=0.7),
    ), 0.13, lufs=-20),
    "backspace": Recipe((
        Hit(plate((4300, 0.002, 0.22)), noise=0.26, band=(3000, 11000), burst=0.0007),
        Hit(plate((2450, 0.005, 0.5), (3800, 0.0035, 0.3), (520, 0.015, 0.7), (210, 0.018, 0.5)), noise=0.6, at=0.0035),
    ), 0.08, lufs=-21, extra=spring),
})

MEMBRANE = Pack("membrane", "Soft membrane", "A quiet office keyboard, round and muted", {
    "key": Recipe((
        Hit(plate((760, 0.011, 0.5), (1250, 0.007, 0.3), (250, 0.018, 0.85)), noise=0.3, band=(200, 2600), burst=0.005),
    ), 0.085, lufs=-23, extra=rubber, bright=6000),
    "space": Recipe((
        Hit(plate((560, 0.016, 0.5), (930, 0.01, 0.24), (170, 0.03, 0.95)), noise=0.3, band=(150, 1900), burst=0.008),
    ), 0.115, lufs=-23, extra=rubber, bright=5000),
    "enter": Recipe((
        Hit(plate((640, 0.015, 0.5), (1080, 0.009, 0.3), (195, 0.028, 0.95)), noise=0.34, band=(180, 2200), burst=0.007),
        Hit(plate((480, 0.01, 0.26)), noise=0.12, band=(150, 1500), at=0.012, level=0.6),
    ), 0.115, lufs=-22, extra=rubber, bright=5500),
    "backspace": Recipe((
        Hit(plate((880, 0.009, 0.5), (1450, 0.006, 0.26), (280, 0.014, 0.75)), noise=0.28, band=(250, 3000), burst=0.004),
    ), 0.075, lufs=-24, extra=rubber, bright=6500),
})

TYPEWRITER = Pack("typewriter", "Typewriter", "Metal on paper, with a bell and a carriage return on Enter", {
    "key": Recipe((
        Hit(plate((1850, 0.016, 0.5), (3150, 0.03, 0.34), (4750, 0.02, 0.26), (6300, 0.012, 0.16), (210, 0.022, 0.8), (120, 0.03, 0.5)), noise=1.0, band=(1200, 11000), burst=0.0018),
    ), 0.16, lufs=-19, extra=escapement, detune=0.05),
    "space": Recipe((
        Hit(plate((1250, 0.012, 0.32), (170, 0.03, 0.9), (95, 0.04, 0.6)), noise=0.32, band=(300, 3500), burst=0.004),
    ), 0.12, lufs=-22, extra=escapement),
    "enter": Recipe((
        Hit(plate((1450, 0.02, 0.4), (2400, 0.016, 0.26), (180, 0.03, 0.9)), noise=0.8, band=(500, 7000), burst=0.004),
    ), 0.72, lufs=-22, extra=carriage),
    "backspace": Recipe((
        Hit(plate((2300, 0.01, 0.34), (3700, 0.008, 0.22), (240, 0.02, 0.6)), noise=0.5, band=(900, 8000), burst=0.002),
    ), 0.11, lufs=-21, extra=escapement),
})

THOCK = Pack("thock", "Thock", "A deep, padded keyboard", {
    "key": Recipe((
        Hit(plate((980, 0.009, 0.36), (1650, 0.006, 0.18), (360, 0.026, 1.0), (205, 0.03, 0.9)), noise=0.42, band=(300, 3800), burst=0.0022),
    ), 0.095, lufs=-20, bright=7000),
    "space": Recipe((
        Hit(plate((720, 0.012, 0.3), (1200, 0.008, 0.16), (250, 0.036, 1.0), (135, 0.042, 0.95)), noise=0.4, band=(200, 2800), burst=0.003),
    ), 0.14, lufs=-20, bright=5500),
    "enter": Recipe((
        Hit(plate((830, 0.011, 0.36), (1400, 0.007, 0.16), (300, 0.03, 1.0), (165, 0.036, 0.95)), noise=0.46, band=(250, 3200), burst=0.003),
    ), 0.12, lufs=-19, bright=6000),
    "backspace": Recipe((
        Hit(plate((1150, 0.008, 0.36), (1900, 0.005, 0.16), (420, 0.022, 0.9), (240, 0.026, 0.75)), noise=0.4, band=(350, 4200), burst=0.002),
    ), 0.085, lufs=-21, bright=7500),
})

PACKS = (MECHANICAL, MEMBRANE, TYPEWRITER, THOCK)


def plain(hertz, length):
    return Recipe((Hit(plate((hertz, 0.008, 0.6), (hertz / 3, 0.015, 0.6)), noise=0.3),), length, lufs=-22)


TEMPLATE = {"key": plain(1600, 0.07), "space": plain(1000, 0.09), "enter": plain(800, 0.1), "backspace": plain(1300, 0.07), "click": plain(2600, 0.04)}

CLICK = Recipe((
    Hit(plate((3700, 0.0016, 0.5), (6100, 0.001, 0.3), (1150, 0.006, 0.42), (420, 0.009, 0.3)), noise=0.5, band=(1800, 12000), burst=0.0005),
), 0.04, lufs=-24, drift=0, detune=0.04)


def save(sound, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    soundfile.write(path, sound, RATE, format="FLAC", subtype="PCM_16")
    onset = int(np.argmax(np.abs(sound).max(axis=1) > 0.003))
    print(f"{path.parent.name}/{path.name}: {len(sound) / RATE * 1000:.0f} ms, {loudness(sound):.1f} LUFS, peak {true_peak_db(sound):.1f} dB, starts at {onset / RATE * 1000:.2f} ms")


def variants(recipe):
    return VARIANTS if recipe.length < 0.5 else 2


def build(destination):
    for pack in PACKS:
        for name, recipe in pack.sounds.items():
            for variant in range(variants(recipe)):
                save(render(recipe, hash_seed(pack.name, name, variant)), destination / "packs" / pack.name / f"{name}-{variant + 1}.flac")
    for variant in range(VARIANTS):
        save(render(CLICK, hash_seed("mouse", "click", variant)), destination / "sounds" / f"click-{variant + 1}.flac")
    build_packs(destination)
    build_template(destination)


def write_manifest(folder, name, description, takes):
    sounds = {kind: [f"{kind}-{take + 1}.flac" for take in range(count)] for kind, count in takes.items()}
    (folder / "pack.json").write_text(json.dumps({"name": name, "description": description, "sounds": sounds}, indent=2) + "\n")


def build_packs(destination):
    for pack in PACKS:
        takes = {name: variants(recipe) for name, recipe in pack.sounds.items()}
        write_manifest(destination / "packs" / pack.name, pack.title, pack.description, takes)


def build_template(destination):
    folder = destination / "template"
    takes = dict.fromkeys(TEMPLATE, 2)
    for name, recipe in TEMPLATE.items():
        for take in range(takes[name]):
            save(render(recipe, hash_seed("template", name, take)), folder / f"{name}-{take + 1}.flac")
    write_manifest(folder, "My sounds", "One line about how they sound", takes)


def hash_seed(*parts):
    return sum(ord(letter) * (index + 1) for index, letter in enumerate("/".join(map(str, parts))))


def main():
    parser = argparse.ArgumentParser(description="Renders the sounds Keystrokes comes with")
    parser.add_argument("--out", type=Path, default=EXTENSION)
    build(parser.parse_args().out)


main()
