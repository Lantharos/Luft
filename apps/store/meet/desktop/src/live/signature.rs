use luft_i18n::t;
use minisign_verify::{PublicKey, Signature};

use crate::L10N;

pub const PUBLIC_KEY: &str = "RWRz9rCK/H8Drrze/f851hxNNOH/D42kpyTMpXV7DT7QoUdCZySZwRWA";

pub const POINTER_KEY: &str = "RWSSHST0z1YZO+QgV4e4VExvDhYScMaIfgItjSIJ6Dh8wrbIiNxCfsr1";

pub fn verify_pointer(
    key: &str,
    pointer: &str,
    signature: &str,
    place: &str,
) -> Result<(), String> {
    let key = PublicKey::from_base64(key).map_err(|error| error.to_string())?;
    let signature =
        Signature::decode(signature).map_err(|_| t!(L10N, "live-pointer-not-signed"))?;
    key.verify(pointer.as_bytes(), &signature, false)
        .map_err(|_| t!(L10N, "live-pointer-not-signed"))?;
    if signature.trusted_comment() != place {
        return Err(t!(L10N, "live-pointer-not-signed"));
    }
    Ok(())
}

pub fn verify(key: &str, checksum: &str, signature: &str, iso: &str) -> Result<(), String> {
    let key = PublicKey::from_base64(key).map_err(|error| error.to_string())?;
    let signature = Signature::decode(signature)
        .map_err(|_| t!(L10N, "live-signature-unreadable", iso = iso))?;
    key.verify(checksum.as_bytes(), &signature, false)
        .map_err(|_| t!(L10N, "live-signature-wrong-key", iso = iso))?;
    if signature.trusted_comment() != iso {
        return Err(t!(
            L10N,
            "live-signature-other-iso",
            signed = signature.trusted_comment(),
            iso = iso
        ));
    }
    Ok(())
}

#[cfg(test)]
pub mod signed {
    pub const KEY: &str = "RWQuKaSbHEMaG0cGBcTRjFj81Fysjto7YETokGzKqzy6t4/CiyKPriyV";
    pub const POINTER_KEY: &str = "RWRsLdcDouXSg6w+Wpr7Za1c0Owl2mEnl9JC6zASsZw8bU1MBteTWUxF";
    pub const POINTER: &str = r#"{"name": "luft-nightly.iso", "version": "1.1-nightly.21", "size": 4096, "sha256": "abababababababababababababababababababababababababababababababab"}"#;
    pub const NIGHTLY_POINTER_SIGNATURE: &str =
        "untrusted comment: signature from minisign secret key
RURsLdcDouXSg8LofLlu+rjVEz/zt0T73Kbc23l87LwXBsXKT4k1SxzpmPdsMfmezjP0dPKXc2Tg+jYY4QSL3WY3zqugjB2YzAc=
trusted comment: nightly/latest.json
3Wuz993/2rIxDbIlZ0mh6jaiqy9ul07NGxPp4bPwCnwWird0xmOhLx83TVXSYOEUGvO6FQoKmw+bhtWcQRYZCw==
";
    pub const RELEASE_POINTER_SIGNATURE: &str =
        "untrusted comment: signature from minisign secret key
RURsLdcDouXSg8LofLlu+rjVEz/zt0T73Kbc23l87LwXBsXKT4k1SxzpmPdsMfmezjP0dPKXc2Tg+jYY4QSL3WY3zqugjB2YzAc=
trusted comment: 1/latest.json
42yTqoI3ePR6duulQRfbz6z+Px4MYHrwu1UCpo2SGsAtfcDfuHnCq1JUelKmZ7QPM+6KSaG4sB3OcmO3jAKYBA==
";
    pub const CHECKSUM: &str =
        "abababababababababababababababababababababababababababababababab  luft-nightly.iso\n";
    pub const SIGNATURE: &str = "untrusted comment: signature from minisign secret key
RUQuKaSbHEMaG/KmgbmEw89fyU8DE17aeEOfgCw57XUYR1yL4R+9DunaqCbrGKaW1NutLYt6lMJyq9hyk1muRqg22Cg/XdSomQA=
trusted comment: luft-nightly.iso
JCQZBxZqqVLpiZJl6sUpx1LdPjFjE3wulhRDfxAb6+JtXG5zKUrcSQkAK+e7MX7EY1q2o4PXFAqoPpvL/eUyCw==
";
}

#[cfg(test)]
mod tests {
    use super::signed::{CHECKSUM, KEY, SIGNATURE};
    use super::*;

    #[test]
    fn a_checksum_counts_only_when_signed_for_that_iso() {
        assert_eq!(verify(KEY, CHECKSUM, SIGNATURE, "luft-nightly.iso"), Ok(()));
        assert!(verify(KEY, CHECKSUM, SIGNATURE, "luft-latest.iso").is_err());
        let changed = CHECKSUM.replacen('a', "c", 1);
        assert!(verify(KEY, &changed, SIGNATURE, "luft-nightly.iso").is_err());
    }
}
