# Speech

Dictation in Luft comes from `luft-speech` ([services/speech](../../services/speech)), a session service that listens and recognizes speech on the computer.

## The service

`luft-speech` owns `com.lantharos.Speech1` (see `services/speech/data/com.lantharos.Speech1.xml`). The session bus starts it when Kestrel or Settings needs it, and it exits after half a minute with nothing to do. Only Kestrel may call `Start`, `Stop` and `Cancel`, while Settings manages models through `com.lantharos.Speech1.Models`. It records from the default microphone through PipeWire only between `Start` and `Stop`, keeps the audio in memory, and recognizes it with one of two engines:

| Engine | Runs on | Model |
| --- | --- | --- |
| Parakeet TDT 0.6B v3 | The processor, through Fedora's ONNX Runtime | 698 MB: the encoder quantized to 4 bits from the FP32 export |
| Whisper large-v3-turbo | The graphics card through whisper.cpp and Vulkan, or the processor without one. whisper.cpp is built for AVX2, so processors older than about 2013 don't run it | 574 MB, Q5_0 |

Parakeet covers 25 European languages; Whisper covers the rest. Silero VAD (MIT, 1.3 MB, built into the service) tells speech from silence and noise every 32 ms. Speech is recognized in stretches that end at a pause of 0.6 s, or at the quietest moment once a stretch reaches 25 seconds, and each finished stretch is typed right away while the one still being spoken shows as a preview. Languages written in more than one script are written in the script of the keyboard layout. The service reads the processor's features from `/proc/cpuinfo` when it starts and refuses languages that need Whisper where it can't run, without loading it. The model loads on the first dictation and unloads three minutes after the last one. `luft-speech.service` caps the service at 2 GB of memory.

## Models

Models live in `~/.local/share/luft-speech/models`, one folder each. `services/speech/data/models.json` lists every file with its size and SHA-256; downloads resume where they stopped and are checked before they're used. While dictation is on, the service follows the language and engine chosen in Settings: it downloads the model they need and stops downloading the other.

## Files

| File in `services/speech/data` | Goes to |
| --- | --- |
| `com.lantharos.Speech1.service` | `/usr/share/dbus-1/services/` |
| `luft-speech.service` | `/usr/lib/systemd/user/` |

## Mirror

`get.luft.computer/models` mirrors the models. `.github/workflows/models.yml` runs `services/speech/mirror/mirror.sh` whenever `services/speech/data/models.json` changes: it downloads each file from the pinned upstream revision, quantizes the Parakeet encoder with `services/speech/mirror/quantize.py` in a pinned Python environment, checks every file against the list and uploads it.
