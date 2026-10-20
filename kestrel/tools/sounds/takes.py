import itertools
from dataclasses import dataclass

import numpy as np
from dsp import midi_hz, place, presence, raised_cosine, reverb, seconds
from voice import BREATH, BREATH_SIMPLE, voice

SHORT_TAKE = 0.5
SHORT_ROOM = 0.7
CHOKE_LEVEL = 0.3
CHOKE_TIME = 0.04


@dataclass(frozen=True)
class Take:
    timbre: object
    length: float
    notes: list
    articulation: str
    about: str


TAKES = {
    "device-plugged": Take(BREATH_SIMPLE, 0.32, [(0, 76, 0.9), (0.06, 81, 1.0)], "cue", "E up a fourth to A"),
    "device-unplugged": Take(BREATH_SIMPLE, 0.32, [(0, 81, 0.95), (0.06, 76, 0.95)], "cue", "mirror: A down to E"),
    "charger-connected": Take(BREATH_SIMPLE, 0.4, [(0, 74, 0.85), (0.07, 78, 1.0)], "cue", "lower D up a third to F#"),
    "low-battery": Take(BREATH, 0.65, [(0, 76, 0.9), (0.16, 73, 0.9)], "ring", "falling minor third E to C#"),
    "volume-tick": Take(BREATH_SIMPLE, 0.04, [(0, 86, 1.0)], "tick", "D tick"),
    "error": Take(BREATH_SIMPLE, 0.28, [(0, 74, 1.0), (0.09, 73, 0.8)], "dull", "muted D to C#, a quiet no"),
    "recording-started": Take(BREATH_SIMPLE, 0.3, [(0, 81, 0.9), (0.06, 83, 1.0)], "cue", "A up a step to B"),
    "recording-stopped": Take(BREATH_SIMPLE, 0.3, [(0, 83, 0.95), (0.06, 81, 0.95)], "cue", "mirror: B down to A"),
}


def choked(sound, start, next_start):
    i = seconds(next_start - start)
    ramp = seconds(CHOKE_TIME)
    gain = np.full(len(sound), CHOKE_LEVEL)
    gain[:i] = 1
    gain[i : i + ramp] = 1 - (1 - CHOKE_LEVEL) * raised_cosine(ramp)[: len(gain) - i]
    return sound * gain


def render(take):
    notes = [
        (start, voice(take.timbre, midi_hz(note), vel, take.articulation, take.length))
        for start, note, vel in take.notes
    ]
    notes = [(start, choked(sound, start, after[0])) for (start, sound), after in itertools.pairwise(notes)] + notes[
        -1:
    ]
    dry = place(notes, take.length)
    dry /= np.abs(dry).max() * 2
    rt60, damping, wet = take.timbre.room
    if take.length < SHORT_TAKE:
        rt60 *= SHORT_ROOM
    if take.articulation == "tick":
        wet = 0
    return presence(reverb(dry, rt60, damping, wet)[: seconds(take.length)], 2200, 3, 0.8)
