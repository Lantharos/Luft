# Speech

Dictation in Luft comes from `luft-speech` ([services/speech](../../services/speech)), a session service that listens and recognizes speech on the computer.

## The service

`luft-speech` owns `com.lantharos.Speech1` (see `services/speech/data/com.lantharos.Speech1.xml`). The session bus starts it when Kestrel or Settings needs it, and it exits after half a minute with nothing to do. Only Kestrel may call `Start`, `Stop` and `Cancel`, while Settings manages models through `com.lantharos.Speech1.Models`. It records from the default microphone through PipeWire only between `Start` and `Stop`, keeps the audio in memory, and recognizes it with one of two engines:

| Engine | Runs on | Model |
| --- | --- | --- |
| Parakeet TDT 0.6B v3 | The processor, through Fedora's ONNX Runtime | 698 MB: the encoder quantized to 4 bits from the FP32 export |
| Whisper large-v3-turbo | The graphics card through whisper.cpp and Vulkan, or the processor without one. whisper.cpp is built for AVX2, so processors older than about 2013 don't run it | 574 MB, Q5_0 |

Parakeet covers 25 European languages; Whisper covers the rest. Silero VAD (MIT, 1.3 MB, built into the service) tells speech from silence and noise every 32 ms. Speech is recognized in stretches that end at a pause of 0.6 s, or at the quietest moment once a stretch reaches 25 seconds, and each finished stretch is typed right away while the one still being spoken shows as a preview. Languages written in more than one script are written in the script of the keyboard layout. The service reads the processor's features from `/proc/cpuinfo` when it starts and refuses languages that need Whisper where it can't run, without loading it. The model loads on the first dictation and unloads three minutes after the last one. `luft-speech.service` caps the service at 2 GB of memory.

## Transcribing recordings

The same program, started as `luft-speech --transcription`, transcribes recordings such as Heft's of a class. It owns `com.lantharos.Transcription1` (see `services/speech/data/com.lantharos.Transcription1.xml`) and runs as `luft-transcription.service`, apart from dictation, which has to answer at once: at the idle scheduling class and lowest priority for processor and disk, with half the processor's cores and at most four threads, capped at 2 GB. It exits after half a minute with nothing to do, and unloads Whisper three minutes after the last request.

`Transcribe` takes an Ogg Opus recording as an open file, where to start, whether the recording has ended and the languages to choose from, such as `sr-Latn`, `de`, `en` and `sq`. It transcribes about two minutes from there and answers with what was said, each piece with its start, end and language, and where to go on from. It never reads the file by name, so it reaches only the recording it's handed. A recording still being made can be transcribed as it grows: speech running into its end is left for the next request. While the computer runs on a battery below 30% that isn't charging, it answers `Error.Paused`, like handwriting and the language model.

Each request decodes the stretch it needs with libopus, counting the packets before it without decoding them, and brings it to 16 kHz. Silero VAD finds where someone speaks, with a pause of half a second ending a stretch and stretches of more than 27.5 seconds cut at their quietest moment. Whisper large-v3-turbo tells the language of each stretch among the ones named, counting Croatian and Bosnian towards Serbian, since it hears them as one another; a stretch shorter than a second, or one it isn't sure about while the language before it is still likely, keeps the language before it. Neighbouring stretches in the same language are then transcribed together, up to 27.5 seconds at a time, with timestamps, and Serbian is written in the alphabet asked for.

Noise suppression before Whisper made it worse: with RNNoise in front, words wrong rose from 6.4% to 11.4% in English and from 18.5% to 24.5% in Serbian on the quiet recording below, and suppressing noise only for finding speech didn't help either, so recordings go to Whisper as they were recorded. Whisper was trained on noisy speech, and Silero VAD tells speech from noise on its own.

### How well it transcribes

Measured with `cargo test --release transcribe -- --ignored --nocapture` in `services/speech` on an RTX 3060 through Vulkan, choosing among Serbian, German, English and Albanian. The recordings are 64 sentences, 16 in each language, read by different people (Google FLEURS for Serbian, German and English, CC BY 4.0, and Mozilla Common Voice for Albanian, CC0), each brought to the same level and put one after another in runs of one to four in a language, over the murmur of other sentences and pink noise, encoded as Heft records (`services/speech/tools/class.py` makes them).

| 13½ minutes of class | German | English | Serbian | Albanian |
| --- | --- | --- | --- | --- |
| Quiet room, words wrong | 7.2% | 6.4% | 18.5% | over 100% |
| Noisy room, words wrong | 9.3% | 5.3% | 25.7% | 96% |
| Language right, of 16 sentences | 16 | 16 | 16 | 4 to 5 |

It takes 43 to 47 seconds, about 18 times as fast as it was said, so a 45-minute class takes about two and a half minutes on that card. On the processor alone, four threads of a Ryzen 7 5800X, it's slower than the class itself took. Laptops with Radeon graphics run it through Vulkan too, and should take something like ten minutes for a class.

Serbian errors are mostly names and endings; the meaning comes through. Albanian is Whisper's weak spot: it takes most Albanian sentences for English, and even told the language, it got 84% of the words wrong on these recordings, which are short and read in dialect, and large-v3 got 73%. A class taught in Albanian comes out barely usable.

## Models

Models live in `~/.local/share/luft-speech/models`, one folder each, managed by the code in `packages/system/models` that handwriting shares. `services/speech/data/models.json` lists every file with its size and SHA-256; downloads resume where they stopped and are checked before they're used. While dictation is on, the service follows the language and engine chosen in Settings: it downloads the model they need and stops downloading the other.

## Files

| File in `services/speech/data` | Goes to |
| --- | --- |
| `com.lantharos.Speech1.service` | `/usr/share/dbus-1/services/` |
| `luft-speech.service` | `/usr/lib/systemd/user/` |
| `com.lantharos.Transcription1.service` | `/usr/share/dbus-1/services/` |
| `luft-transcription.service` | `/usr/lib/systemd/user/` |

## Mirror

`get.luft.computer/models` mirrors the models, together with [handwriting's](handwriting.md). `.github/workflows/models.yml` runs `services/speech/mirror/mirror.sh` whenever either list changes: it downloads each file from the pinned upstream revision, quantizes the Parakeet encoder with `services/speech/mirror/quantize.py` in a pinned Python environment, checks every file against the list and uploads it.
