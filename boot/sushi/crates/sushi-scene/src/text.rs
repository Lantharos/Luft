use ab_glyph::{Font, FontRef, GlyphId, OutlineCurve, PxScale, ScaleFont};
use tiny_skia::{FillRule, Paint, PathBuilder, PixmapMut, Transform};

fn font() -> FontRef<'static> {
    FontRef::try_from_slice(include_bytes!(
        "../../../../../kestrel/engine/data/fonts/OpenRunde-Medium.otf"
    ))
    .expect("Open Runde is a valid OpenType font")
}

fn scale(size: f32) -> PxScale {
    let font = font();
    PxScale::from(size * font.height_unscaled() / font.units_per_em().unwrap_or(1000.0))
}

fn glyphs(text: &str, size: f32) -> impl Iterator<Item = (GlyphId, f32)> + '_ {
    let font = font().into_scaled(scale(size));
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
    let font = font().into_scaled(scale(size));
    glyphs(text, size)
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
    let font = font();
    let factor = font.as_scaled(scale(size)).h_scale_factor();
    let mut path = PathBuilder::new();
    for (id, at) in glyphs(text, size) {
        let Some(outline) = font.outline(id) else {
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
    pixmap.fill_path(&path, &paint, FillRule::Winding, view, None);
}
