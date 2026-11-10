use std::fs::File;
use std::io::BufReader;

use anyhow::{Context, Result, bail};
use ogg::PacketReader;
use opus::{Channels, Decoder};

pub const RATE: usize = 48_000;
const PER_MILLISECOND: usize = RATE / 1000;
const WARM_UP: usize = 80 * PER_MILLISECOND;
const LONGEST_PACKET: usize = 120 * PER_MILLISECOND;

pub struct Stretch {
    pub samples: Vec<f32>,
    pub last: bool,
}

pub fn decode(file: File, from: u64, until: u64) -> Result<Stretch> {
    let mut reader = PacketReader::new(BufReader::new(file));
    let head = reader
        .read_packet()?
        .context("The recording is empty")?
        .data;
    if !head.starts_with(b"OpusHead") || head.len() < 19 {
        bail!("The recording isn't Ogg Opus");
    }
    if head[9] != 1 {
        bail!("The recording isn't mono");
    }
    let pre_skip = usize::from(u16::from_le_bytes([head[10], head[11]]));
    reader.read_packet()?.context("The recording has no tags")?;
    let first = from as usize * PER_MILLISECOND + pre_skip;
    let last = until as usize * PER_MILLISECOND + pre_skip;
    let mut decoder = Decoder::new(RATE as u32, Channels::Mono)?;
    let mut buffer = vec![0.0; LONGEST_PACKET];
    let mut samples = Vec::new();
    let mut position = 0;
    while let Ok(Some(packet)) = reader.read_packet() {
        let length = opus::packet::get_nb_samples(&packet.data, RATE as u32)?;
        let end = position + length;
        if end + WARM_UP >= first {
            let decoded = decoder.decode_float(&packet.data, &mut buffer, false)?;
            if end > first {
                let skip = first.saturating_sub(position);
                samples.extend_from_slice(&buffer[skip.min(decoded)..decoded]);
            }
        }
        position = end;
        if position >= last {
            return Ok(Stretch {
                samples,
                last: false,
            });
        }
    }
    Ok(Stretch {
        samples,
        last: true,
    })
}
