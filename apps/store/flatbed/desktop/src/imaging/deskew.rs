use image::GrayImage;
use imageproc::contrast::otsu_level;
use rayon::prelude::*;

use super::geometry::Quad;

const SEARCH_DEGREES: f64 = 5.0;
const COARSE_STEP: f64 = 0.25;
const FINE_STEP: f64 = 0.05;
/// Turns smaller than this aren't worth losing the edges for.
const NOTICEABLE_DEGREES: f64 = 0.3;

/// The page straightened by how far its lines of text lean, losing as
/// little as possible at the edges, or all of it when nothing leans.
pub fn straightened(grey: &GrayImage) -> Quad {
    let ink = ink(grey);
    let share = ink.len() as f64 / (f64::from(grey.width()) * f64::from(grey.height()));
    if !(0.003..=0.3).contains(&share) {
        return Quad::WHOLE;
    }
    let coarse = steepest(&ink, grey.height(), steps(0.0, SEARCH_DEGREES, COARSE_STEP));
    let fine = steepest(&ink, grey.height(), steps(coarse, COARSE_STEP, FINE_STEP));
    if fine.abs() < NOTICEABLE_DEGREES {
        return Quad::WHOLE;
    }
    turned(fine, grey.width(), grey.height())
}

fn steps(around: f64, reach: f64, step: f64) -> Vec<f64> {
    let count = (reach / step).round() as i32;
    (-count..=count)
        .map(|index| around + f64::from(index) * step)
        .collect()
}

fn ink(grey: &GrayImage) -> Vec<(f32, f32)> {
    let level = otsu_level(grey);
    grey.enumerate_pixels()
        .filter(|(_, _, pixel)| pixel.0[0] < level)
        .map(|(x, y, _)| (x as f32, y as f32))
        .collect()
}

/// The angle at which the ink falls into the sharpest rows, as lines of
/// text do when they run level.
fn steepest(ink: &[(f32, f32)], height: u32, angles: Vec<f64>) -> f64 {
    angles
        .into_par_iter()
        .map(|degrees| {
            let (sin, cos) = (
                degrees.to_radians().sin() as f32,
                degrees.to_radians().cos() as f32,
            );
            let reach = height as usize * 2;
            let mut rows = vec![0u32; reach * 2];
            for &(x, y) in ink {
                let row = (y * cos - x * sin) as isize + reach as isize;
                if let Some(count) = rows.get_mut(row.max(0) as usize) {
                    *count += 1;
                }
            }
            let sharpness: f64 = rows.iter().map(|&count| f64::from(count).powi(2)).sum();
            (degrees, sharpness)
        })
        .max_by(|a, b| a.1.total_cmp(&b.1))
        .map_or(0.0, |(degrees, _)| degrees)
}

/// The largest rectangle with the picture's proportions that fits inside
/// it turned by `degrees`.
fn turned(degrees: f64, width: u32, height: u32) -> Quad {
    let (w, h) = (f64::from(width), f64::from(height));
    let (sin, cos) = (degrees.to_radians().sin(), degrees.to_radians().cos());
    let scale = (w / (w * cos + h * sin.abs())).min(h / (w * sin.abs() + h * cos));
    let (half_w, half_h) = (w * scale / 2.0, h * scale / 2.0);
    let corners = [
        [-half_w, -half_h],
        [half_w, -half_h],
        [half_w, half_h],
        [-half_w, half_h],
    ];
    Quad(corners.map(|[x, y]| {
        [
            ((w / 2.0 + x * cos - y * sin) / w) as f32,
            ((h / 2.0 + x * sin + y * cos) / h) as f32,
        ]
    }))
}
