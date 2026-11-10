use anyhow::{Context, Result, bail};

use super::RATE;

pub fn pcm16_mono(bytes: &[u8]) -> Result<Vec<f32>> {
    let field =
        |at: usize, len: usize| bytes.get(at..at + len).context("The WAV file is cut short");
    if field(0, 4)? != b"RIFF" || field(8, 4)? != b"WAVE" {
        bail!("Not a WAV file");
    }
    let mut at = 12;
    let mut format_ok = false;
    while at + 8 <= bytes.len() {
        let id = field(at, 4)?;
        let len = u32::from_le_bytes(field(at + 4, 4)?.try_into()?) as usize;
        let body = field(at + 8, len.min(bytes.len() - at - 8))?;
        if id == b"fmt " {
            let channels = u16::from_le_bytes(body[2..4].try_into()?);
            let rate = u32::from_le_bytes(body[4..8].try_into()?);
            let bits = u16::from_le_bytes(body[14..16].try_into()?);
            format_ok = channels == 1 && rate as usize == RATE && bits == 16;
        } else if id == b"data" {
            if !format_ok {
                bail!("The WAV file must be 16 kHz, mono, 16-bit");
            }
            return Ok(body
                .as_chunks::<2>()
                .0
                .iter()
                .map(|pair| f32::from(i16::from_le_bytes(*pair)) / 32768.0)
                .collect());
        }
        at += 8 + len + (len & 1);
    }
    bail!("The WAV file has no audio")
}
