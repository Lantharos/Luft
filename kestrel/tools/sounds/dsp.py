import numpy as np
import pyloudnorm
from scipy import signal

RATE = 48000
LOUDNESS_WINDOW = 0.4


def seconds(n):
    return round(n * RATE)


def timeline(duration):
    return np.arange(seconds(duration)) / RATE


def midi_hz(note):
    return 440.0 * 2 ** ((note - 69) / 12)


def raised_cosine(length):
    return 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, max(length, 1)))


def percussive(duration, attack, decay):
    t = timeline(duration)
    env = np.exp(-t / decay)
    rise = seconds(attack)
    env[:rise] *= raised_cosine(rise)
    return env


def partials(freq, duration, ratios, amps, decays, attack=0.002, detune=0.0, rng=None):
    t = timeline(duration)
    out = np.zeros_like(t)
    rng = rng or np.random.default_rng(0)
    for ratio, amp, decay in zip(ratios, amps, decays):
        f = freq * ratio * (1 + detune * rng.uniform(-1, 1))
        if f > 7500:
            continue
        out += amp * np.sin(2 * np.pi * f * t + rng.uniform(0, 2 * np.pi)) * percussive(duration, attack, decay)
    return out


def noise(duration, seed=0):
    return np.random.default_rng(seed).standard_normal(seconds(duration))


def bandpass(x, low, high, order=2):
    return signal.sosfilt(signal.butter(order, [low, high], "bandpass", fs=RATE, output="sos"), x, axis=0)


def lowpass(x, cutoff, order=4):
    return signal.sosfilt(signal.butter(order, cutoff, "lowpass", fs=RATE, output="sos"), x, axis=0)


def highpass(x, cutoff, order=2):
    return signal.sosfilt(signal.butter(order, cutoff, "highpass", fs=RATE, output="sos"), x, axis=0)


def resonator(x, freq, q):
    b, a = signal.iirpeak(freq, q, fs=RATE)
    return signal.lfilter(b, a, x)


def place(events, duration):
    out = np.zeros(seconds(duration))
    for start, sound in events:
        i = seconds(start)
        end = min(len(out), i + len(sound))
        out[i:end] += sound[: end - i]
    return out


def impulse_response(rt60, damping, predelay=0.012, seed=7):
    length = rt60 * 1.1
    t = timeline(length)
    bright = np.exp(-6.9 * t / (rt60 * 0.45))
    dark = np.exp(-6.9 * t / rt60)
    channels = []
    for channel in range(2):
        tail = noise(length, seed + channel)
        tail = highpass(lowpass(tail, damping, 2), 120) * dark + lowpass(tail, 7000, 2) * bright * 0.35
        tail[: seconds(0.004)] *= raised_cosine(seconds(0.004))
        channels.append(np.concatenate([np.zeros(seconds(predelay)), tail]))
    ir = np.stack(channels, axis=1)
    return ir / np.sqrt((ir**2).sum(axis=0)).max()


def reverb(dry, rt60, damping, wet):
    ir = impulse_response(rt60, damping)
    tail = np.stack([signal.fftconvolve(dry, ir[:, c]) for c in range(2)], axis=1)
    out = np.zeros_like(tail)
    out[: len(dry)] += dry[:, None]
    return out + wet * tail


def presence(x, freq, gain_db, q):
    amplitude = 10 ** (gain_db / 40)
    alpha = np.sin(2 * np.pi * freq / RATE) / (2 * q)
    cos = np.cos(2 * np.pi * freq / RATE)
    b = [1 + alpha * amplitude, -2 * cos, 1 - alpha * amplitude]
    a = [1 + alpha / amplitude, -2 * cos, 1 - alpha / amplitude]
    return signal.lfilter(b, a, x, axis=0)


def finish(stereo, length, fade_in=0.0015, fade_out=0.06, air_cutoff=8000, floor=70):
    stereo = highpass(lowpass(stereo, air_cutoff, 8), floor, 4 if floor > 100 else 2)
    stereo = stereo[: seconds(length)]
    if len(stereo) < seconds(length):
        stereo = np.pad(stereo, ((0, seconds(length) - len(stereo)), (0, 0)))
    rise, fall = seconds(fade_in), seconds(min(fade_out, length * 0.5))
    stereo[:rise] *= raised_cosine(rise)[:, None]
    stereo[-fall:] *= (raised_cosine(fall)[::-1] ** 2)[:, None]
    return stereo


def loudness(stereo):
    padded = stereo
    if len(stereo) < seconds(LOUDNESS_WINDOW):
        padded = np.pad(stereo, ((0, seconds(LOUDNESS_WINDOW) - len(stereo)), (0, 0)))
    return pyloudnorm.Meter(RATE).integrated_loudness(padded)


def true_peak_db(stereo):
    oversampled = signal.resample_poly(stereo, 4, 1, axis=0)
    return 20 * np.log10(np.abs(oversampled).max())


def normalize(stereo, target_lufs):
    return stereo * 10 ** ((target_lufs - loudness(stereo)) / 20)
