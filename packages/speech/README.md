# luft-speech

Dictation for Luft: hold Super and Alt, or the Copilot key, talk, and what you say is typed. `service/` is `luft-speech`, the session service that listens and recognizes speech on the computer; this crate holds the shared types and an async client that Settings uses for the models.

| Item | Use |
| --- | --- |
| `types` | Models, downloads, languages and the overview Settings shows |
| `client` | `overview`, `install`, `cancel_install`, `remove` and `changes`, over the session bus |

## The service

`luft-speech` owns `com.lantharos.Speech1` (see `service/data/com.lantharos.Speech1.xml`). The session bus starts it when Kestrel or Settings needs it, and it exits after half a minute with nothing to do. It records from the default microphone through PipeWire only between `Start` and `Stop`, keeps the audio in memory, and recognizes it with one of two engines:

| Engine | Runs on | Model |
| --- | --- | --- |
| Parakeet TDT 0.6B v3 | The processor, through Fedora's ONNX Runtime | 698 MB: the encoder quantized to 4 bits from the FP32 export |
| Whisper large-v3-turbo | The graphics card through whisper.cpp and Vulkan, or the processor without one. whisper.cpp is built for AVX2, so processors older than about 2013 don't run it | 574 MB, Q5_0 |

Parakeet covers 25 European languages; Whisper covers the rest. Languages written in more than one script are written in the script of the keyboard layout. The service reads the processor's features from `/proc/cpuinfo` when it starts and refuses languages that need Whisper where it can't run, without loading it. The model loads on the first dictation and unloads three minutes after the last one. `luft-speech.service` caps the service at 2 GB of memory.

Models live in `~/.local/share/luft-speech/models`, one folder each. `data/models.json` lists every file with its size and SHA-256; downloads resume where they stopped and are checked before they're used. While dictation is on, the service follows the language and engine chosen in Settings: it downloads the model they need and stops downloading the other.

| File in `service/data` | Goes to |
| --- | --- |
| `com.lantharos.Speech1.service` | `/usr/share/dbus-1/services/` |
| `luft-speech.service` | `/usr/lib/systemd/user/` |

It builds against `onnxruntime-devel`, `vulkan-loader-devel`, `vulkan-headers`, `glslc` and `pipewire-devel`. For checks, `LUFT_SPEECH_WAV` plays a 16 kHz mono WAV in place of the microphone, then silence, and `LUFT_SPEECH_MIRROR` downloads models from another server.

## Models

`get.luft.computer/models` mirrors the models. `.github/workflows/models.yml` runs `mirror/mirror.sh` whenever `data/models.json` changes: it downloads each file from the pinned upstream revision, quantizes the Parakeet encoder with `mirror/quantize.py` in a pinned Python environment, checks every file against the list and uploads it.

## Testing

`cargo test` in `service` covers pause detection, the processor check, the language and engine choice, script conversion, resuming downloads and the model list. With models downloaded, `LUFT_SPEECH_MODELS=<models folder> LUFT_SPEECH_SAMPLES=<folder of .wav and .txt> LUFT_SPEECH_LANGUAGE=de cargo test --release -- --ignored --nocapture` measures each engine's word error rate and speed on recordings. `input:dictation` in [Kestrel's checks](../../docs/testing.md) dictates into apps end to end.
