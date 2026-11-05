use image::{DynamicImage, GenericImageView};

use super::edit;
use super::encode::{self, Settings, is_lossy};
use crate::engine::error::{Failure, Result};

const QUALITY_STEPS: u32 = 6;
const LOWEST_QUALITY: u8 = 4;
const HIGHEST_QUALITY: u8 = 96;
const SHRINK_TRIES: u32 = 10;
const SHRINK_MARGIN: f64 = 0.92;

fn best_quality(
    image: &DynamicImage,
    id: &str,
    target: u64,
    ceiling: u8,
) -> Result<Option<Vec<u8>>> {
    let (mut low, mut high) = (LOWEST_QUALITY, ceiling.min(HIGHEST_QUALITY));
    let mut best = None;
    for _ in 0..QUALITY_STEPS {
        if low > high {
            break;
        }
        let quality = low + (high - low) / 2;
        let encoded = encode::encode(
            image,
            id,
            &Settings {
                quality,
                lossless: false,
            },
        )?;
        if encoded.len() as u64 <= target {
            best = Some(encoded);
            low = quality + 1;
        } else {
            high = quality.saturating_sub(1);
        }
    }
    Ok(best)
}

fn shrink(image: &DynamicImage, size: usize, target: u64) -> Result<DynamicImage> {
    let (width, height) = image.dimensions();
    let scale = (target as f64 / size as f64).sqrt() * SHRINK_MARGIN;
    let width = (f64::from(width) * scale).round().max(1.0) as u32;
    let height = (f64::from(height) * scale).round().max(1.0) as u32;
    edit::resized(image, width, height)
}

pub fn to_size(image: &DynamicImage, id: &str, ceiling: u8, target: u64) -> Result<Vec<u8>> {
    let mut current = image.clone();
    for _ in 0..SHRINK_TRIES {
        if is_lossy(id)
            && let Some(encoded) = best_quality(&current, id, target, ceiling)?
        {
            return Ok(encoded);
        }
        let quality = if is_lossy(id) {
            LOWEST_QUALITY
        } else {
            ceiling
        };
        let encoded = encode::encode(
            &current,
            id,
            &Settings {
                quality,
                lossless: false,
            },
        )?;
        if encoded.len() as u64 <= target {
            return Ok(encoded);
        }
        current = shrink(&current, encoded.len(), target)?;
    }
    Err(Failure::new(luft_i18n::t!(
        crate::l10n::L10N,
        "failure-target-size"
    )))
}
