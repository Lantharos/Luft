use core::f32::consts::{FRAC_PI_2, TAU};

use tiny_skia::{LineCap, Paint, PathBuilder, PixmapMut, Stroke, Transform};

use crate::Layout;

const CYCLE_SECONDS: f32 = 1.6;
const TURNS_PER_SECOND: f32 = 0.55;
const LONGEST_ARC: f32 = 0.78;
const SHORTEST_ARC: f32 = 0.03;
const STROKE: f32 = 3.5;
const INSET: f32 = 4.0;

fn ease_in_out(progress: f32) -> f32 {
    0.5 - 0.5 * libm::cosf(progress.clamp(0.0, 1.0) * core::f32::consts::PI)
}

fn arc(seconds: f32) -> (f32, f32) {
    let cycles = seconds / CYCLE_SECONDS;
    let completed = libm::floorf(cycles);
    let progress = cycles - completed;
    let head = ease_in_out(progress * 2.0) * LONGEST_ARC;
    let tail = ease_in_out(progress * 2.0 - 1.0) * LONGEST_ARC;
    let start = (seconds * TURNS_PER_SECOND + completed * LONGEST_ARC + tail) * TAU - FRAC_PI_2;
    (start, (head - tail).max(SHORTEST_ARC) * TAU)
}

fn push_arc(path: &mut PathBuilder, (cx, cy): (f32, f32), radius: f32, start: f32, sweep: f32) {
    let pieces = libm::ceilf(sweep / FRAC_PI_2).max(1.0) as usize;
    let step = sweep / pieces as f32;
    let handle = 4.0 / 3.0 * libm::tanf(step / 4.0) * radius;
    let point = |angle: f32| {
        (
            cx + radius * libm::cosf(angle),
            cy + radius * libm::sinf(angle),
        )
    };
    let (x, y) = point(start);
    path.move_to(x, y);
    for piece in 0..pieces {
        let from = start + step * piece as f32;
        let to = from + step;
        let (x0, y0) = point(from);
        let (x1, y1) = point(to);
        path.cubic_to(
            x0 - handle * libm::sinf(from),
            y0 + handle * libm::cosf(from),
            x1 + handle * libm::sinf(to),
            y1 - handle * libm::cosf(to),
            x1,
            y1,
        );
    }
}

pub fn draw(pixmap: &mut PixmapMut, layout: &Layout, view: Transform, seconds: f32, alpha: f32) {
    if alpha <= 0.0 {
        return;
    }
    let scale = layout.scale;
    let radius = layout.loader_size / 2.0 - INSET * scale;
    let (start, sweep) = arc(seconds);
    let mut path = PathBuilder::new();
    push_arc(&mut path, layout.loader_center, radius, start, sweep);
    let Some(path) = path.finish() else { return };

    let mut paint = Paint {
        anti_alias: true,
        ..Paint::default()
    };
    paint.set_color_rgba8(
        255,
        255,
        255,
        libm::roundf(alpha.clamp(0.0, 1.0) * 255.0) as u8,
    );
    let stroke = Stroke {
        width: STROKE * scale,
        line_cap: LineCap::Round,
        ..Stroke::default()
    };
    pixmap.stroke_path(&path, &paint, &stroke, view, None);
}
