use image::{GrayImage, RgbImage};
use imageproc::contrast::otsu_level;
use rayon::prelude::*;

use super::geometry::solve;
use super::{Cleaned, Mode, Origin};

/// Cells across and down in which the paper's brightness is measured.
const CELLS: u32 = 28;
/// A cell counts as bare paper when it's at least this bright next to the fit.
const BARE: f64 = 0.82;
/// Too few bare cells means the page is mostly picture, and is left as it is.
const FEWEST_BARE: f64 = 0.3;
/// The darkest the darkest ink is stretched from.
const DARKEST_BLACK_POINT: u8 = 90;

pub fn clean(page: RgbImage, origin: Origin, mode: Mode) -> Cleaned {
    match mode {
        Mode::Colour => Cleaned::Colour(colour(page, origin)),
        Mode::Grey => Cleaned::Grey(grey(page, origin)),
        Mode::BlackAndWhite => Cleaned::BlackAndWhite(black_and_white(grey(page, origin))),
    }
}

fn degree(origin: Origin) -> usize {
    match origin {
        Origin::Scanner => 1,
        Origin::Camera | Origin::Picture => 3,
    }
}

/// The colour page with its paper evened out to white, which also takes
/// away the tint of the light it was photographed under.
fn colour(mut page: RgbImage, origin: Origin) -> RgbImage {
    let (width, height) = page.dimensions();
    let samples = paper_samples(width, height, |x, y| page.get_pixel(x, y).0);
    let Some(light) = Light::measure(&samples, origin) else {
        return page;
    };
    let row_bytes = width as usize * 3;
    page.par_chunks_mut(row_bytes)
        .enumerate()
        .for_each(|(row, pixels)| {
            let along = light.row(row as u32, width, height);
            for (column, pixel) in pixels.as_chunks_mut::<3>().0.iter_mut().enumerate() {
                let paper = along.at(column);
                for (value, paper) in pixel.iter_mut().zip(paper) {
                    *value = brighten(*value, paper);
                }
            }
        });
    let black = black_point(page.pixels().map(|pixel| luminance(pixel.0)));
    page.par_iter_mut()
        .for_each(|value| *value = stretch(*value, black));
    page
}

/// The page in grey with its paper evened out to white.
pub fn grey(page: RgbImage, origin: Origin) -> GrayImage {
    let (width, height) = page.dimensions();
    let mut out = GrayImage::from_fn(width, height, |x, y| {
        image::Luma([luminance(page.get_pixel(x, y).0)])
    });
    let samples = paper_samples(width, height, |x, y| [out.get_pixel(x, y).0[0]; 3]);
    if let Some(light) = Light::measure(&samples, origin) {
        out.par_chunks_mut(width as usize)
            .enumerate()
            .for_each(|(row, pixels)| {
                let along = light.row(row as u32, width, height);
                for (column, pixel) in pixels.iter_mut().enumerate() {
                    *pixel = brighten(*pixel, along.at(column)[0]);
                }
            });
    }
    let black = black_point(out.iter().copied());
    out.par_iter_mut()
        .for_each(|value| *value = stretch(*value, black));
    out
}

/// How much of a scan's edges is turned white, where the scanner's own
/// frame and the shadow of the lid show.
const SCANNER_EDGE: f32 = 0.004;

pub fn whiten_edges(cleaned: &mut Cleaned) {
    let (width, height) = cleaned.size();
    let edge =
        ((width.min(height) as f32 * SCANNER_EDGE).round() as u32).clamp(1, width.min(height) / 2);
    let mut whiten = |x: u32, y: u32| match cleaned {
        Cleaned::Colour(image) => image.put_pixel(x, y, image::Rgb([255; 3])),
        Cleaned::Grey(image) | Cleaned::BlackAndWhite(image) => {
            image.put_pixel(x, y, image::Luma([255]))
        }
    };
    for y in 0..height {
        if y < edge || y >= height - edge {
            (0..width).for_each(|x| whiten(x, y));
        } else {
            (0..edge)
                .chain(width - edge..width)
                .for_each(|x| whiten(x, y));
        }
    }
}

fn black_and_white(grey: GrayImage) -> GrayImage {
    let level = otsu_level(&grey).clamp(150, 215);
    let mut out = grey;
    out.par_iter_mut()
        .for_each(|value| *value = if *value > level { 255 } else { 0 });
    out
}

fn luminance([r, g, b]: [u8; 3]) -> u8 {
    ((u32::from(r) * 77 + u32::from(g) * 150 + u32::from(b) * 29) >> 8) as u8
}

fn brighten(value: u8, paper: f64) -> u8 {
    (f64::from(value) * 255.0 / paper.max(24.0)).min(255.0) as u8
}

fn black_point(values: impl Iterator<Item = u8>) -> u8 {
    let mut counts = [0u64; 256];
    let mut total = 0u64;
    for value in values {
        counts[usize::from(value)] += 1;
        total += 1;
    }
    let mut seen = 0;
    for (level, count) in counts.iter().enumerate() {
        seen += count;
        if seen * 200 >= total {
            return (level as u8).min(DARKEST_BLACK_POINT);
        }
    }
    0
}

fn stretch(value: u8, black: u8) -> u8 {
    let range = 255.0 - f64::from(black);
    ((f64::from(value.saturating_sub(black)) * 255.0 / range).round()).min(255.0) as u8
}

struct Sample {
    x: f64,
    y: f64,
    colour: [f64; 3],
}

/// The colour of the brightest tenth of each cell, which is bare paper
/// wherever the cell has any.
fn paper_samples(
    width: u32,
    height: u32,
    pixel: impl Fn(u32, u32) -> [u8; 3] + Sync,
) -> Vec<Sample> {
    let (cell_width, cell_height) = ((width / CELLS).max(1), (height / CELLS).max(1));
    (0..CELLS * CELLS)
        .into_par_iter()
        .filter_map(|cell| {
            let (left, top) = ((cell % CELLS) * cell_width, (cell / CELLS) * cell_height);
            if left + cell_width > width || top + cell_height > height {
                return None;
            }
            let step = (cell_width.min(cell_height) / 24).max(1);
            let mut pixels: Vec<[u8; 3]> = (top..top + cell_height)
                .step_by(step as usize)
                .flat_map(|y| {
                    (left..left + cell_width)
                        .step_by(step as usize)
                        .map(move |x| (x, y))
                })
                .map(|(x, y)| pixel(x, y))
                .collect();
            pixels.sort_unstable_by_key(|colour| luminance(*colour));
            let brightest = &pixels[pixels.len() * 9 / 10..];
            let colour = std::array::from_fn(|channel| {
                brightest
                    .iter()
                    .map(|colour| f64::from(colour[channel]))
                    .sum::<f64>()
                    / brightest.len() as f64
            });
            Some(Sample {
                x: (f64::from(left) + f64::from(cell_width) / 2.0) / f64::from(width) * 2.0 - 1.0,
                y: (f64::from(top) + f64::from(cell_height) / 2.0) / f64::from(height) * 2.0 - 1.0,
                colour,
            })
        })
        .collect()
}

/// The samples that are bare paper, found by fitting the paper's light and
/// leaving out cells much darker than the fit, or `None` when too few are.
fn bare_paper(samples: &[Sample], degree: usize) -> Option<Vec<&Sample>> {
    let brightness = |sample: &Sample| sample.colour.iter().sum::<f64>() / 3.0;
    let mut kept: Vec<&Sample> = samples.iter().collect();
    for _ in 0..3 {
        let surface = Surface::fit(&kept, degree, brightness);
        kept = samples
            .iter()
            .filter(|sample| brightness(sample) >= surface.value(sample.x, sample.y) * BARE)
            .collect();
    }
    (kept.len() as f64 >= samples.len() as f64 * FEWEST_BARE).then_some(kept)
}

/// A smooth surface over the page, a polynomial in x and y.
struct Surface {
    degree: usize,
    coefficients: Vec<f64>,
}

const MAX_TERMS: usize = 10;

fn terms(degree: usize, x: f64, y: f64) -> impl Iterator<Item = f64> {
    (0..=degree).flat_map(move |total| {
        (0..=total).map(move |power| x.powi((total - power) as i32) * y.powi(power as i32))
    })
}

impl Surface {
    fn fit(samples: &[&Sample], degree: usize, value: impl Fn(&Sample) -> f64) -> Self {
        let count = terms(degree, 0.0, 0.0).count();
        let mut normal = [[0.0; MAX_TERMS + 1]; MAX_TERMS];
        for sample in samples {
            let row: Vec<f64> = terms(degree, sample.x, sample.y).collect();
            let target = value(sample);
            for i in 0..count {
                for j in 0..count {
                    normal[i][j] += row[i] * row[j];
                }
                normal[i][MAX_TERMS] += row[i] * target;
            }
        }
        for (index, row) in normal.iter_mut().enumerate().skip(count) {
            row[index] = 1.0;
        }
        let solved = solve(normal);
        Self {
            degree,
            coefficients: solved[..count].to_vec(),
        }
    }

    fn value(&self, x: f64, y: f64) -> f64 {
        terms(self.degree, x, y)
            .zip(&self.coefficients)
            .map(|(term, c)| term * c)
            .sum()
    }
}

/// How brightly the paper is lit across the page, cell by cell: where a
/// cell is bare paper, or paper in a shadow, what it measured, elsewhere a
/// smooth fit through the bare cells.
struct Light {
    cells: Vec<[f64; 3]>,
}

/// A cell this much darker than the fit, and no more coloured, is paper in
/// a shadow rather than a picture on the page.
const SHADOWED: f64 = 0.5;
const SHADOW_TINT: f64 = 0.08;

impl Light {
    fn measure(samples: &[Sample], origin: Origin) -> Option<Self> {
        if samples.len() != (CELLS * CELLS) as usize {
            return None;
        }
        let degree = degree(origin);
        let kept = bare_paper(samples, degree)?;
        let fits: [Surface; 3] = std::array::from_fn(|channel| {
            Surface::fit(&kept, degree, |sample| sample.colour[channel])
        });
        let mut cells: Vec<[f64; 3]> = samples
            .iter()
            .map(|sample| {
                let fit = fits
                    .each_ref()
                    .map(|surface| surface.value(sample.x, sample.y).max(1.0));
                let ratios: [f64; 3] =
                    std::array::from_fn(|channel| sample.colour[channel] / fit[channel]);
                let lowest = ratios.iter().copied().fold(f64::INFINITY, f64::min);
                let highest = ratios.iter().copied().fold(0.0, f64::max);
                let shadow = origin != Origin::Scanner
                    && lowest >= SHADOWED
                    && highest - lowest <= SHADOW_TINT;
                if shadow {
                    sample.colour.map(|value| value.max(1.0))
                } else {
                    fit
                }
            })
            .collect();
        for _ in 0..2 {
            cells = smoothed(&cells);
        }
        Some(Self { cells })
    }

    /// The light along one row, every few pixels.
    fn row(&self, row: u32, width: u32, height: u32) -> Along {
        let y = ((f64::from(row) + 0.5) / f64::from(height) * f64::from(CELLS) - 0.5)
            .clamp(0.0, f64::from(CELLS - 1));
        let (top, fraction) = (y.floor() as usize, y.fract());
        let bottom = (top + 1).min(CELLS as usize - 1);
        let points = (width / ALONG_STEP + 2) as usize;
        Along(
            (0..points)
                .map(|index| {
                    let x = ((index as u32 * ALONG_STEP) as f64 + 0.5) / f64::from(width)
                        * f64::from(CELLS)
                        - 0.5;
                    let x = x.clamp(0.0, f64::from(CELLS - 1));
                    let (left, across) = (x.floor() as usize, x.fract());
                    let right = (left + 1).min(CELLS as usize - 1);
                    let at = |column: usize, row: usize| self.cells[row * CELLS as usize + column];
                    std::array::from_fn(|channel| {
                        let upper = at(left, top)[channel] * (1.0 - across)
                            + at(right, top)[channel] * across;
                        let lower = at(left, bottom)[channel] * (1.0 - across)
                            + at(right, bottom)[channel] * across;
                        upper * (1.0 - fraction) + lower * fraction
                    })
                })
                .collect(),
        )
    }
}

fn smoothed(cells: &[[f64; 3]]) -> Vec<[f64; 3]> {
    let side = CELLS as i32;
    (0..cells.len() as i32)
        .map(|index| {
            let (x, y) = (index % side, index / side);
            let mut sum = [0.0; 3];
            let mut count = 0.0;
            for (dx, dy) in (-1..=1).flat_map(|dx| (-1..=1).map(move |dy| (dx, dy))) {
                let (nx, ny) = (x + dx, y + dy);
                if (0..side).contains(&nx) && (0..side).contains(&ny) {
                    let cell = cells[(ny * side + nx) as usize];
                    for channel in 0..3 {
                        sum[channel] += cell[channel];
                    }
                    count += 1.0;
                }
            }
            sum.map(|value| value / count)
        })
        .collect()
}

/// How far apart the light is worked out along a row; it changes slowly.
const ALONG_STEP: u32 = 16;

struct Along(Vec<[f64; 3]>);

impl Along {
    fn at(&self, column: usize) -> [f64; 3] {
        let step = ALONG_STEP as usize;
        let (index, fraction) = (column / step, (column % step) as f64 / ALONG_STEP as f64);
        let (a, b) = (self.0[index], self.0[index + 1]);
        std::array::from_fn(|channel| a[channel] * (1.0 - fraction) + b[channel] * fraction)
    }
}
