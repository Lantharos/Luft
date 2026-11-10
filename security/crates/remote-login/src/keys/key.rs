use base64::Engine;
use base64::engine::general_purpose::{STANDARD, STANDARD_NO_PAD};
use sha2::{Digest, Sha256};

const KINDS: [&str; 7] = [
    "ssh-ed25519",
    "sk-ssh-ed25519@openssh.com",
    "ecdsa-sha2-nistp256",
    "ecdsa-sha2-nistp384",
    "ecdsa-sha2-nistp521",
    "sk-ecdsa-sha2-nistp256@openssh.com",
    "ssh-rsa",
];
const RSA: &str = "ssh-rsa";
const SHORTEST_RSA: usize = 2048;
const LENGTH: usize = 4;

pub struct PublicKey {
    pub kind: String,
    pub comment: String,
    blob: Vec<u8>,
}

fn names_kind(blob: &[u8], kind: &str) -> bool {
    field(blob).is_some_and(|(name, rest)| name == kind.as_bytes() && !rest.is_empty())
}

fn field(blob: &[u8]) -> Option<(&[u8], &[u8])> {
    let (length, rest) = blob.split_first_chunk::<LENGTH>()?;
    rest.split_at_checked(u32::from_be_bytes(*length) as usize)
}

fn rsa_bits(blob: &[u8]) -> Option<usize> {
    let (_, rest) = field(blob)?;
    let (_, rest) = field(rest)?;
    let (modulus, _) = field(rest)?;
    let leading = modulus.iter().position(|byte| *byte != 0)?;
    Some((modulus.len() - leading) * 8 - modulus[leading].leading_zeros() as usize)
}

impl PublicKey {
    pub fn parse(text: &str) -> Option<Self> {
        let mut fields = text.split_whitespace();
        let kind = fields.next().filter(|kind| KINDS.contains(kind))?;
        let blob = STANDARD.decode(fields.next()?).ok()?;
        names_kind(&blob, kind).then(|| Self {
            kind: kind.to_owned(),
            comment: fields.collect::<Vec<_>>().join(" "),
            blob,
        })
    }

    pub fn after_options(line: &str) -> Option<Self> {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') {
            return None;
        }
        [0].into_iter()
            .chain(
                line.match_indices(char::is_whitespace)
                    .map(|(at, _)| at + 1),
            )
            .find_map(|start| Self::parse(&line[start..]))
    }

    pub fn is_short(&self) -> bool {
        self.kind == RSA && rsa_bits(&self.blob).is_none_or(|bits| bits < SHORTEST_RSA)
    }

    pub fn fingerprint(&self) -> String {
        format!(
            "SHA256:{}",
            STANDARD_NO_PAD.encode(Sha256::digest(&self.blob))
        )
    }

    pub fn line(&self) -> String {
        let key = format!("{} {}", self.kind, STANDARD.encode(&self.blob));
        if self.comment.is_empty() {
            key
        } else {
            format!("{key} {}", self.comment)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn rsa(modulus: &[u8]) -> Vec<u8> {
        let mut blob = Vec::new();
        for part in [RSA.as_bytes(), &[1, 0, 1], modulus] {
            blob.extend_from_slice(&(part.len() as u32).to_be_bytes());
            blob.extend_from_slice(part);
        }
        blob
    }

    #[test]
    fn measures_an_rsa_key_by_its_modulus() {
        let mut modulus = vec![0u8; 385];
        modulus[1] = 0x80;
        assert_eq!(rsa_bits(&rsa(&modulus)), Some(3072));
        modulus[1] = 0x7f;
        assert_eq!(rsa_bits(&rsa(&modulus)), Some(3071));
        assert_eq!(rsa_bits(&rsa(&modulus)[..40]), None);
    }
}
