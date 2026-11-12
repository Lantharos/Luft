# luft-language

The session service that runs a language model on this computer for apps that ask it to write, such as Heft's notes of a recorded class, through the [luft-language crate](../../packages/system/language). What it writes and where its model comes from is in [Language model](https://docs.luft.computer/developers/desktop/models/#writing-notes).

## Build

It builds llama.cpp from source with Vulkan, which needs CMake, a C++ compiler, libclang, `vulkan-headers`, `vulkan-loader-devel`, `spirv-headers-devel` and `glslc`.

## Testing

With the model downloaded, `LUFT_LANGUAGE_MODELS=<model folder> LUFT_LANGUAGE_SAMPLES=<folder of .json transcripts> cargo run --release --features measure -- measure` writes notes of every transcript part by part, the way Heft asks for them, and prints them with how long each part took. A transcript is `{ "language": "sq", "lines": [{ "at": 4000, "text": "…" }] }`.
