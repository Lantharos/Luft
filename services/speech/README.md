# luft-speech

The session service that listens and recognizes speech for dictation; Settings manages its models through the [luft-speech crate](../../packages/system/speech). How it records, recognizes and downloads models is in [Speech](../../docs/components/speech.md).

## Build

It builds against `onnxruntime-devel`, `vulkan-loader-devel`, `vulkan-headers`, `glslc` and `pipewire-devel`.

## Testing

For checks, `LUFT_SPEECH_WAV` plays a 16 kHz mono WAV in place of the microphone, then silence, and `LUFT_SPEECH_MIRROR` downloads models from another server.

`cargo test` here covers finding speech and pauses, on a short LibriSpeech recording (CC BY 4.0) in `testdata`, the processor check, the language and engine choice, script conversion, resuming downloads and the model list. With models downloaded, `LUFT_SPEECH_MODELS=<models folder> LUFT_SPEECH_SAMPLES=<folder of .wav and .txt> LUFT_SPEECH_LANGUAGE=de cargo test --release -- --ignored --nocapture` measures each engine's word error rate and speed on recordings, and `cargo test --release dictate -- --ignored --nocapture` with the same variables dictates long recordings stretch by stretch, reporting how many of the words said are typed, and when a toggled dictation would stop for quiet. `input:dictation` in [Kestrel's checks](../../docs/testing.md) dictates into apps end to end.
