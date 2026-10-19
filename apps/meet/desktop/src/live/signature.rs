use minisign_verify::{PublicKey, Signature};

pub const PUBLIC_KEY: Option<&str> = None;

pub fn verify(key: &str, checksum: &str, signature: &str, iso: &str) -> Result<(), String> {
    let key = PublicKey::from_base64(key).map_err(|error| error.to_string())?;
    let signature = Signature::decode(signature)
        .map_err(|_| format!("The signature of {iso} isn't readable"))?;
    key.verify(checksum.as_bytes(), &signature, false)
        .map_err(|_| format!("{iso} isn't signed by Lantharos"))?;
    if signature.trusted_comment() != iso {
        return Err(format!(
            "The signature is for {}, not {iso}",
            signature.trusted_comment()
        ));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    const KEY: &str = "RWQuKaSbHEMaG0cGBcTRjFj81Fysjto7YETokGzKqzy6t4/CiyKPriyV";
    const CHECKSUM: &str =
        "abababababababababababababababababababababababababababababababab  luft-nightly.iso\n";
    const SIGNATURE: &str = "untrusted comment: signature from minisign secret key
RUQuKaSbHEMaG/KmgbmEw89fyU8DE17aeEOfgCw57XUYR1yL4R+9DunaqCbrGKaW1NutLYt6lMJyq9hyk1muRqg22Cg/XdSomQA=
trusted comment: luft-nightly.iso
JCQZBxZqqVLpiZJl6sUpx1LdPjFjE3wulhRDfxAb6+JtXG5zKUrcSQkAK+e7MX7EY1q2o4PXFAqoPpvL/eUyCw==
";

    #[test]
    fn a_checksum_counts_only_when_signed_for_that_iso() {
        assert_eq!(verify(KEY, CHECKSUM, SIGNATURE, "luft-nightly.iso"), Ok(()));
        assert!(verify(KEY, CHECKSUM, SIGNATURE, "luft-latest.iso").is_err());
        let changed = CHECKSUM.replacen('a', "c", 1);
        assert!(verify(KEY, &changed, SIGNATURE, "luft-nightly.iso").is_err());
    }
}
