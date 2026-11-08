# luft-handwriting

The session service that reads handwriting as text for apps that keep handwritten notes, such as Heft's search, through the [luft-handwriting crate](../../packages/system/handwriting). How it reads and where its model comes from is in [Handwriting](../../docs/components/handwriting.md).

## Build

It builds llama.cpp from source, which needs CMake, a C++ compiler and libclang.

## Testing

`cargo test` here checks how strokes are drawn for the recognizer. With the model downloaded, `LUFT_HANDWRITING_MODELS=<model folder> LUFT_HANDWRITING_SAMPLES=<folder of .json strokes and .txt> cargo test --release accuracy -- --ignored --nocapture` reads every sample the way the service does and reports error rates and times for each group of samples. `python3 tools/samples.py <Hershey-Fonts folder> <samples folder>` writes such samples in Serbian, German, English and Albanian, from the [Hershey-Fonts](https://pypi.org/project/Hershey-Fonts/) package unpacked into a folder.
