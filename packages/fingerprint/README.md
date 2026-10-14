# luft-fingerprint

Fingerprint readers through fprintd, shared by Settings and Install Luft: whether there is a reader, which fingers are added, adding and removing them.

```toml
luft-fingerprint = { path = "../../../packages/fingerprint" }
```

```rust
let window = luft_fingerprint::register(window, &events);
```

`register` adds the `fingerprint_*` bridge commands. `fingerprint_enroll` starts adding a finger and sends `fingerprint.enroll` with each scan's result until it's done; `fingerprint_stop` cancels it.
