# luft-policy

The settings an organization decides on its computers, read from `/etc/luft/policy.d` and then `/usr/share/luft/policy.d`, so an image's own policy wins. Every service that owns one of these settings reads it and refuses to change what it decides; the files and keys are in [Locking settings with a policy](https://docs.luft.computer/organizations/policy/), and where each is enforced in [How policy is enforced](https://docs.luft.computer/developers/system/policy/).

```toml
luft-policy.workspace = true
```

```rust
use luft_policy::Policy;

if !Policy::load().software.system_packages {
    return Err(Error::managed());
}
```

With the `follow` feature, `Follow` watches both folders and gives the policy each time it changes.

`cargo test` here covers merging files in name order, which folder wins, which file decides each value, the problems a file is checked for and following the folders as files and folders come and go.
