# luft-recovery-key

Recovery keys for Luft's encrypted disks, shared by trustd and Sushi. A key is twelve words from the BIP39 English list: 128 random bits and a 4-bit checksum. The disk's passphrase is the twelve words in lower case with single spaces between them.

```toml
luft-recovery-key.workspace = true
```

```rust
use luft_recovery_key::{Reading, read};

let key = luft_recovery_key::generate()?;
match read(b"lega winn thank year wave sausage worth useful legal winner thank yellow") {
    Reading::Key(passphrase) => {}  // the words spelled out, or an older key in its groups of eight
    Reading::Mistyped => {}         // twelve words whose checksum doesn't hold
    Reading::NotAKey => {}          // anything else, such as a passphrase
}
```

- Every word is unique in its first four letters, so `word` completes four or more letters, and takes a shorter word only when it's typed whole.
- Keys from before the words, 64 letters of `cbdefghijklnrtuv` in groups of eight, still read with or without their dashes and in any case.
- The word list is in `src/english.txt`; see [CREDITS](CREDITS).
