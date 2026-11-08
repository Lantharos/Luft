use luft_handwriting::types::Stroke;
use tiny_skia::{Color, LineCap, LineJoin, Paint, PathBuilder, Pixmap, Stroke as Pen, Transform};

pub const HEIGHT: u32 = 64;
const WRITING: f32 = 44.0;
const WIDEST: u32 = 3200;
const PEN_WIDTH: f32 = WRITING * 0.055;
const FLATTEST: f32 = 8.0;

/// A line of handwriting drawn in black on white, as tall as the recognizer
/// reads, whatever size it was written at.
pub struct Line {
    pub width: u32,
    pub height: u32,
    pub rgb: Vec<u8>,
}

pub fn draw(strokes: &[Stroke]) -> Option<Line> {
    let points = || strokes.iter().flatten();
    let left = points().map(|point| point.0).fold(f64::INFINITY, f64::min);
    let right = points()
        .map(|point| point.0)
        .fold(f64::NEG_INFINITY, f64::max);
    let top = points().map(|point| point.1).fold(f64::INFINITY, f64::min);
    let bottom = points()
        .map(|point| point.1)
        .fold(f64::NEG_INFINITY, f64::max);
    if !left.is_finite() {
        return None;
    }
    let tall = ((bottom - top) as f32)
        .max((right - left) as f32 / FLATTEST)
        .max(1.0);
    let scale = WRITING / tall;
    let margin = (HEIGHT as f32 - WRITING) / 2.0;
    let centre = margin + (WRITING - (bottom - top) as f32 * scale) / 2.0;
    let width =
        (((right - left) as f32 * scale + 2.0 * margin).ceil() as u32).clamp(HEIGHT, WIDEST);
    let mut pixmap = Pixmap::new(width, HEIGHT)?;
    pixmap.fill(Color::WHITE);
    let mut paint = Paint::default();
    paint.set_color_rgba8(0, 0, 0, 255);
    let pen = Pen {
        width: PEN_WIDTH,
        line_cap: LineCap::Round,
        line_join: LineJoin::Round,
        ..Pen::default()
    };
    let place = |&(x, y): &(f64, f64)| {
        (
            (x - left) as f32 * scale + margin,
            (y - top) as f32 * scale + centre,
        )
    };
    for stroke in strokes {
        let mut path = PathBuilder::new();
        let mut placed = stroke.iter().map(place);
        let Some((x, y)) = placed.next() else {
            continue;
        };
        path.move_to(x, y);
        path.line_to(x + 0.01, y);
        placed.for_each(|(x, y)| path.line_to(x, y));
        if let Some(path) = path.finish() {
            pixmap.stroke_path(&path, &paint, &pen, Transform::identity(), None);
        }
    }
    let rgb = pixmap
        .pixels()
        .iter()
        .flat_map(|pixel| [pixel.red(), pixel.green(), pixel.blue()])
        .collect();
    Some(Line {
        width,
        height: HEIGHT,
        rgb,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn a_line_is_drawn_as_tall_as_the_recognizer_reads_and_keeps_its_proportions() {
        let line = draw(&[
            vec![(0.0, 0.0), (400.0, 100.0)],
            vec![(500.0, 0.0), (500.0, 100.0)],
        ])
        .unwrap();
        assert_eq!(line.rgb.len(), (line.width * HEIGHT * 3) as usize);
        let expected = 500.0 * WRITING / 100.0 + HEIGHT as f32 - WRITING;
        assert!(
            (line.width as f32 - expected).abs() <= 1.0,
            "{} wide",
            line.width
        );
        assert!(line.rgb.iter().any(|&value| value < 64));
    }
}
