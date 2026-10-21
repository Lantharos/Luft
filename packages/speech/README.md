# luft-speech

Dictation for Luft: hold Super and Alt, or the Copilot key, talk, and what you say is typed. `service/` is `luft-speech`, the session service that listens and recognizes speech on the computer; this crate holds the shared types and an async client that Settings uses for the models. How the service records, recognizes and downloads models is in [Speech](../../docs/components/speech.md).

| Item | Use |
| --- | --- |
| `types` | Models, downloads, languages and the overview Settings shows |
| `client` | `overview`, `install`, `cancel_install`, `remove` and `changes`, over the session bus |

## Build

`service` builds against `onnxruntime-devel`, `vulkan-loader-devel`, `vulkan-headers`, `glslc` and `pipewire-devel`.

## Testing

For checks, `LUFT_SPEECH_WAV` plays a 16 kHz mono WAV in place of the microphone, then silence, and `LUFT_SPEECH_MIRROR` downloads models from another server.

`cargo test` in `service` covers finding speech and pauses, on a short LibriSpeech recording (CC BY 4.0) in `service/testdata`, the processor check, the language and engine choice, script conversion, resuming downloads and the model list. With models downloaded, `LUFT_SPEECH_MODELS=<models folder> LUFT_SPEECH_SAMPLES=<folder of .wav and .txt> LUFT_SPEECH_LANGUAGE=de cargo test --release -- --ignored --nocapture` measures each engine's word error rate and speed on recordings, and `cargo test --release dictate -- --ignored --nocapture` with the same variables dictates long recordings stretch by stretch, reporting how many of the words said are typed, and when a toggled dictation would stop for quiet. `input:dictation` in [Kestrel's checks](../../docs/testing.md) dictates into apps end to end.
