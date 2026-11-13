use std::collections::{BTreeMap, BTreeSet};

use base64::prelude::{BASE64_STANDARD, Engine};
use serde::Deserialize;
use sha2::{Digest, Sha256};

const SIGNATURE: &str = "/run/systemd/tpm2-pcr-signature.json";
const SEQUENCE: u8 = 0x30;
const BIT_STRING: u8 = 0x03;

#[derive(Deserialize)]
struct Signature {
    pkfp: String,
}

fn element(der: &[u8]) -> Option<(u8, &[u8], &[u8])> {
    let (&tag, rest) = der.split_first()?;
    let (&first, rest) = rest.split_first()?;
    let (length, rest) = if first < 0x80 {
        (usize::from(first), rest)
    } else {
        let count = usize::from(first & 0x7f);
        let (bytes, rest) = rest.split_at_checked(count)?;
        let length = bytes.iter().try_fold(0usize, |length, byte| {
            length.checked_mul(256)?.checked_add(usize::from(*byte))
        })?;
        (length, rest)
    };
    let (content, rest) = rest.split_at_checked(length)?;
    Some((tag, content, rest))
}

fn public_key_bits(spki: &[u8]) -> Option<&[u8]> {
    let (SEQUENCE, fields, _) = element(spki)? else {
        return None;
    };
    let (_, _, after_algorithm) = element(fields)?;
    let (BIT_STRING, bits, _) = element(after_algorithm)? else {
        return None;
    };
    bits.get(1..)
}

pub fn fingerprint(token_key: &str) -> Option<String> {
    let pem = BASE64_STANDARD.decode(token_key).ok()?;
    let body: String = std::str::from_utf8(&pem)
        .ok()?
        .lines()
        .filter(|line| !line.starts_with("-----"))
        .collect();
    let spki = BASE64_STANDARD.decode(body).ok()?;
    Some(
        Sha256::digest(public_key_bits(&spki)?)
            .iter()
            .map(|byte| format!("{byte:02x}"))
            .collect(),
    )
}

fn signing_this_start() -> BTreeSet<String> {
    std::fs::read(SIGNATURE)
        .ok()
        .and_then(|json| serde_json::from_slice::<BTreeMap<String, Vec<Signature>>>(&json).ok())
        .into_iter()
        .flat_map(BTreeMap::into_values)
        .flatten()
        .map(|signature| signature.pkfp)
        .collect()
}

pub fn this_start_is_signed_with_none_of(keys: &[String]) -> bool {
    let signing = signing_this_start();
    !keys.is_empty() && !signing.is_empty() && keys.iter().all(|key| !signing.contains(key))
}

#[cfg(test)]
mod tests {
    use super::fingerprint;

    #[test]
    fn names_a_token_key_the_way_pcr_signatures_do() {
        let token = "LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUF2SGc2M3Y5WHpQMjJyT0tsK05IagpOWktyaE1zdUxSVDc0aVdaNTZ5aEcyODJ5aW5DUGpDcTI5ZkpYdUY2TXJCQ0szOGU1WVg4YTFvaFVGRUVuenpvCnRDckdyZWtrQ3VJcWdndzVBRTA3RkUrNEc4WWpndXRWL0szU1RaVXNlUjVBMjFQRllPT0JpMThwZjB0alAxcnMKL2JiTmE5R1ZmVDluOVFjWWFhb1NhQjBOUnZzS29GejczR0s3YjVvNnJhb3plSFNwUXRLT0o0Tjd2ZnhWeFVidgo5NkdKWXlhMlltS09oVlVSQVFsbFhFa1RRVmJHRmVSRGpqVWdNYm02QXI5c2lCdnlNNDZaem1Ia2dQeGFuekZWClZ3cSt3dHlwc2JzNUx3anVMcFRuU043NjNuNHVsbldyOTI0TVZJSE1SOWNpb2NDVUNzRFhnVzFzeUxRby9HRTIKR3dJREFRQUIKLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tCg==";
        assert_eq!(
            fingerprint(token).as_deref(),
            Some("71458495c27e17cf131e6f26ea6746630d82d61562fd2757007fbec98e7035d8")
        );
    }
}
