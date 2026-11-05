use image::RgbImage;
use image::imageops::{self, FilterType};

use super::focus::Focus;

const WORKING_WIDTH: u32 = 160;
const WIDEST_DISPLAY: f64 = 43.0 / 18.0;
const NARROWEST_DISPLAY: f64 = 9.0 / 16.0;
const SCALES: [(usize, usize); 3] = [(2, 10), (4, 16), (8, 28)];
const COLOR_WEIGHT: f64 = 0.6;
const SKIN_WEIGHT: f64 = 1.5;
const SKIN_BLUE: (f64, f64) = (-0.2, -0.03);
const SKIN_RED: (f64, f64) = (0.05, 0.18);
const BORDER: f64 = 0.2;
const CROP_EDGE_FALLOFF: f64 = 0.6;

struct Plane {
    width: usize,
    height: usize,
    values: Vec<f64>,
}

impl Plane {
    fn map(image: &RgbImage, value: impl Fn([f64; 3]) -> f64) -> Self {
        Self {
            width: image.width() as usize,
            height: image.height() as usize,
            values: image
                .pixels()
                .map(|pixel| value(pixel.0.map(|channel| f64::from(channel) / 255.0)))
                .collect(),
        }
    }

    fn blurred(&self, radius: usize) -> Self {
        let horizontal = self.box_pass(radius, true);
        horizontal.box_pass(radius, false)
    }

    fn box_pass(&self, radius: usize, horizontal: bool) -> Self {
        let (lines, length) = if horizontal {
            (self.height, self.width)
        } else {
            (self.width, self.height)
        };
        let index = |line: usize, position: usize| {
            if horizontal {
                line * self.width + position
            } else {
                position * self.width + line
            }
        };
        let mut values = vec![0.0; self.values.len()];
        let mut sums = vec![0.0; length + 1];
        for line in 0..lines {
            for position in 0..length {
                sums[position + 1] = sums[position] + self.values[index(line, position)];
            }
            for position in 0..length {
                let low = position.saturating_sub(radius);
                let high = (position + radius + 1).min(length);
                values[index(line, position)] = (sums[high] - sums[low]) / (high - low) as f64;
            }
        }
        Self {
            width: self.width,
            height: self.height,
            values,
        }
    }

    fn contrast(&self) -> Vec<f64> {
        let mut contrast = vec![0.0; self.values.len()];
        for (center, surround) in SCALES {
            let near = self.blurred(center);
            let far = self.blurred(surround);
            for (total, (near, far)) in contrast.iter_mut().zip(near.values.iter().zip(&far.values))
            {
                *total += (near - far).abs();
            }
        }
        contrast
    }
}

fn skin([r, g, b]: [f64; 3]) -> f64 {
    let blue = -0.1687 * r - 0.3313 * g + 0.5 * b;
    let red = 0.5 * r - 0.4187 * g - 0.0813 * b;
    let inside = |value: f64, (low, high): (f64, f64)| value > low && value < high;
    if !inside(blue, SKIN_BLUE) || !inside(red, SKIN_RED) {
        return 0.0;
    }
    let center = |(low, high): (f64, f64), value: f64| {
        1.0 - ((value - (low + high) / 2.0) / ((high - low) / 2.0)).abs()
    };
    center(SKIN_BLUE, blue).min(center(SKIN_RED, red))
}

fn away_from_border(position: f64) -> f64 {
    0.4 + 0.6 * (position.min(1.0 - position) / BORDER).min(1.0)
}

fn profiles(image: &RgbImage) -> (Vec<f64>, Vec<f64>) {
    let lightness = Plane::map(image, |[r, g, b]| 0.2126 * r + 0.7152 * g + 0.0722 * b).contrast();
    let red_green = Plane::map(image, |[r, g, _]| r - g).contrast();
    let blue_yellow = Plane::map(image, |[r, g, b]| b - (r + g) / 2.0).contrast();
    let skin = Plane::map(image, skin).blurred(1);
    let (width, height) = (skin.width, skin.height);
    let mut columns = vec![0.0; width];
    let mut rows = vec![0.0; height];
    for (y, row) in rows.iter_mut().enumerate() {
        let down = y as f64 / height as f64;
        let row_weight = away_from_border(down + 0.5 / height as f64);
        for (x, column) in columns.iter_mut().enumerate() {
            let at = y * width + x;
            let salient = lightness[at]
                + COLOR_WEIGHT * (red_green[at] + blue_yellow[at])
                + SKIN_WEIGHT * skin.values[at] * (1.0 - down);
            let value = salient * row_weight * away_from_border((x as f64 + 0.5) / width as f64);
            *column += value;
            *row += value;
        }
    }
    (columns, rows)
}

fn best_position(profile: &[f64], kept: f64) -> f64 {
    let total = profile.len();
    let length = ((total as f64 * kept).round() as usize).clamp(1, total);
    let range = total - length;
    if range == 0 {
        return 0.5;
    }
    let importance = |index: usize| {
        let offset = 2.0 * index as f64 / (length.max(2) - 1) as f64 - 1.0;
        1.0 - CROP_EDGE_FALLOFF * offset * offset
    };
    let score = |start: usize| -> f64 {
        profile[start..start + length]
            .iter()
            .enumerate()
            .map(|(index, value)| value * importance(index))
            .sum()
    };
    let middle = range / 2;
    let mut starts: Vec<usize> = (0..=range).collect();
    starts.sort_by_key(|start| start.abs_diff(middle));
    let mut best = (middle, score(middle));
    for start in starts {
        let candidate = score(start);
        if candidate > best.1 * (1.0 + 1e-6) {
            best = (start, candidate);
        }
    }
    best.0 as f64 / range as f64
}

pub fn estimate(image: &RgbImage) -> Focus {
    if image.width() < 3 || image.height() < 3 {
        return Focus::CENTER;
    }
    let height = (f64::from(image.height()) * f64::from(WORKING_WIDTH) / f64::from(image.width()))
        .round()
        .max(1.0) as u32;
    let small = imageops::resize(image, WORKING_WIDTH, height, FilterType::Triangle);
    let aspect = f64::from(small.width()) / f64::from(small.height());
    let (columns, rows) = profiles(&small);
    Focus {
        x: best_position(&columns, (NARROWEST_DISPLAY / aspect).min(1.0)),
        y: best_position(&rows, (aspect / WIDEST_DISPLAY).min(1.0)),
    }
}
