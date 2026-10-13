# luft-network

Network connections through NetworkManager, shared by Settings and Install Luft: Wi-Fi, wired, VPN and WireGuard, saved profiles, certificates and airplane mode.

```toml
luft-network = { path = "../../../packages/network" }
```

```rust
let window = luft_network::register(window, &events);
```

`register` adds the `network_*` bridge commands. `network_open` returns a snapshot and starts sending `network.changed` with fresh snapshots and `network.failed` when joining fails; `network_close` stops them.
