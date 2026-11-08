# luft-handwriting

The session service that reads handwriting as text, for the writing strip in Kestrel and for apps that keep handwritten notes, through the [luft-handwriting crate](../../packages/system/handwriting). How it reads and where its model comes from is in [Handwriting](../../docs/components/handwriting.md).

## Build

It builds against `onnxruntime-devel`.

## Testing

`cargo test` here checks how strokes are drawn for the recognizer. With the model downloaded, `LUFT_HANDWRITING_MODELS=<model folder> LUFT_HANDWRITING_SAMPLES=<folder of .json strokes and .txt> cargo test --release accuracy -- --ignored --nocapture` reads every sample the way the service does and reports error rates and times for each group of samples. `input:handwriting` in [Kestrel's checks](../../docs/testing.md) writes into a text field end to end.
