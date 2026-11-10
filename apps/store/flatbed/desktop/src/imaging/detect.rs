use image::{GrayImage, Luma, RgbImage};
use imageproc::contours::{BorderType, find_contours};
use imageproc::contrast::{ThresholdType, otsu_level, threshold};
use imageproc::distance_transform::Norm;
use imageproc::edges::canny;
use imageproc::filter::gaussian_blur_f32;
use imageproc::geometry::{approximate_polygon_dp, arc_length, contour_area, convex_hull};
use imageproc::morphology::{close, dilate};
use imageproc::point::Point;
use rayon::prelude::*;

use super::geometry::Quad;

const DETECTION_SIZE: u32 = 480;

struct Limits {
    smallest: f32,
    largest: f32,
    skew: f64,
}

const PHOTO: Limits = Limits {
    smallest: 0.12,
    largest: 0.985,
    skew: 40.0,
};

const GLASS: Limits = Limits {
    smallest: 0.02,
    largest: 0.93,
    skew: 6.0,
};

const EDGE_INSET: f32 = 0.006;

const EVEN_LID: f32 = 22.0;

pub fn shrunk_grey(source: &RgbImage, limit: u32) -> GrayImage {
    let (width, height) = source.dimensions();
    let factor = width.max(height).div_ceil(limit).max(1);
    let (out_width, out_height) = ((width / factor).max(1), (height / factor).max(1));
    let mut out = GrayImage::new(out_width, out_height);
    out.par_chunks_mut(out_width as usize)
        .enumerate()
        .for_each(|(row, pixels)| {
            for (column, pixel) in pixels.iter_mut().enumerate() {
                let mut sum = 0u32;
                for y in row as u32 * factor..(row as u32 + 1) * factor {
                    for x in column as u32 * factor..(column as u32 + 1) * factor {
                        let [r, g, b] = source.get_pixel(x, y).0;
                        sum += u32::from(r) * 77 + u32::from(g) * 150 + u32::from(b) * 29;
                    }
                }
                *pixel = (sum / (256 * factor * factor)) as u8;
            }
        });
    out
}

pub fn small_grey(source: &RgbImage) -> GrayImage {
    shrunk_grey(source, DETECTION_SIZE)
}

pub fn find_page(small: &GrayImage) -> Option<Quad> {
    best(small, &PHOTO, |_| true)
}

pub fn find_page_on_glass(small: &GrayImage) -> Option<Quad> {
    best(small, &GLASS, |quad| even_around(small, quad))
}

fn best(small: &GrayImage, limits: &Limits, fits: impl Fn(&Quad) -> bool) -> Option<Quad> {
    let blurred = gaussian_blur_f32(small, 1.4);
    let edges = dilate(&canny(&blurred, 18.0, 54.0), Norm::LInf, 1);
    let bright = close(
        &threshold(&blurred, otsu_level(&blurred), ThresholdType::Binary),
        Norm::LInf,
        2,
    );
    let (width, height) = small.dimensions();
    [edges, bright]
        .iter()
        .flat_map(find_contours::<i32>)
        .filter(|contour| contour.border_type == BorderType::Outer && contour.points.len() >= 24)
        .filter_map(|contour| quad_around(&contour.points, width, height))
        .filter(|quad| {
            let area = quad.area();
            area >= limits.smallest
                && area <= limits.largest
                && quad.is_convex()
                && quad.skew(width, height) <= limits.skew
        })
        .filter(|quad| fits(quad))
        .max_by(|a, b| a.area().total_cmp(&b.area()))
}

fn quad_around(points: &[Point<i32>], width: u32, height: u32) -> Option<Quad> {
    let hull = convex_hull(points.to_vec());
    let hull_area = contour_area(&hull);
    if hull.len() < 4 || hull_area <= 0.0 {
        return None;
    }
    let simplified = approximate_polygon_dp(&hull, arc_length(&hull, true) * 0.02, true);
    let corners: [Point<i32>; 4] = match simplified.len() {
        4 => [simplified[0], simplified[1], simplified[2], simplified[3]],
        _ => extremes(&hull),
    };
    if contour_area(&corners) < hull_area * 0.9 {
        return None;
    }
    let normalized = corners.map(|point| {
        [
            (point.x as f32 + 0.5) / width as f32,
            (point.y as f32 + 0.5) / height as f32,
        ]
    });
    Some(Quad::ordered(normalized).inset(EDGE_INSET))
}

fn extremes(hull: &[Point<i32>]) -> [Point<i32>; 4] {
    let pick = |key: fn(&Point<i32>) -> i32| {
        *hull
            .iter()
            .max_by_key(|point| key(point))
            .expect("a hull has points")
    };
    [
        pick(|p| -(p.x + p.y)),
        pick(|p| p.x - p.y),
        pick(|p| p.x + p.y),
        pick(|p| p.y - p.x),
    ]
}

fn even_around(small: &GrayImage, quad: &Quad) -> bool {
    let (width, height) = small.dimensions();
    let corners = quad.in_pixels(width, height);
    let inside = |x: f64, y: f64| {
        (0..4).all(|index| {
            let ([ax, ay], [bx, by]) = (corners[index], corners[(index + 1) % 4]);
            (bx - ax) * (y - ay) - (by - ay) * (x - ax) >= 0.0
        })
    };
    let outside: Vec<f32> = small
        .enumerate_pixels()
        .filter(|(x, y, _)| x % 2 == 0 && y % 2 == 0)
        .filter(|(x, y, _)| !inside(f64::from(*x) + 0.5, f64::from(*y) + 0.5))
        .map(|(_, _, Luma([value]))| f32::from(*value))
        .collect();
    if outside.len() < 32 {
        return false;
    }
    let mean = outside.iter().sum::<f32>() / outside.len() as f32;
    let variance = outside
        .iter()
        .map(|value| (value - mean).powi(2))
        .sum::<f32>()
        / outside.len() as f32;
    variance.sqrt() <= EVEN_LID
}
