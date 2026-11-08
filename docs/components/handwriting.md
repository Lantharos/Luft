# Handwriting

`luft-handwriting` ([services/handwriting](../../services/handwriting)) is a session service that reads lines of handwriting on the computer. Heft uses it to make handwritten notes searchable, and any app that keeps strokes can do the same through the [luft-handwriting crate](../../packages/system/handwriting).

## The service

It owns `com.lantharos.Handwriting1` (see `services/handwriting/data/com.lantharos.Handwriting1.xml`). The session bus starts it when it's needed, and it exits after half a minute with nothing to do. `Recognize` takes one line as strokes of points in any unit, so a notes app can send the strokes it stored; the service draws them 64 pixels tall in black on white, keeping their proportions, and has the model read the picture. The model loads on the first line and unloads three minutes after the last one.

Reading is background work. `luft-handwriting.service` runs the service at the idle scheduling class and lowest priority for processor and disk, so it only gets time nothing else wants, with half the processor's cores and at most four threads, and caps it at 3 GB of memory. While the computer runs on a battery below 30% that isn't charging, as UPower reports it, `Recognize` answers `Error.Paused` and the app tries again later.

| Model | Download | Licence |
| --- | --- | --- |
| Qwen3-VL 2B Instruct, Q4_K_M, with its vision encoder in Q8_0 | 1.6 GB | Apache 2.0 |

It runs on the processor through llama.cpp, built into the service by the `llama-cpp-2` crate (CMake and libclang at build time, nothing at run time).

## Models

The model lives in `~/.local/share/luft-handwriting/models` and downloads only when asked, through `Install` on `com.lantharos.Handwriting1.Models`; Heft asks when handwriting search is turned on in its settings, and `Remove` deletes it again. `services/handwriting/data/models.json` lists every file with its size and SHA-256; downloads resume where they stopped and are checked before they're used, with the same code dictation uses for its models (`packages/system/models`). `.github/workflows/models.yml` mirrors it to `get.luft.computer/models` with the speech models.

## How well it reads and what it costs

Measured with `cargo test --release accuracy -- --ignored` in `services/handwriting` on a Ryzen 7 5800X, with four threads. The lines are everyday school sentences, eight in each language, written in Hershey's single-stroke script fonts with every letter shifted, slanted, turned and resized at random and the accents drawn on as their own strokes (`services/handwriting/tools/samples.py` makes them).

| Lines | Characters wrong | Words wrong | Time a line |
| --- | --- | --- | --- |
| German | 0% | 0% | 1.4 s |
| English | 0% | 0% | 1.8 s |
| Serbian | 1.8% | 11.4% | 1.5 s |
| Albanian | 16.5% | 46.2% | 1.6 s |

Serbian loses some marks (ć read as c, Đ as D); Albanian is the weakest, as ë often comes out as ä or i. A line takes about 6 processor-seconds spread over four threads, so a page of 20 lines is about two minutes of background work. While the model is loaded the service holds about 2.3 GB, most of it the model files mapped from disk.

Real handwriting is less regular than these fonts; on a person's quick joined-up writing expect the numbers to be worse, and Albanian in particular. A recognizer trained on pen strokes in these four languages would be fast and accurate enough to read while writing, which this model isn't.
