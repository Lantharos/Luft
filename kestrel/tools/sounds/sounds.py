import numpy as np
from dsp import RATE, bandpass, lowpass, midi_hz, noise, partials, place, presence, raised_cosine, reverb, seconds
from scipy import signal
from voice import BREATH_SIMPLE, envelope, normalized, phase, voice

BELL_RATIOS = [1, 2.76, 5.4]
SHUTTER_CEILING = 5500
SWEEP_BLOCK = 64
CHORD = ((74, 1.0), (78, 0.75), (81, 0.7), (86, 0.35))


def roomed(dry, length, room=BREATH_SIMPLE.room):
    dry = dry / (np.abs(dry).max() * 2)
    rt60, damping, wet = room
    return presence(reverb(dry, rt60, damping, wet)[: seconds(length)], 2200, 3, 0.8)


def chime(note, vel, length, bell):
    freq = midi_hz(note)
    strike = partials(freq, length, BELL_RATIOS, [0.5, 0.3, 0.1], [0.08, 0.025, 0.012], attack=0.001)
    return voice(BREATH_SIMPLE, freq, vel, "cue", length) + bell * vel * strike


def notification():
    length = 0.32
    notes = [(0, 86, 0.85), (0.07, 90, 1.0)]
    return roomed(place([(t, chime(n, v, length, 0.6)) for t, n, v in notes], length), length)


def notification_low():
    length = 0.28
    return roomed(chime(81, 0.8, length, 0.35), length)


def sweep(length, start_hz, end_hz, q):
    source = noise(length, seed=11)
    out = np.zeros_like(source)
    centres = np.geomspace(start_hz, end_hz, len(source) // SWEEP_BLOCK + 1)
    state = np.zeros(2)
    for block, centre in enumerate(centres):
        b, a = signal.iirpeak(centre, q, fs=RATE)
        chunk = slice(block * SWEEP_BLOCK, (block + 1) * SWEEP_BLOCK)
        out[chunk], state = signal.lfilter(b, a, source[chunk], zi=state)
    return normalized(out)


def new_mail():
    length, whoosh_time, landing = 0.5, 0.15, 0.13
    whoosh = sweep(whoosh_time, 600, 3200, 2.5)
    rise, fall = seconds(0.11), seconds(0.04)
    whoosh *= np.concatenate([raised_cosine(rise), raised_cosine(fall)[::-1]])[: len(whoosh)]
    notes = [(landing, 81, 0.85), (landing + 0.07, 86, 1.0)]
    sounds = [(0, 0.8 * whoosh)] + [(t, chime(n, v, length - t, 0.4)) for t, n, v in notes]
    return roomed(place(sounds, length), length)


def click(length, centre, vel):
    burst = bandpass(noise(length, seed=int(centre)), centre * 0.6, centre * 1.6)
    burst *= envelope(length, 0.0015, 0.006, 0, 0)
    body = np.sin(2 * np.pi * centre * 0.5 * np.arange(seconds(length)) / RATE) * envelope(length, 0.0015, 0.02, 0, 0)
    return vel * (normalized(burst) + 0.5 * body)


def screenshot():
    length = 0.2
    hush = bandpass(noise(length, seed=5), 800, 3500)
    hush = 0.12 * normalized(hush) * envelope(length, 0.004, 0.035, 0, 0)
    dry = place([(0, click(0.05, 2400, 1.0)), (0.05, click(0.05, 2000, 0.75)), (0, hush)], length)
    return lowpass(roomed(dry, length, (0.3, 5000, 0.1)), SHUTTER_CEILING, 8)


def steady(freq, length):
    base = phase(freq, length)
    return sum(level * np.sin(k * base) for k, level in enumerate(BREATH_SIMPLE.harmonics, 1))


def sign_in():
    length, bloom, fade = 1.2, 0.4, 0.8
    t = np.arange(seconds(length)) / RATE
    shape = np.where(t < bloom, 0.5 - 0.5 * np.cos(np.pi * t / bloom), np.exp(-(t - bloom) / (fade / 3)))
    chord = sum(level * steady(midi_hz(n), length) for n, level in CHORD)
    breath = 0.04 * bandpass(noise(length, seed=9), 700, 3000) / 3
    return roomed((chord + breath) * shape, length, (0.8, 6000, 0.2))


def warning():
    length = 0.4
    notes = [(0, 78, 1.0), (0.14, 78, 0.9)]
    return roomed(place([(t, chime(n, v, length - t, 0.3)) for t, n, v in notes], length), length)


def inflected(freq, length, bend, start, over):
    t = np.arange(seconds(length)) / RATE
    progress = np.clip((t - start) / over, 0, 1)
    base = 2 * np.pi * np.cumsum(freq * 2 ** (bend / 12 * (0.5 - 0.5 * np.cos(np.pi * progress)))) / RATE
    return sum(level * np.sin(k * base) for k, level in enumerate(BREATH_SIMPLE.harmonics, 1))


def question():
    length = 0.35
    body = inflected(midi_hz(79), length, 2, 0.12, 0.1) * envelope(length, BREATH_SIMPLE.onset, 0.2, 0.15, 0.03)
    breath = 0.02 * normalized(bandpass(noise(length, seed=13), 600, 1400)) * envelope(length, 0.006, 0.05, 0, 0)
    return roomed(body + breath, length)


def mail_sent():
    length, whoosh_time = 0.4, 0.32
    whoosh = sweep(whoosh_time, 3200, 700, 2.5)
    rise = seconds(0.03)
    whoosh[:rise] *= raised_cosine(rise)
    whoosh *= np.exp(-np.arange(len(whoosh)) / seconds(0.09))
    whoosh[-seconds(0.03) :] *= raised_cosine(seconds(0.03))[::-1]
    sounds = [(0, chime(81, 0.45, length, 0.2)), (0.02, 0.9 * whoosh)]
    return roomed(place(sounds, length), length)


def key_click(length, centre, width, seed):
    burst = bandpass(noise(length, seed), centre / width, min(centre * width, 5000))
    return normalized(burst) * envelope(length, 0.001, 0.005, 0, 0)


def keyboard(centre, width, spread, length=0.03):
    middle, side = key_click(length, centre, width, 21), key_click(length, centre, width, 22)
    side *= np.sqrt((middle**2).sum() / (side**2).sum())
    return np.stack([middle + spread * side, middle - spread * side], axis=1)


SOUNDS = {
    "notification": (notification, "bright rising major third D6 to F#6 with a light bell strike"),
    "notification-low": (notification_low, "the same chime as one softer, lower A5"),
    "new-mail": (new_mail, "short airy whoosh rising into a two-note fourth, A5 to D6"),
    "screenshot": (screenshot, "two soft filtered shutter clicks 50 ms apart with a breath of air"),
    "sign-in": (sign_in, "warm D major chord swelling in over 0.4 s, fading by 1.2 s"),
    "warning": (warning, "soft repeated F#5, a two-tap 'hey' for alert dialogs"),
    "question": (question, "one soft G5 that bends up a whole step at the end, like a question"),
    "mail-sent": (mail_sent, "faint A5 touch, then a soft whoosh sweeping down and away"),
    "keyboard-tap": (lambda: keyboard(1800, 1.6, 0), "tiny dry filtered tick around 1.8 kHz"),
    "keyboard-tap-delete": (lambda: lowpass(keyboard(1100, 1.5, 0, 0.035), 2500, 4), "the same tick, lower and duller"),
    "keyboard-tap-space": (
        lambda: keyboard(1400, 2.2, 0.6, 0.035),
        "the same tick, softer, broader and wider in stereo",
    ),
}
