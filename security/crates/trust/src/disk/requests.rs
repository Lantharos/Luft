use std::io::ErrorKind;
use std::path::{Path, PathBuf};

use anyhow::{Context, Result};
use serde::de::DeserializeOwned;
use serde::{Deserialize, Serialize};

use super::SystemDisk;
use super::layout::TopLevel;
use crate::paths;
use crate::system::firmware::efi;
use crate::system::host::uuid;

const FOLDER: &str = "luft-next-start";

#[derive(Clone, Copy)]
pub struct Kind {
    file: &'static str,
    variable: &'static str,
}

pub const MOVE: Kind = Kind {
    file: "move.json",
    variable: "MovingSystemDisk",
};

pub const ENCRYPT: Kind = Kind {
    file: "encrypt.json",
    variable: "EncryptingSystemDisk",
};

#[derive(Serialize, Deserialize)]
struct Kept<T> {
    id: String,
    request: T,
}

pub struct Waiting<T> {
    pub request: T,
    pub mark: String,
    id: String,
}

fn file(top: &Path, kind: Kind) -> PathBuf {
    top.join(FOLDER).join(kind.file)
}

fn signal(kind: Kind) -> Option<(String, String)> {
    let signal = String::from_utf8(efi::luft_variable(kind.variable)?).ok()?;
    let (id, mark) = signal.split_once(' ').unwrap_or((&signal, ""));
    uuid::is_uuid(id).then(|| (id.to_owned(), mark.to_owned()))
}

pub fn keep<T: Serialize>(top: &Path, kind: Kind, request: &T) -> Result<()> {
    let kept = Kept {
        id: uuid::random()?,
        request,
    };
    paths::ensure_private(top.join(FOLDER))?;
    paths::write_private(&file(top, kind), &serde_json::to_vec(&kept)?)?;
    efi::set_luft_variable(kind.variable, Some(kept.id.as_bytes()))
        .context("The firmware didn't keep that something waits for the next start")
}

pub fn waiting_in<T: DeserializeOwned>(top: &Path, kind: Kind) -> Option<Waiting<T>> {
    let (id, mark) = signal(kind)?;
    let kept: Kept<T> = serde_json::from_slice(&std::fs::read(file(top, kind)).ok()?).ok()?;
    (kept.id == id).then_some(Waiting {
        request: kept.request,
        mark,
        id,
    })
}

pub fn waiting<T: DeserializeOwned>(disk: &SystemDisk, kind: Kind) -> Option<Waiting<T>> {
    signal(kind)?;
    waiting_in(TopLevel::look(disk).ok()?.path(), kind)
}

impl<T> Waiting<T> {
    pub fn mark(&self, kind: Kind, mark: &str) -> Result<()> {
        efi::set_luft_variable(
            kind.variable,
            Some(format!("{} {mark}", self.id).as_bytes()),
        )
        .context("The firmware didn't keep how far the request got")
    }
}

pub fn forget(top: &Path, kind: Kind) -> Result<()> {
    efi::set_luft_variable(kind.variable, None)
        .context("The firmware kept a request that's over")?;
    match std::fs::remove_file(file(top, kind)) {
        Err(error) if error.kind() != ErrorKind::NotFound => Err(error.into()),
        _ => Ok(()),
    }
}
