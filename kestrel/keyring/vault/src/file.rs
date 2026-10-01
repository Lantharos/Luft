use std::fs::{self, DirBuilder, File, OpenOptions};
use std::io::{ErrorKind, Read, Write};
use std::os::unix::fs::{DirBuilderExt, OpenOptionsExt};
use std::path::Path;

use serde::{Deserialize, Serialize};
use zeroize::Zeroizing;

use crate::{ChipWrap, Contents, Error, MasterKey, PasswordWrap, cipher};

const MAGIC: &[u8; 8] = b"LUFTKEYS";
const VERSION: u8 = 1;
const BODY_KEY: &str = "luft-keyring vault body";

#[derive(Debug, Default, Clone, Serialize, Deserialize)]
pub struct Header {
    #[serde(default)]
    pub password: Option<PasswordWrap>,
    #[serde(default)]
    pub chip: Option<ChipWrap>,
}

pub struct Stored {
    pub header: Header,
    preamble: Vec<u8>,
    body: Vec<u8>,
}

impl Stored {
    pub fn load(path: &Path) -> Result<Option<Self>, Error> {
        let mut bytes = Vec::new();
        match File::open(path) {
            Ok(mut file) => file.read_to_end(&mut bytes)?,
            Err(error) if error.kind() == ErrorKind::NotFound => return Ok(None),
            Err(error) => return Err(error.into()),
        };
        Self::parse(bytes).map(Some)
    }

    fn parse(mut bytes: Vec<u8>) -> Result<Self, Error> {
        if bytes.len() < MAGIC.len() + 5 || &bytes[..MAGIC.len()] != MAGIC {
            return Err(Error::Corrupt("not a Luft Keyring file"));
        }
        if bytes[MAGIC.len()] != VERSION {
            return Err(Error::Corrupt("written by a newer version"));
        }
        let length_at = MAGIC.len() + 1;
        let length = u32::from_le_bytes(
            bytes[length_at..length_at + 4]
                .try_into()
                .expect("four bytes"),
        ) as usize;
        let header_at = length_at + 4;
        let body_at = header_at
            .checked_add(length)
            .filter(|end| *end <= bytes.len())
            .ok_or(Error::Corrupt("truncated header"))?;
        let header = ciborium::from_reader(&bytes[header_at..body_at])
            .map_err(|_| Error::Corrupt("unreadable header"))?;
        let body = bytes.split_off(body_at);
        Ok(Self {
            header,
            preamble: bytes,
            body,
        })
    }

    pub fn open(&self, key: &MasterKey) -> Result<Contents, Error> {
        let plaintext = cipher::open(&key.derive(BODY_KEY), &self.body, &self.preamble)
            .ok_or(Error::WrongKey)?;
        ciborium::from_reader(plaintext.as_slice())
            .map_err(|_| Error::Corrupt("unreadable contents"))
    }

    pub fn save(
        path: &Path,
        header: &Header,
        key: &MasterKey,
        contents: &Contents,
    ) -> Result<(), Error> {
        let mut encoded_header = Vec::new();
        ciborium::into_writer(header, &mut encoded_header)
            .map_err(|_| Error::Corrupt("unencodable header"))?;
        let length =
            u32::try_from(encoded_header.len()).map_err(|_| Error::Corrupt("oversized header"))?;
        let mut preamble = Vec::with_capacity(MAGIC.len() + 5 + encoded_header.len());
        preamble.extend_from_slice(MAGIC);
        preamble.push(VERSION);
        preamble.extend_from_slice(&length.to_le_bytes());
        preamble.extend_from_slice(&encoded_header);

        let mut plaintext = Zeroizing::new(Vec::new());
        ciborium::into_writer(contents, &mut *plaintext)
            .map_err(|_| Error::Corrupt("unencodable contents"))?;
        let body = cipher::seal(&key.derive(BODY_KEY), &plaintext, &preamble);
        replace(path, &[&preamble, &body])
    }
}

pub(crate) fn replace(path: &Path, parts: &[&[u8]]) -> Result<(), Error> {
    let directory = path
        .parent()
        .ok_or(Error::Corrupt("the keyring has no folder"))?;
    DirBuilder::new()
        .recursive(true)
        .mode(0o700)
        .create(directory)?;
    let staging = path.with_extension("new");
    let mut file = OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(true)
        .mode(0o600)
        .open(&staging)?;
    for part in parts {
        file.write_all(part)?;
    }
    file.sync_all()?;
    fs::rename(&staging, path)?;
    File::open(directory)?.sync_all()?;
    Ok(())
}
