use std::ops::Range;
use std::path::Path;

use super::super::elf::{self, Section};
use crate::openpgp;

const SIGNATURE: &str = ".sha256_sig";
const KEY: &str = ".sig_key";

pub struct Signed {
    pub unsigned: Vec<Range<u64>>,
    signature: Vec<u8>,
}

pub fn key(path: &Path) -> Option<Vec<u8>> {
    elf::section_bytes(path, &elf::sections(path)?, KEY)
}

fn range(sections: &[Section], name: &str) -> Option<Range<u64>> {
    sections
        .iter()
        .find(|section| section.name == name)?
        .range()
}

pub fn signed(path: &Path) -> Option<Signed> {
    let sections = elf::sections(path)?;
    Some(Signed {
        unsigned: vec![range(&sections, SIGNATURE)?, range(&sections, KEY)?],
        signature: elf::section_bytes(path, &sections, SIGNATURE)?,
    })
}

pub fn verify(key: &[u8], signed: &Signed, digest: &str) -> Result<(), String> {
    match openpgp::signed_by(key, &signed.signature, digest.as_bytes()) {
        Some(true) => Ok(()),
        Some(false) => Err("The update isn't signed by this app's publisher.".into()),
        None => Err("The update's signature couldn't be checked.".into()),
    }
}
