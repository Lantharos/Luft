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
const LENGTH: usize = 4;

pub struct PublicKey {
    pub kind: String,
    pub comment: String,
    blob: Vec<u8>,
}

fn names_kind(blob: &[u8], kind: &str) -> bool {
    let Some((length, rest)) = blob.split_first_chunk::<LENGTH>() else {
        return false;
    };
    let length = u32::from_be_bytes(*length) as usize;
    rest.get(..length) == Some(kind.as_bytes()) && rest.len() > length
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
