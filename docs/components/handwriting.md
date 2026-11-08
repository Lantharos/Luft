# Handwriting

Writing into text fields with a pen comes from `luft-handwriting` ([services/handwriting](../../services/handwriting)), a session service that reads lines of handwriting on the computer, and the writing strip in Kestrel (`kestrel/ui/src/system/handwriting`).

## The writing strip

With handwriting on in Settings → Keyboard & Input, Kestrel watches for a pen pressing down. The press still reaches the app, which moves its cursor; a moment later, if a text field that doesn't hide what's typed has the cursor near where the pen touched, a strip opens under the cursor.

The strip shows the field's text around the cursor, as the field reports it through the input method, and a writing area under it. After a pause of 0.6 s without the pen down, what was written is read and typed into the field through the input method, the way dictation types. Words get a space where the letters next to them need one.

| On the field's text in the strip | Does |
| --- | --- |
| A line through words | Deletes the words it covers at least half of, and the space after them |
| A tap between letters | Writes the next words there instead of at the cursor |

Scribbling back and forth over writing that hasn't been typed yet takes it back. Editing goes through the cursor, the only way text input lets a field change: deleting a word before the cursor deletes everything from it to the cursor and types the rest back in one step. Apps that don't report their text still get what's written typed at the cursor, without the editing.

## The service

`luft-handwriting` owns `com.lantharos.Handwriting1` (see `services/handwriting/data/com.lantharos.Handwriting1.xml`). The session bus starts it when it's needed, and it exits after half a minute with nothing to do. `Recognize` takes one line as strokes of points in any unit, so a notes app can send the strokes it stored; the service draws them 48 pixels tall in black on white, keeping their proportions, and reads the picture. The model loads on the first line and unloads three minutes after the last one. `luft-handwriting.service` caps the service at 512 MB of memory.

| Model | Size | Licence |
| --- | --- | --- |
| PP-OCRv5 Latin text recognition, mobile, in ONNX | 7.9 MB | Apache 2.0 |

It reads 32 languages written in Latin letters, Serbian, German, English and Albanian among them, on the processor through Fedora's ONNX Runtime, in about 10 ms a line.

## Models

The model lives in `~/.local/share/luft-handwriting/models`. `services/handwriting/data/models.json` lists every file with its size and SHA-256; it downloads while handwriting is on, resumes where it stopped and is checked before it's used, with the same code dictation uses for its models (`packages/system/models`). `.github/workflows/models.yml` mirrors it to `get.luft.computer/models` with the speech models.

## How well it reads

Measured with `cargo test --release accuracy -- --ignored` in `services/handwriting`, on a Ryzen 7 5800X. The sample lines are 12 everyday sentences in each language, each written in three of 18 handwriting fonts with their letters shifted, turned and resized at random, and traced into strokes, plus seven lines of real, quick handwriting in English recorded from a Wacom AES pen.

| Lines | Characters wrong | Words wrong |
| --- | --- | --- |
| German | 12.7% | 42.5% |
| English | 6.9% | 26.1% |
| Serbian | 12.4% | 45.9% |
| Albanian | 20.1% | 68.6% |
| Real handwriting, English | 59.0% | 94.7% |

The model was trained on printed text with some handwriting. It mistakes ë for ê and drops other marks, and loose joined-up writing defeats it. It's the plumbing's first model rather than one that's good enough: a recognizer trained on pen strokes in these four languages is what the strip needs.
