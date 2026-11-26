use std::path::Path;
use std::sync::Mutex;
use std::sync::atomic::{AtomicUsize, Ordering};

use ort::session::Session;

use super::infer::{UNIT_DEVIATION, UNIT_MEAN, cores, first_output, session, tensor};
use super::pixels::{interleaved, planar, resize};
use crate::files::failed;

const TILE: usize = 256;
const MODEL_FACTOR: usize = 4;
const OVERLAP: usize = 16;
const MOST_WORKERS: usize = 4;

struct Patch {
    left: usize,
    top: usize,
    width: usize,
    height: usize,
    keep_left: usize,
    keep_top: usize,
    keep_right: usize,
    keep_bottom: usize,
}

struct Picture<'a> {
    rgba: &'a [u8],
    width: usize,
    factor: usize,
}

fn patches(width: usize, height: usize) -> Vec<Patch> {
    let step = TILE - OVERLAP * 2;
    let mut patches = Vec::new();
    for row in 0..height.div_ceil(step) {
        for col in 0..width.div_ceil(step) {
            let left = (col * step).saturating_sub(OVERLAP);
            let top = (row * step).saturating_sub(OVERLAP);
            patches.push(Patch {
                left,
                top,
                width: (col * step + step + OVERLAP).min(width) - left,
                height: (row * step + step + OVERLAP).min(height) - top,
                keep_left: col * step - left,
                keep_top: row * step - top,
                keep_right: (col * step + step).min(width) - left,
                keep_bottom: (row * step + step).min(height) - top,
            });
        }
    }
    patches
}

fn enlarge(session: &mut Session, picture: &Picture, patch: &Patch) -> Result<Vec<u8>, String> {
    let factor = picture.factor;
    let mut tile = Vec::with_capacity(patch.width * patch.height * 4);
    for y in patch.top..patch.top + patch.height {
        let row = y * picture.width;
        tile.extend_from_slice(
            &picture.rgba[(row + patch.left) * 4..(row + patch.left + patch.width) * 4],
        );
    }
    let name = session.inputs()[0].name().to_string();
    let input = tensor(
        [1, 3, patch.height, patch.width],
        planar(&tile, patch.width, patch.height, UNIT_MEAN, UNIT_DEVIATION),
    )?;
    let (_, values) = first_output(session, vec![(name.as_str(), input)])?;
    let (model_width, model_height) = (patch.width * MODEL_FACTOR, patch.height * MODEL_FACTOR);
    let alpha: Vec<u8> = (0..model_width * model_height)
        .map(|index| {
            let (y, x) = (index / model_width, index % model_width);
            tile[((y / MODEL_FACTOR) * patch.width + x / MODEL_FACTOR) * 4 + 3]
        })
        .collect();
    let (out_width, out_height) = (patch.width * factor, patch.height * factor);
    let painted = resize(
        &interleaved(&values, model_width, model_height, 255.0, &alpha),
        (model_width as u32, model_height as u32),
        (out_width as u32, out_height as u32),
        4,
    )?;
    let span = (patch.keep_right - patch.keep_left) * factor * 4;
    let mut kept = Vec::with_capacity(span * (patch.keep_bottom - patch.keep_top) * factor);
    for y in patch.keep_top * factor..patch.keep_bottom * factor {
        let from = (y * out_width + patch.keep_left * factor) * 4;
        kept.extend_from_slice(&painted[from..from + span]);
    }
    Ok(kept)
}

fn place(out: &mut [u8], picture: &Picture, patch: &Patch, kept: &[u8]) {
    let factor = picture.factor;
    let out_width = picture.width * factor;
    let span = (patch.keep_right - patch.keep_left) * factor * 4;
    let left = (patch.left + patch.keep_left) * factor;
    let top = (patch.top + patch.keep_top) * factor;
    for (row, line) in kept.chunks_exact(span).enumerate() {
        let target = ((top + row) * out_width + left) * 4;
        out[target..target + span].copy_from_slice(line);
    }
}

pub fn upscale(
    model: &Path,
    rgba: &[u8],
    size: (u32, u32),
    factor: usize,
    progress: &(dyn Fn(f64) + Sync),
) -> Result<Vec<u8>, String> {
    let (width, height) = (size.0 as usize, size.1 as usize);
    let picture = Picture {
        rgba,
        width,
        factor,
    };
    let patches = patches(width, height);
    let workers = (cores() / 4).clamp(1, MOST_WORKERS).min(patches.len());
    let threads = (cores() / 2 / workers).max(1);
    let out = Mutex::new(vec![0u8; width * factor * height * factor * 4]);
    let next = AtomicUsize::new(0);
    let done = AtomicUsize::new(0);
    std::thread::scope(|scope| {
        let handles: Vec<_> = (0..workers)
            .map(|_| {
                scope.spawn(|| -> Result<(), String> {
                    let mut session = session(model, threads)?;
                    loop {
                        let index = next.fetch_add(1, Ordering::Relaxed);
                        let Some(patch) = patches.get(index) else {
                            return Ok(());
                        };
                        let kept = enlarge(&mut session, &picture, patch)?;
                        place(&mut out.lock().map_err(failed)?, &picture, patch, &kept);
                        let finished = done.fetch_add(1, Ordering::Relaxed) + 1;
                        progress(finished as f64 / patches.len() as f64);
                    }
                })
            })
            .collect();
        handles.into_iter().try_for_each(|handle| {
            handle
                .join()
                .unwrap_or_else(|panic| std::panic::resume_unwind(panic))
        })
    })?;
    out.into_inner().map_err(failed)
}
