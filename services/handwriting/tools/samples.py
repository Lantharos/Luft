"""samples.py HERSHEY_DIR OUT_DIR: writes lines of synthetic cursive handwriting as stroke JSON plus their text,
and which strokes make up each word as a `.words` list of [first, end) stroke indices.

Letters come from Hershey's single-stroke script fonts, each one shifted, slanted and resized a little at random,
with accents (č ć š ž đ ë ç ä ö ü ß) drawn as extra strokes over their base letters.
"""
import json
import math
import random
import sys

sys.path.insert(0, sys.argv[1])
from HersheyFonts import HersheyFonts  # noqa: E402

OUT = sys.argv[2]
FONTS = ['scripts', 'scriptc', 'cursive']

SENTENCES = {
    'sq': ['Sot mësojmë gramatikën shqipe', 'Detyra e shtëpisë për të enjten', 'Nxënësit lexojnë një libër', 'Mësuesja shpjegoi mësimin', 'Nesër kemi provim në kimi', 'Shkruaj një hartim për pranverën', 'Qyteti ka shumë rrugë të bukura', 'Ky është një ushtrim i vështirë'],
    'de': ['Heute lernen wir die Grammatik', 'Die Hausaufgabe ist für Montag', 'Wir lesen ein schönes Buch', 'Der Lehrer erklärt die Übung', 'Mein Bruder spielt gern Fußball', 'Im Winter ist es sehr kalt', 'Die Prüfung war nicht schwer', 'Wir fahren morgen nach München'],
    'sr': ['Danas učimo kvadratne jednačine', 'Domaći zadatak za četvrtak', 'Đaci čitaju lektiru u školi', 'Napiši sastav o proleću', 'Profesorka je objasnila gradivo', 'Srbija ima mnogo planina', 'Ćirilica i latinica su pisma', 'Sutra je kontrolni iz hemije'],
    'en': ['The mitochondria is the powerhouse', 'Homework is due on Thursday', 'Read chapter four before class', 'The war ended in nineteen eighteen', 'Photosynthesis needs sunlight', 'Solve for x in both equations', 'Bring your calculator tomorrow', 'Write a short essay about spring'],
}

BASE = {'č': 'c', 'ć': 'c', 'š': 's', 'ž': 'z', 'đ': 'd', 'Đ': 'D', 'Č': 'C', 'Ć': 'C', 'Š': 'S', 'Ž': 'Z', 'ë': 'e', 'ç': 'c', 'ä': 'a', 'ö': 'o', 'ü': 'u', 'Ü': 'U', 'ß': 'B'}


def mark(letter, left, right, top):
    middle = (left + right) / 2
    above = top - 4
    if letter in 'čšžČŠŽ':
        return [[(middle - 3, above - 3), (middle, above), (middle + 3, above - 3)]]
    if letter in 'ćĆ':
        return [[(middle - 1, above), (middle + 3, above - 4)]]
    if letter in 'ëäöüÜ':
        return [[(middle - 2.5, above - 1), (middle - 2.4, above - 0.6)], [(middle + 2.5, above - 1), (middle + 2.6, above - 0.6)]]
    if letter in 'đĐ':
        return [[(middle - 1, top + 2), (middle + 6, top + 1)]]
    if letter == 'ç':
        return [[(middle, 9), (middle + 2, 12), (middle - 2, 14)]]
    return []


def line(font, text, rng):
    strokes = []
    words = [0]
    x = 0.0
    for letter in text:
        base = BASE.get(letter, letter)
        if base == ' ':
            words.append(len(strokes))
            x += 9 + rng.uniform(0, 4)
            continue
        glyph = font.glyphs_for_text(base)
        glyph = next(iter(glyph), None)
        if glyph is None:
            continue
        scale = rng.uniform(0.9, 1.1)
        slant = rng.uniform(-0.12, 0.18)
        dy = rng.uniform(-1.2, 1.2)
        turn = rng.uniform(-0.05, 0.05)
        placed = []
        for stroke in glyph.strokes:
            points = []
            for px, py in stroke:
                px -= glyph.left_offset
                qx = px * math.cos(turn) - py * math.sin(turn)
                qy = px * math.sin(turn) + py * math.cos(turn)
                points.append((x + (qx - qy * slant) * scale, (qy + dy) * scale))
            placed.append(points)
        xs = [px for stroke in placed for px, _ in stroke] or [x]
        ys = [py for stroke in placed for _, py in stroke] or [0]
        placed += [[(px, py) for px, py in accent] for accent in mark(letter, min(xs), max(xs), min(ys))]
        strokes += [stroke for stroke in placed if len(stroke) > 1]
        x = max(xs) + rng.uniform(0.5, 2.5)
    words.append(len(strokes))
    return strokes, [[first, end] for first, end in zip(words, words[1:])]


def main():
    rng = random.Random(7)
    font = HersheyFonts()
    for language, sentences in SENTENCES.items():
        for number, sentence in enumerate(sentences):
            font.load_default_font(FONTS[number % len(FONTS)])
            strokes, words = line(font, sentence, rng)
            name = f'{OUT}/{language}-{number:02}'
            with open(f'{name}.json', 'w') as out:
                json.dump([[[round(px, 2), round(py, 2)] for px, py in stroke] for stroke in strokes], out)
            with open(f'{name}.words', 'w') as out:
                json.dump(words, out)
            with open(f'{name}.txt', 'w') as out:
                out.write(sentence + '\n')


main()
