"""Puts recorded sentences together into one long recording of a class.

    python3 tools/class.py <samples> <out.opus> [--noise 0.03] [--minutes 6] [--seed 1]

<samples> has one folder per language (named with the tag the transcription
reports, such as sq, de, sr, en), each holding 16 kHz mono .wav files with a
.txt of what is said in them. Sentences, each brought to the same level,
follow one another in runs of one to four in the same language, with pauses
of half a second to four seconds, over pink noise and the murmur of other
sentences played quietly underneath, the way a microphone at the back of a
classroom hears a teacher. The recording is
encoded the way Heft records, Ogg Opus at 24 kbit/s, and <out.json> beside it
lists what was said when, for the transcription check.
"""

import argparse
import json
import random
import subprocess
import wave
from pathlib import Path

import numpy as np

RATE = 16_000
LEVEL = 0.05


def read(path):
    with wave.open(str(path)) as audio:
        frames = audio.readframes(audio.getnframes())
    return np.frombuffer(frames, dtype="<i2").astype(np.float32) / 32768.0


def levelled(speech):
    """The sentence as loud as a teacher heard from the back of the room, whatever level it was recorded at."""
    loud = speech[np.abs(speech) > np.max(np.abs(speech)) * 0.05]
    return speech * (LEVEL / max(np.sqrt(np.mean(loud**2)), 1e-6))


def pink(length, rng):
    white = rng.standard_normal(length + 4096)
    spectrum = np.fft.rfft(white)
    spectrum /= np.sqrt(np.arange(1, len(spectrum) + 1))
    noise = np.fft.irfft(spectrum)[:length]
    return noise / np.max(np.abs(noise))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("samples", type=Path)
    parser.add_argument("out", type=Path)
    parser.add_argument("--noise", type=float, default=0.03)
    parser.add_argument("--minutes", type=float, default=6)
    parser.add_argument("--seed", type=int, default=1)
    options = parser.parse_args()
    rng = np.random.default_rng(options.seed)
    pick = random.Random(options.seed)
    sentences = {
        folder.name: [(wav, wav.with_suffix(".txt").read_text().strip()) for wav in sorted(folder.glob("*.wav"))]
        for folder in sorted(options.samples.iterdir())
        if folder.is_dir()
    }
    queues = {language: pick.sample(items, len(items)) for language, items in sentences.items()}
    pieces, said, at = [], [], 0
    while at < options.minutes * 60 * RATE and any(queues.values()):
        language = pick.choice([language for language, queue in queues.items() if queue])
        for _ in range(pick.randint(1, 4)):
            if not queues[language]:
                break
            wav, text = queues[language].pop()
            speech = levelled(read(wav))
            pause = np.zeros(int(pick.uniform(0.5, 4.0) * RATE), dtype=np.float32)
            pieces += [pause, speech]
            at += len(pause)
            said.append({"start": at * 1000 // RATE, "end": (at + len(speech)) * 1000 // RATE, "language": language, "text": text})
            at += len(speech)
    pieces.append(np.zeros(RATE, dtype=np.float32))
    voice = np.concatenate(pieces)
    murmur = np.zeros_like(voice)
    every = [wav for items in sentences.values() for wav, _ in items]
    position = 0
    while position < len(murmur):
        other = levelled(read(pick.choice(every)))[: len(murmur) - position]
        murmur[position : position + len(other)] += other
        position += len(other) + int(pick.uniform(0, 2) * RATE)
    mixed = voice + 0.08 * murmur + options.noise * pink(len(voice), rng)
    mixed = np.clip(mixed / max(1.0, np.max(np.abs(mixed))), -1, 1)
    raw = (mixed * 32767).astype("<i2").tobytes()
    subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-y", "-f", "s16le", "-ar", str(RATE), "-ac", "1", "-i", "-",
         "-ar", "48000", "-c:a", "libopus", "-b:a", "24k", "-application", "voip", str(options.out)],
        input=raw,
        check=True,
    )
    options.out.with_suffix(".json").write_text(json.dumps(said, ensure_ascii=False, indent=1))
    print(f"{options.out}: {len(voice) / RATE:.0f} s, {len(said)} sentences")


main()
