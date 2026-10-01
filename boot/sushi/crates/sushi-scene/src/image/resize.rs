use alloc::vec;
use alloc::vec::Vec;

use tiny_skia::Pixmap;

struct Tap {
    first: usize,
    weights: Vec<f32>,
}

fn shrinking(from: u32, index: u32, scale: f32) -> Tap {
    let start = index as f32 * scale;
    let end = start + scale;
    let first = libm::floorf(start) as usize;
    let last = (libm::ceilf(end) as usize).min(from as usize);
    let weights = (first..last)
        .map(|source| (end.min(source as f32 + 1.0) - start.max(source as f32)) / scale)
        .collect();
    Tap { first, weights }
}

fn growing(from: u32, index: u32, scale: f32) -> Tap {
    let center = ((index as f32 + 0.5) * scale - 0.5).clamp(0.0, (from - 1) as f32);
    let first = libm::floorf(center) as usize;
    let fraction = center - first as f32;
    let weights = if first + 1 < from as usize {
        vec![1.0 - fraction, fraction]
    } else {
        vec![1.0]
    };
    Tap { first, weights }
}

fn taps(from: u32, to: u32) -> Vec<Tap> {
    let scale = from as f32 / to as f32;
    (0..to)
        .map(|index| {
            if scale > 1.0 {
                shrinking(from, index, scale)
            } else {
                growing(from, index, scale)
            }
        })
        .collect()
}

fn accumulate(sum: &mut [f32; 4], pixel: &[f32; 4], weight: f32) {
    for (total, channel) in sum.iter_mut().zip(pixel) {
        *total += channel * weight;
    }
}

/// Scales an image by averaging the pixels each target pixel covers, so shrinking doesn't alias.
pub fn resized(source: &Pixmap, width: u32, height: u32) -> Option<Pixmap> {
    let columns = taps(source.width(), width);
    let rows = taps(source.height(), height);
    let row_length = width as usize;

    let mut across = vec![[0.0f32; 4]; source.height() as usize * row_length];
    let source_rows = source.data().as_chunks::<4>().0;
    for (row, target) in source_rows
        .chunks_exact(source.width() as usize)
        .zip(across.chunks_exact_mut(row_length))
    {
        for (tap, sum) in columns.iter().zip(target) {
            for (pixel, weight) in row[tap.first..].iter().zip(&tap.weights) {
                accumulate(sum, &pixel.map(f32::from), *weight);
            }
        }
    }

    let mut pixmap = Pixmap::new(width, height)?;
    for (tap, target) in rows.iter().zip(
        pixmap
            .data_mut()
            .as_chunks_mut::<4>()
            .0
            .chunks_exact_mut(row_length),
    ) {
        for (x, out) in target.iter_mut().enumerate() {
            let mut sum = [0.0f32; 4];
            for (row, weight) in across[tap.first * row_length..]
                .chunks_exact(row_length)
                .zip(&tap.weights)
            {
                accumulate(&mut sum, &row[x], *weight);
            }
            *out = sum.map(|channel| libm::roundf(channel).clamp(0.0, 255.0) as u8);
        }
    }
    Some(pixmap)
}
