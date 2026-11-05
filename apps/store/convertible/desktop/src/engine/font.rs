use std::fs::{self, File};
use std::io::{Read, Write};
use std::path::Path;

use flate2::Compression;
use flate2::write::ZlibEncoder;

use super::error::{Failure, Result};
use super::job::Job;
use crate::l10n::L10N;
use luft_i18n::t;

const TRUETYPE: [u8; 4] = [0, 1, 0, 0];
const OPENTYPE: &[u8; 4] = b"OTTO";
const COLLECTION: &[u8; 4] = b"ttcf";
const WOFF: &[u8; 4] = b"wOFF";
const WOFF2: &[u8; 4] = b"wOF2";
const WOFF_HEADER: usize = 44;
const WOFF_ENTRY: usize = 20;
const SFNT_ENTRY: usize = 16;
const SFNT_HEADER: usize = 12;

fn read_u32(data: &[u8], at: usize) -> Result<u32> {
    let bytes = data
        .get(at..at + 4)
        .ok_or_else(|| Failure::damaged("font table"))?;
    Ok(u32::from_be_bytes([bytes[0], bytes[1], bytes[2], bytes[3]]))
}

fn read_u16(data: &[u8], at: usize) -> Result<u16> {
    let bytes = data
        .get(at..at + 2)
        .ok_or_else(|| Failure::damaged("font table"))?;
    Ok(u16::from_be_bytes([bytes[0], bytes[1]]))
}

fn to_sfnt(data: &[u8]) -> Result<Vec<u8>> {
    match data.get(..4) {
        Some(magic) if magic == WOFF => {
            wuff::decompress_woff1(data).map_err(|error| Failure::damaged(format!("{error:?}")))
        }
        Some(magic) if magic == WOFF2 => {
            wuff::decompress_woff2(data).map_err(|error| Failure::damaged(format!("{error:?}")))
        }
        _ => Ok(data.to_vec()),
    }
}

pub fn outlines(path: &Path) -> Option<&'static str> {
    let mut header = [0; 8];
    File::open(path).ok()?.read_exact(&mut header).ok()?;
    let compressed = header.starts_with(WOFF) || header.starts_with(WOFF2);
    let flavor = if compressed {
        &header[4..8]
    } else {
        &header[..4]
    };
    match flavor {
        flavor if flavor == TRUETYPE => Some("ttf"),
        flavor if flavor == OPENTYPE => Some("otf"),
        _ => None,
    }
}

fn to_woff(sfnt: &[u8]) -> Result<Vec<u8>> {
    let tables = usize::from(read_u16(sfnt, 4)?);
    let mut directory = Vec::with_capacity(tables * WOFF_ENTRY);
    let mut bodies = Vec::new();
    let mut total = SFNT_HEADER + tables * SFNT_ENTRY;
    let mut offset = WOFF_HEADER + tables * WOFF_ENTRY;
    for index in 0..tables {
        let entry = SFNT_HEADER + index * SFNT_ENTRY;
        let (start, length) = (
            read_u32(sfnt, entry + 8)? as usize,
            read_u32(sfnt, entry + 12)? as usize,
        );
        let table = sfnt
            .get(start..start + length)
            .ok_or_else(|| Failure::damaged("font table"))?;
        let mut encoder = ZlibEncoder::new(Vec::new(), Compression::best());
        encoder.write_all(table)?;
        let packed = encoder.finish()?;
        let stored = if packed.len() < length {
            &packed[..]
        } else {
            table
        };
        directory.extend_from_slice(&sfnt[entry..entry + 4]);
        directory.extend_from_slice(&(offset as u32).to_be_bytes());
        directory.extend_from_slice(&(stored.len() as u32).to_be_bytes());
        directory.extend_from_slice(&(length as u32).to_be_bytes());
        directory.extend_from_slice(&sfnt[entry + 4..entry + 8]);
        bodies.extend_from_slice(stored);
        let padded = stored.len().next_multiple_of(4);
        bodies.resize(bodies.len() + padded - stored.len(), 0);
        offset += padded;
        total += length.next_multiple_of(4);
    }
    let mut out = Vec::with_capacity(offset);
    out.extend_from_slice(WOFF);
    out.extend_from_slice(&sfnt[..4]);
    out.extend_from_slice(&(offset as u32).to_be_bytes());
    out.extend_from_slice(&(tables as u16).to_be_bytes());
    out.extend_from_slice(&0u16.to_be_bytes());
    out.extend_from_slice(&(total as u32).to_be_bytes());
    out.extend_from_slice(&[0; 24]);
    out.extend_from_slice(&directory);
    out.extend_from_slice(&bodies);
    Ok(out)
}

fn to_woff2(sfnt: &[u8]) -> Result<Vec<u8>> {
    ttf2woff2::encode(sfnt, ttf2woff2::BrotliQuality::default())
        .map_err(|error| Failure::damaged(format!("{error:?}")))
}

pub fn convert(job: &Job) -> Result<()> {
    let data = fs::read(&job.inputs[0])?;
    let sfnt = to_sfnt(&data)?;
    let outlines = sfnt.get(..4).ok_or_else(|| Failure::damaged("font"))?;
    if outlines == COLLECTION {
        return Err(Failure::new(t!(L10N, "failure-font-collection")));
    }
    let bytes = match job.format.as_str() {
        "woff" => to_woff(&sfnt)?,
        "woff2" => to_woff2(&sfnt)?,
        "ttf" if outlines == TRUETYPE => sfnt,
        "otf" if outlines == OPENTYPE => sfnt,
        other => {
            return Err(Failure::new(t!(
                L10N,
                "failure-font-outlines",
                format = other.to_owned()
            )));
        }
    };
    fs::write(&job.temp, bytes)?;
    Ok(())
}
