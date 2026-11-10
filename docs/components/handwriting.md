# Handwriting

`luft-handwriting` ([services/handwriting](../../services/handwriting)) is a session service that reads lines of handwriting on the computer. Heft uses it to make handwritten notes searchable and to turn writing into typed text as it's written, and any app that keeps strokes can do the same through the [luft-handwriting crate](../../packages/system/handwriting).

## The service

It owns `com.lantharos.Handwriting1` (see `packages/dbus/introspection/luft-handwriting-service`). The session bus starts it when it's needed, and it exits after half a minute with nothing to do. `Recognize` takes one line as strokes of points in any unit, so a notes app can send the strokes it stored; the service draws them 64 pixels tall in black on white, keeping their proportions, and has the model read the picture. The model loads on the first line and unloads three minutes after the last one.

There are two ways to ask. `Recognize` is background work: it runs on one thread at the idle scheduling class and lowest priority for processor and disk, and the threads llama.cpp starts from it inherit that, so it only gets time nothing else wants. While the computer runs on a battery below 30% that isn't charging, as UPower reports it, it answers `Error.Paused` and the app tries again later; transcribing recordings and the language model follow the same rule. Heft also holds background reading until the charger is in when its **Heavy work in the background** setting says so, as it does at first on laptops. `RecognizeNow` is for a line someone is waiting for, such as writing turned into text when the pen pauses: it runs at normal priority, goes ahead of every background line that hasn't started yet, and doesn't wait for the charger. Both share one loaded model. On the processor, reading uses half the cores and at most four threads; `luft-handwriting.service` caps the service at 3 GB of memory.

| Model | Download | Licence |
| --- | --- | --- |
| Qwen3-VL 2B Instruct, Q4_K_M, with its vision encoder in Q8_0 | 1.6 GB | Apache 2.0 |

It runs through llama.cpp, built into the service by the `llama-cpp-2` crate with its Vulkan backend (CMake, libclang, the Vulkan and SPIR-V headers and `glslc` at build time). When Vulkan finds a graphics card, built in or separate, the whole model loads onto it; when there's none, or loading there fails, it runs on the processor instead. The card's driver compiles llama.cpp's shaders the first time and keeps them in its shader cache, so only the very first line after an update takes several seconds.

## Models

The model lives in `~/.local/share/luft-handwriting/models` and downloads only when asked, through `Install` on `com.lantharos.Handwriting1.Models`; Heft asks when handwriting search is turned on in its settings, and `Remove` deletes it again. `services/handwriting/data/models.json` lists every file with its size and SHA-256; downloads resume where they stopped and are checked before they're used, with the same code dictation uses for its models (`packages/system/models`). `.github/workflows/models.yml` mirrors it to `get.luft.computer/models` with the speech models.

## How well it reads and what it costs

Measured with `cargo test --release accuracy -- --ignored` in `services/handwriting` on a desktop with a Ryzen 7 5800X and a GeForce RTX 3060, reading through Vulkan on the card and, with `LUFT_HANDWRITING_DEVICE=processor`, on four processor threads. The lines are everyday school sentences, eight in each language, written in Hershey's single-stroke script fonts with every letter shifted, slanted, turned and resized at random and the accents drawn on as their own strokes (`services/handwriting/tools/samples.py` makes them).

| Lines | Characters wrong | Words wrong | A line on the card | A line on the processor |
| --- | --- | --- | --- | --- |
| German | 0% | 0% | 0.17 s | 1.1 s |
| English | 0% | 0% | 0.16 s | 1.1 s |
| Serbian | 1.8% | 11.4% | 0.20 s | 1.3 s |
| Albanian | 15.7% | 43.6% | 0.22 s | 1.4 s |

Loading takes about a second either way. Serbian loses some marks (ć read as c, Đ as D); Albanian is the weakest, as ë often comes out as ä, ö or i. Words read on their own, as when a word is written again to correct it, go wrong more often without the rest of the line around them: 37% of Serbian and 67% of Albanian words, and 2.5% to 5% of English and German ones. Telling the model which language a line is in helps when it's right (Albanian words wrong fall to 26%) and hurts badly when it's wrong (English rises to 78%), so the service doesn't guess. While the model is loaded on the processor the service holds about 2.3 GB, most of it the model files mapped from disk; with the model on a card it holds about 0.7 GB and the card the model's 1.5 GB.

A line someone waits for stays quick while background reading goes on: on the card, `RecognizeNow` took 0.3 s a line through `busctl` on its own, and 0.2 to 0.7 s while four background readers kept the service busy, as it waits for at most the one background line already being read.

Real handwriting is less regular than these fonts; on a person's quick joined-up writing expect the numbers to be worse, and Albanian in particular. A recognizer trained on pen strokes in these four languages would be fast and accurate enough to read while writing, which this model isn't.
