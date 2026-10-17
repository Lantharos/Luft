# luft-variant

Which of Luft's two images suits a computer, shared by Install Luft, Settings, the updater and Meet Luft: the standard image, or the one with NVIDIA's driver for computers with NVIDIA graphics, hybrid laptops included.

```toml
luft-variant = { path = "../../../packages/variant" }
```

```rust
use luft_variant::Variant;

let suited = Variant::for_this_computer();
let target = suited.reference("ghcr.io/lantharos/luft:45-nightly"); // Some("…:45-nightly-nvidia") with NVIDIA graphics
```

- `nvidia_cards()` lists the NVIDIA display and 3D controllers as `10de:DEVICE`, from `/sys/bus/pci/devices`, or from the folder `LUFT_PCI_DEVICES` names (see [Testing](../../docs/testing.md#nvidia-graphics)).
- `Variant::for_vendors` picks the image from the PCI vendor IDs of a computer's graphics, for when they come from somewhere else, such as Windows.
- `Variant::of` tells an image reference's variant from its tag, and `Variant::reference` gives the same channel and version in another variant. A reference without a tag has no other variant.
