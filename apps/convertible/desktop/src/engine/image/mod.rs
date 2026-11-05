pub mod decode;
pub mod edit;
pub mod encode;
mod fit;
pub mod gif;
pub mod marks;
pub mod proxy;

use std::fs::{self, File};
use std::io::BufWriter;
use std::path::Path;

use image::{DynamicImage, RgbaImage};

use self::decode::{Decoded, Metadata};
use self::encode::Settings;
use super::Progress;
use super::error::Result;
use super::formats::Format;
use super::job::{Edits, Job, Options};

fn kept_metadata(decoded: Metadata, job: &Job) -> Metadata {
    if !job.options.keep_metadata {
        return Metadata::default();
    }
    let exif = if job.edits.hides_content() {
        None
    } else {
        decoded.exif
    };
    Metadata {
        icc: decoded.icc,
        exif: exif.map(without_orientation),
    }
}

fn without_orientation(mut exif: Vec<u8>) -> Vec<u8> {
    const ORIENTATION: u16 = 0x0112;
    const NORMAL: u16 = 1;
    let big_endian = exif.starts_with(b"MM");
    let read16 = |bytes: &[u8]| {
        let pair = [bytes[0], bytes[1]];
        if big_endian {
            u16::from_be_bytes(pair)
        } else {
            u16::from_le_bytes(pair)
        }
    };
    if exif.len() < 10 {
        return exif;
    }
    let raw = [exif[4], exif[5], exif[6], exif[7]];
    let directory = if big_endian {
        u32::from_be_bytes(raw)
    } else {
        u32::from_le_bytes(raw)
    } as usize;
    let Some(count) = exif.get(directory..directory + 2).map(read16) else {
        return exif;
    };
    for entry in 0..usize::from(count) {
        let start = directory + 2 + entry * 12;
        let Some(tag) = exif.get(start..start + 2).map(read16) else {
            break;
        };
        if tag == ORIENTATION && start + 10 <= exif.len() {
            let value = if big_endian {
                NORMAL.to_be_bytes()
            } else {
                NORMAL.to_le_bytes()
            };
            exif[start + 8..start + 10].copy_from_slice(&value);
        }
    }
    exif
}

fn encoded(image: &DynamicImage, job: &Job) -> Result<Vec<u8>> {
    let settings = Settings {
        quality: job.options.quality,
        lossless: job.options.lossless,
    };
    match job.options.target_bytes {
        Some(target) => fit::to_size(image, &job.format, job.options.quality, target),
        None => encode::encode(image, &job.format, &settings),
    }
}

pub fn convert(job: &Job, source: &Format, progress: &Progress) -> Result<()> {
    if source.id == "gif" && job.format == "gif" {
        return animated(job, progress);
    }
    let Decoded { image, metadata } = decode::decode(&job.inputs[0], source)?;
    progress.report(0.4);
    let image = edit::apply(image, &job.edits, &job.options)?;
    progress.report(0.6);
    let bytes = encoded(&image, job)?;
    progress.report(0.9);
    let bytes = encode::embed(bytes, &job.format, &kept_metadata(metadata, job));
    fs::write(&job.temp, bytes)?;
    Ok(())
}

fn frame_buffer(frame: RgbaImage, edits: &Edits, options: &Options) -> Result<RgbaImage> {
    Ok(edit::apply(DynamicImage::ImageRgba8(frame), edits, options)?.into_rgba8())
}

fn animated(job: &Job, progress: &Progress) -> Result<()> {
    let total = decode::gif_frames(&job.inputs[0])?
        .map_while(std::result::Result::ok)
        .count()
        .max(1);
    let mut writer = None;
    for (index, frame) in decode::gif_frames(&job.inputs[0])?.enumerate() {
        let frame = frame.map_err(super::error::Failure::damaged)?;
        let (numerator, denominator) = frame.delay().numer_denom_ms();
        let delay = numerator / denominator.max(1);
        let pixels = frame_buffer(frame.into_buffer(), &job.edits, &job.options)?;
        let (width, height) = (pixels.width() as u16, pixels.height() as u16);
        let writer = match &mut writer {
            Some(writer) => writer,
            empty => empty.insert(gif::Writer::new(
                BufWriter::new(File::create(&job.temp)?),
                width,
                height,
            )?),
        };
        writer.push(&pixels, width, height, delay)?;
        progress.report((index + 1) as f32 / total as f32);
    }
    Ok(())
}

pub fn memory_estimate(path: &Path, format: &Format) -> u64 {
    const BYTES_PER_PIXEL: u64 = 8;
    decode::dimensions(path).map_or(1 << 28, |(width, height)| {
        let frames = if format.id == "gif" { 2 } else { 1 };
        u64::from(width) * u64::from(height) * BYTES_PER_PIXEL * frames
    })
}
