# luft-handwriting

The session service that reads handwriting as text for apps that keep handwritten notes, such as Heft's search, through the [luft-handwriting crate](../../packages/system/handwriting). How it reads and where its model comes from is in [Handwriting](https://docs.luft.computer/developers/desktop/models/#handwriting).

## Build

It builds llama.cpp from source with its Vulkan backend, which needs CMake, a C++ compiler, libclang, the Vulkan and SPIR-V headers (`vulkan-headers`, `spirv-headers-devel`) and `glslc`.

## Testing

`cargo test` here checks how strokes are drawn for the recognizer. With the model downloaded, `LUFT_HANDWRITING_MODELS=<model folder> LUFT_HANDWRITING_SAMPLES=<folder of .json strokes and .txt> cargo test --release accuracy -- --ignored --nocapture` reads every sample the way the service does and reports error rates and times for each group of samples, on the graphics card when there is one, or on the processor with `LUFT_HANDWRITING_DEVICE=processor`. `python3 tools/samples.py <Hershey-Fonts folder> <samples folder>` writes such samples in Albanian, German, Serbian and English, from the [Hershey-Fonts](https://pypi.org/project/Hershey-Fonts/) package unpacked into a folder, with a `.words` file beside each line saying which strokes make up each word.
