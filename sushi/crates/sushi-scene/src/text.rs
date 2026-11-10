use alloc::boxed::Box;
use core::ptr;
use core::sync::atomic::{AtomicPtr, Ordering};

use ab_glyph::{Font, FontRef, GlyphId, OutlineCurve, PxScale, PxScaleFont, ScaleFont};
use tiny_skia::{FillRule, PathBuilder, PixmapMut, Transform};

use crate::white;

type Sized = PxScaleFont<&'static FontRef<'static>>;

static OPEN_RUNDE: AtomicPtr<FontRef<'static>> = AtomicPtr::new(ptr::null_mut());

fn font() -> &'static FontRef<'static> {
    if let Some(parsed) = unsafe { OPEN_RUNDE.load(Ordering::Acquire).as_ref() } {
        return parsed;
    }
    let parsed = Box::leak(Box::new(
        FontRef::try_from_slice(include_bytes!(
            "../../../../kestrel/engine/data/fonts/OpenRunde-Medium.otf"
        ))
        .expect("Open Runde is a valid OpenType font"),
    ));
    OPEN_RUNDE.store(parsed, Ordering::Release);
    parsed
}

fn sized(size: f32) -> Sized {
    let font = font();
    font.as_scaled(PxScale::from(
        size * font.height_unscaled() / font.units_per_em().unwrap_or(1000.0),
    ))
}

fn glyphs<'a>(font: &'a Sized, text: &'a str) -> impl Iterator<Item = (GlyphId, f32)> + 'a {
    let mut pen = 0.0;
    let mut previous: Option<GlyphId> = None;
    text.chars().map(move |character| {
        let id = font.glyph_id(character);
        if let Some(previous) = previous {
            pen += font.kern(previous, id);
        }
        let at = pen;
        pen += font.h_advance(id);
        previous = Some(id);
        (id, at)
    })
}

pub fn width(text: &str, size: f32) -> f32 {
    let font = sized(size);
    glyphs(&font, text)
        .last()
        .map_or(0.0, |(id, at)| at + font.h_advance(id))
}

pub fn centered(
    pixmap: &mut PixmapMut,
    view: Transform,
    line: &str,
    (center, baseline): (f32, f32),
    size: f32,
    alpha: f32,
) {
    draw(
        pixmap,
        view,
        line,
        (center - width(line, size) / 2.0, baseline),
        size,
        alpha,
    );
}

pub fn draw(
    pixmap: &mut PixmapMut,
    view: Transform,
    text: &str,
    (x, baseline): (f32, f32),
    size: f32,
    alpha: f32,
) {
    let font = sized(size);
    let factor = font.h_scale_factor();
    let mut path = PathBuilder::new();
    for (id, at) in glyphs(&font, text) {
        let Some(outline) = font.font.outline(id) else {
            continue;
        };
        let place =
            |point: ab_glyph::Point| (x + at + point.x * factor, baseline - point.y * factor);
        let mut end = None;
        for curve in &outline.curves {
            let (start, finish) = match curve {
                OutlineCurve::Line(a, b) => (*a, *b),
                OutlineCurve::Quad(a, _, c) => (*a, *c),
                OutlineCurve::Cubic(a, _, _, d) => (*a, *d),
            };
            if end != Some(start) {
                if end.is_some() {
                    path.close();
                }
                let (px, py) = place(start);
                path.move_to(px, py);
            }
            match curve {
                OutlineCurve::Line(_, b) => {
                    let (bx, by) = place(*b);
                    path.line_to(bx, by);
                }
                OutlineCurve::Quad(_, b, c) => {
                    let ((bx, by), (cx, cy)) = (place(*b), place(*c));
                    path.quad_to(bx, by, cx, cy);
                }
                OutlineCurve::Cubic(_, b, c, d) => {
                    let ((bx, by), (cx, cy), (dx, dy)) = (place(*b), place(*c), place(*d));
                    path.cubic_to(bx, by, cx, cy, dx, dy);
                }
            }
            end = Some(finish);
        }
        if end.is_some() {
            path.close();
        }
    }
    let Some(path) = path.finish() else { return };
    pixmap.fill_path(&path, &white(alpha), FillRule::Winding, view, None);
}
