# luft-speech

The session service that listens and recognizes speech for dictation, and, started with `--transcription`, transcribes recordings such as Heft's of a class; Settings manages its models through the [luft-speech crate](../../packages/system/speech). How it records, recognizes and downloads models is in [Speech](../../docs/components/speech.md).

## Build

It builds against `onnxruntime-devel`, `vulkan-loader-devel`, `vulkan-headers`, `glslc` and `pipewire-devel`.

## Testing

For checks, a build with the `recorded-audio` feature plays the 16 kHz mono WAV that `LUFT_SPEECH_WAV` names in place of the microphone, then silence; the service that ships is built without it and only ever listens to the microphone. `LUFT_SPEECH_MIRROR` downloads models from another server, and every file is still checked against the list built in.

`cargo test` here covers finding speech and pauses, on a short LibriSpeech recording (CC BY 4.0) in `testdata`, the processor check, the language and engine choice, script conversion, resuming downloads and the model list. With models downloaded, `LUFT_SPEECH_MODELS=<models folder> LUFT_SPEECH_SAMPLES=<folder of .wav and .txt> LUFT_SPEECH_LANGUAGE=de cargo test --release -- --ignored --nocapture` measures each engine's word error rate and speed on recordings, and `cargo test --release dictate -- --ignored --nocapture` with the same variables dictates long recordings stretch by stretch, reporting how many of the words said are typed, and when a toggled dictation would stop for quiet. `input:dictation` in [Kestrel's checks](../../docs/testing.md) dictates into apps end to end.

`LUFT_SPEECH_MODELS=<folder of models> LUFT_TRANSCRIPTION_SAMPLES=<folder of .opus with a .json of what was said when> cargo test --release transcribe -- --ignored --nocapture` transcribes recordings the way the service does and reports words wrong and how often the language was right for each language, and how fast. `python3 tools/class.py <folder per language of .wav and .txt> <out.opus>` makes such a recording of a class from recorded sentences.
