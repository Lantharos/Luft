use serde::{Deserialize, Serialize};
use specta::Type;

/// A page's corners on its picture, top left, top right, bottom right and
/// bottom left, each as fractions of the picture's width and height.
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize, Type)]
pub struct Quad(pub [[f32; 2]; 4]);

impl Quad {
    pub const WHOLE: Self = Self([[0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0]]);

    /// Corners in any order, put clockwise from the top left.
    pub fn ordered(mut corners: [[f32; 2]; 4]) -> Self {
        let centre = corners.iter().fold([0.0, 0.0], |sum, [x, y]| {
            [sum[0] + x / 4.0, sum[1] + y / 4.0]
        });
        corners.sort_by(|a, b| {
            let angle = |[x, y]: &[f32; 2]| (y - centre[1]).atan2(x - centre[0]);
            angle(a).total_cmp(&angle(b))
        });
        let first = (0..4)
            .min_by(|&a, &b| {
                let sum = |[x, y]: [f32; 2]| x + y;
                sum(corners[a]).total_cmp(&sum(corners[b]))
            })
            .unwrap_or(0);
        corners.rotate_left(first);
        Self(corners)
    }

    pub fn in_pixels(&self, width: u32, height: u32) -> [[f64; 2]; 4] {
        self.0.map(|[x, y]| {
            [
                f64::from(x) * f64::from(width),
                f64::from(y) * f64::from(height),
            ]
        })
    }

    /// The share of the picture it covers.
    pub fn area(&self) -> f32 {
        let [a, b, c, d] = self.0;
        let cross = |p: [f32; 2], q: [f32; 2]| p[0] * q[1] - p[1] * q[0];
        ((cross(a, b) + cross(b, c) + cross(c, d) + cross(d, a)) / 2.0).abs()
    }

    pub fn is_convex(&self) -> bool {
        let turns: Vec<f32> = (0..4)
            .map(|index| {
                let [a, b, c] = [0, 1, 2].map(|step| self.0[(index + step) % 4]);
                (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0])
            })
            .collect();
        turns.iter().all(|turn| *turn > 0.0) || turns.iter().all(|turn| *turn < 0.0)
    }

    /// The largest angle by which a corner strays from a right angle, in degrees.
    pub fn skew(&self, width: u32, height: u32) -> f64 {
        let corners = self.in_pixels(width, height);
        (0..4)
            .map(|index| {
                let [a, b, c] = [3, 0, 1].map(|step| corners[(index + step) % 4]);
                let (u, v) = ([a[0] - b[0], a[1] - b[1]], [c[0] - b[0], c[1] - b[1]]);
                let cosine = (u[0] * v[0] + u[1] * v[1]) / (u[0].hypot(u[1]) * v[0].hypot(v[1]));
                (cosine.clamp(-1.0, 1.0).acos().to_degrees() - 90.0).abs()
            })
            .fold(0.0, f64::max)
    }

    /// The width and height the page has when straightened, in pixels of
    /// a picture of this size: as tall as its longer side runs, and as wide
    /// as its proportions make it.
    pub fn straightened_size(&self, width: u32, height: u32) -> (u32, u32) {
        let [a, b, c, d] = self.in_pixels(width, height);
        let length = |p: [f64; 2], q: [f64; 2]| (p[0] - q[0]).hypot(p[1] - q[1]);
        let down = length(a, d).max(length(b, c));
        let across = length(a, b).max(length(d, c));
        let proportion = self.proportion(width, height).unwrap_or(across / down);
        let (across, down) = if across >= down {
            (across, across / proportion)
        } else {
            (down * proportion, down)
        };
        (across.round().max(1.0) as u32, down.round().max(1.0) as u32)
    }

    /// The real width over height of a rectangle seen in perspective as this
    /// quad, for a camera looking through the picture's centre (Zhang and
    /// He, "Whiteboard scanning and image enhancement", 2007).
    fn proportion(&self, width: u32, height: u32) -> Option<f64> {
        let [top_left, top_right, bottom_right, bottom_left] =
            self.in_pixels(width, height).map(|[x, y]| [x, y, 1.0]);
        let (m1, m2, m3, m4) = (top_left, top_right, bottom_left, bottom_right);
        let k2 = dot(cross(m1, m4), m3) / dot(cross(m2, m4), m3);
        let k3 = dot(cross(m1, m4), m2) / dot(cross(m3, m4), m2);
        let n2 = std::array::from_fn::<f64, 3, _>(|i| k2 * m2[i] - m1[i]);
        let n3 = std::array::from_fn::<f64, 3, _>(|i| k3 * m3[i] - m1[i]);
        let (u, v) = (f64::from(width) / 2.0, f64::from(height) / 2.0);
        let affine = n2[2].abs() < 1e-9 || n3[2].abs() < 1e-9;
        let focal_squared = -((n2[0] * n3[0] - (n2[0] * n3[2] + n2[2] * n3[0]) * u
            + n2[2] * n3[2] * u * u)
            + (n2[1] * n3[1] - (n2[1] * n3[2] + n2[2] * n3[1]) * v + n2[2] * n3[2] * v * v))
            / (n2[2] * n3[2]);
        let squared = if affine || !focal_squared.is_finite() || focal_squared <= 0.0 {
            (n2[0].powi(2) + n2[1].powi(2)) / (n3[0].powi(2) + n3[1].powi(2))
        } else {
            let norm = |n: [f64; 3]| {
                ((n[0] - u * n[2]).powi(2) + (n[1] - v * n[2]).powi(2)) / focal_squared
                    + n[2].powi(2)
            };
            norm(n2) / norm(n3)
        };
        let proportion = squared.sqrt();
        (proportion.is_finite() && (0.1..10.0).contains(&proportion)).then_some(proportion)
    }

    /// The quad pulled in towards its middle by `share` of its size.
    pub fn inset(&self, share: f32) -> Self {
        let centre = self.0.iter().fold([0.0, 0.0], |sum, [x, y]| {
            [sum[0] + x / 4.0, sum[1] + y / 4.0]
        });
        Self(self.0.map(|[x, y]| {
            [
                x + (centre[0] - x) * share * 2.0,
                y + (centre[1] - y) * share * 2.0,
            ]
        }))
    }
}

fn cross(a: [f64; 3], b: [f64; 3]) -> [f64; 3] {
    [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    ]
}

fn dot(a: [f64; 3], b: [f64; 3]) -> f64 {
    a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

/// The projective map taking the corners of a `width` × `height` rectangle
/// to `to`, as the eight free entries of a 3×3 matrix.
pub fn homography(width: f64, height: f64, to: [[f64; 2]; 4]) -> [f64; 9] {
    let from = [[0.0, 0.0], [width, 0.0], [width, height], [0.0, height]];
    let mut rows = [[0.0; 9]; 8];
    for (index, ([x, y], [u, v])) in from.into_iter().zip(to).enumerate() {
        rows[index * 2] = [x, y, 1.0, 0.0, 0.0, 0.0, -u * x, -u * y, u];
        rows[index * 2 + 1] = [0.0, 0.0, 0.0, x, y, 1.0, -v * x, -v * y, v];
    }
    let solved = solve(rows);
    [
        solved[0], solved[1], solved[2], solved[3], solved[4], solved[5], solved[6], solved[7], 1.0,
    ]
}

/// Solves a system of linear equations given as rows of coefficients
/// followed by the right-hand side, by Gaussian elimination.
pub fn solve<const N: usize, const M: usize>(mut rows: [[f64; M]; N]) -> [f64; N] {
    for column in 0..N {
        let pivot = (column..N)
            .max_by(|&a, &b| rows[a][column].abs().total_cmp(&rows[b][column].abs()))
            .unwrap_or(column);
        rows.swap(column, pivot);
        let lead = rows[column][column];
        if lead.abs() < 1e-12 {
            continue;
        }
        let pivot_row = rows[column];
        for (index, row) in rows.iter_mut().enumerate() {
            if index != column {
                let factor = row[column] / lead;
                for (value, pivot) in row.iter_mut().zip(pivot_row).skip(column) {
                    *value -= factor * pivot;
                }
            }
        }
    }
    std::array::from_fn(|row| {
        let lead = rows[row][row];
        if lead.abs() < 1e-12 {
            0.0
        } else {
            rows[row][M - 1] / lead
        }
    })
}
