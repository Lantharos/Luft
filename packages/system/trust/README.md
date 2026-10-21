# luft-trust

Calls to trustd, Luft's security service, shared by Disks, Settings and Install Luft. Errors come back as sentences in the person's language.

```toml
luft-trust.workspace = true
```

`TRUST` and `DRIVES` are the service's two interfaces. `call` runs a method, `unlocking` runs one that may need a passphrase or recovery key and answers `Outcome::WrongKey` when the one given doesn't fit, and `checks` asks whether this computer is ready for device encryption.
