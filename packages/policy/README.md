# luft-policy

The settings an organization decides on its computers, read from `/etc/luft/policy.d` and then `/usr/share/luft/policy.d`, so an image's own policy wins. Every service that owns one of these settings reads it and refuses to change what it decides; the files, keys and where each is enforced are in [Locking settings with a policy](https://docs.luft.computer/developers/system/policy/).

```toml
luft-policy.workspace = true
```

```rust
use luft_policy::Policy;

if !Policy::load().software.system_packages {
    return Err(Error::managed());
}
```

`cargo test` here covers merging files in name order and which folder wins.
