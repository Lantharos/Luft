use std::fs::{File, OpenOptions};
use std::io::{ErrorKind, Read, Write};
use std::os::unix::fs::OpenOptionsExt;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};

use crate::file::replace;
use crate::{Error, MasterKey, cipher};

const LOG_KEY: &str = "luft-keyring audit log";
const KEEP: usize = 2000;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Action {
    Read,
    Saved,
    Deleted,
    Denied,
    Signed,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Record {
    pub time: u64,
    pub app: String,
    pub app_name: String,
    pub action: Action,
    pub target: String,
}

pub struct AuditLog {
    path: PathBuf,
}

impl AuditLog {
    pub fn new(path: PathBuf) -> Self {
        Self { path }
    }

    pub fn append(&self, key: &MasterKey, record: &Record) -> Result<(), Error> {
        let frame = frame(key, record)?;
        let mut file = OpenOptions::new()
            .append(true)
            .create(true)
            .mode(0o600)
            .open(&self.path)?;
        file.write_all(&frame)?;
        Ok(())
    }

    pub fn read(&self, key: &MasterKey) -> Result<Vec<Record>, Error> {
        let mut bytes = Vec::new();
        match File::open(&self.path) {
            Ok(mut file) => file.read_to_end(&mut bytes)?,
            Err(error) if error.kind() == ErrorKind::NotFound => return Ok(Vec::new()),
            Err(error) => return Err(error.into()),
        };
        let log_key = key.derive(LOG_KEY);
        let mut records = Vec::new();
        let mut rest = bytes.as_slice();
        while rest.len() >= 4 {
            let length = u32::from_le_bytes(rest[..4].try_into().expect("four bytes")) as usize;
            let Some(sealed) = rest.get(4..4 + length) else {
                break;
            };
            if let Some(plaintext) = cipher::open(&log_key, sealed, LOG_KEY.as_bytes())
                && let Ok(record) = ciborium::from_reader(plaintext.as_slice())
            {
                records.push(record);
            }
            rest = &rest[4 + length..];
        }
        Ok(records)
    }

    pub fn trim(&self, key: &MasterKey) -> Result<(), Error> {
        let records = self.read(key)?;
        if records.len() <= KEEP + KEEP / 4 {
            return Ok(());
        }
        let frames = records[records.len() - KEEP..]
            .iter()
            .map(|record| frame(key, record))
            .collect::<Result<Vec<_>, _>>()?;
        replace(
            &self.path,
            &frames.iter().map(Vec::as_slice).collect::<Vec<_>>(),
        )
    }

    pub fn clear(&self) -> Result<(), Error> {
        match std::fs::remove_file(&self.path) {
            Err(error) if error.kind() != ErrorKind::NotFound => Err(error.into()),
            _ => Ok(()),
        }
    }
}

fn frame(key: &MasterKey, record: &Record) -> Result<Vec<u8>, Error> {
    let mut plaintext = Vec::new();
    ciborium::into_writer(record, &mut plaintext)
        .map_err(|_| Error::Corrupt("unencodable audit record"))?;
    let sealed = cipher::seal(&key.derive(LOG_KEY), &plaintext, LOG_KEY.as_bytes());
    let length =
        u32::try_from(sealed.len()).map_err(|_| Error::Corrupt("oversized audit record"))?;
    let mut frame = Vec::with_capacity(4 + sealed.len());
    frame.extend_from_slice(&length.to_le_bytes());
    frame.extend_from_slice(&sealed);
    Ok(frame)
}
