# luft-cups

A small IPP client for CUPS's local socket (`/run/cups/cups.sock`, or `CUPS_SERVER` when it names a socket), shared by `kestrel-settings` and `luft-printers`. It lists printers, jobs, devices and drivers, prints, creates CUPS's temporary driverless queues, and adds, keeps and removes queues. Every request names its sender with CUPS's `PeerCred` scheme, so CUPS checks the caller's own account.

```toml
luft-cups.workspace = true
```

`drivers` matches a printer's IEEE 1284 device ID against the drivers CUPS knows; `cargo test` covers that matching.
