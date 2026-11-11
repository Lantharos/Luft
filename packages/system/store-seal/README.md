# luft-store-seal

Checks schelf.store's signatures on its documents, shared by Schelf and the system packages service: the store's keys against the root key built in, each document against those keys, and the path and expiry a document was signed with. It also reads from an extension's signed listing whether a release may run inside Luft: only when the publisher is verified and the store marked that release `runs_in_shell`.

```toml
luft-store-seal.workspace = true
```
