use luft_i18n::t;
use rayon::prelude::*;

use super::TILE;
use crate::files::failed;
use crate::l10n::L10N;

const MAGIC: &[u8; 4] = b"ETIL";
const VERSION: u16 = 1;
const LEVEL: i32 = 2;
const HEADER: usize = 12;
const ENTRY: usize = 8;

pub struct Tile {
    pub index: u32,
    pub frame: Vec<u8>,
}

pub fn compress(indices: &[u32], raw: &[u8], tile_bytes: usize) -> Result<Vec<Tile>, String> {
    if raw.len() != indices.len() * tile_bytes {
        return Err(t!(L10N, "easel-error-tiles-short"));
    }
    indices
        .par_iter()
        .zip(raw.par_chunks(tile_bytes))
        .map(|(&index, pixels)| {
            zstd::bulk::compress(pixels, LEVEL)
                .map(|frame| Tile { index, frame })
                .map_err(failed)
        })
        .collect()
}

pub fn encode(tiles: &[Tile]) -> Vec<u8> {
    let frames: usize = tiles.iter().map(|tile| tile.frame.len()).sum();
    let mut out = Vec::with_capacity(HEADER + tiles.len() * ENTRY + frames);
    out.extend_from_slice(MAGIC);
    out.extend_from_slice(&VERSION.to_le_bytes());
    out.extend_from_slice(&(TILE as u16).to_le_bytes());
    out.extend_from_slice(&(tiles.len() as u32).to_le_bytes());
    for tile in tiles {
        out.extend_from_slice(&tile.index.to_le_bytes());
        out.extend_from_slice(&(tile.frame.len() as u32).to_le_bytes());
    }
    for tile in tiles {
        out.extend_from_slice(&tile.frame);
    }
    out
}

fn word(data: &[u8], at: usize) -> Result<u32, String> {
    data.get(at..at + 4)
        .map(|bytes| u32::from_le_bytes([bytes[0], bytes[1], bytes[2], bytes[3]]))
        .ok_or_else(|| t!(L10N, "easel-error-tiles-short"))
}

pub fn decode(data: &[u8], tile_bytes: usize) -> Result<(Vec<u32>, Vec<u8>), String> {
    if data.get(..4) != Some(MAGIC) || data.get(6..8) != Some(&(TILE as u16).to_le_bytes()) {
        return Err(t!(L10N, "easel-error-not-tiles"));
    }
    let count = word(data, 8)? as usize;
    let mut entries = Vec::with_capacity(count);
    let mut offset = HEADER + count * ENTRY;
    for slot in 0..count {
        let index = word(data, HEADER + slot * ENTRY)?;
        let length = word(data, HEADER + slot * ENTRY + 4)? as usize;
        let frame = data
            .get(offset..offset + length)
            .ok_or_else(|| t!(L10N, "easel-error-tiles-short"))?;
        entries.push((index, frame));
        offset += length;
    }
    let mut pixels = vec![0u8; count * tile_bytes];
    pixels
        .par_chunks_mut(tile_bytes)
        .zip(entries.par_iter())
        .try_for_each(|(target, (_, frame))| {
            zstd::bulk::decompress_to_buffer(frame, target)
                .map_err(failed)
                .and_then(|written| {
                    (written == tile_bytes)
                        .then_some(())
                        .ok_or_else(|| t!(L10N, "easel-error-tiles-short"))
                })
        })?;
    Ok((entries.iter().map(|(index, _)| *index).collect(), pixels))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn tiles_come_back_as_they_were_saved() {
        let tile_bytes = 64;
        let raw: Vec<u8> = (0..tile_bytes * 3)
            .map(|value| (value * 7 % 251) as u8)
            .collect();
        let tiles = compress(&[4, 9, 2], &raw, tile_bytes).unwrap();
        let (indices, pixels) = decode(&encode(&tiles), tile_bytes).unwrap();
        assert_eq!(indices, [4, 9, 2]);
        assert_eq!(pixels, raw);
    }
}
