# luft-whisper

Speech recognition for the speech service, with [whisper.cpp](https://github.com/ggml-org/whisper.cpp) built from the release `upstream.json` names. The build downloads that release, checks it against the checksum there and builds it with Vulkan, so it needs `cmake`, `clang-devel`, `vulkan-loader-devel`, `vulkan-headers` and `glslc`.

To move to a new release, put its version and the SHA-256 of its `.tar.gz` from GitHub in `upstream.json`.
