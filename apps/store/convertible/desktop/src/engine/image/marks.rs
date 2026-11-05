use std::fmt::Write;

use image::{Rgba, RgbaImage};
use resvg::{tiny_skia, usvg};

use super::edit::{blur_region, fill_region};
use crate::engine::error::{Failure, Result};
use crate::engine::job::{Mark, Point};

const REDACTED: Rgba<u8> = Rgba([0, 0, 0, 255]);
const FONT: &[u8] =
    include_bytes!("../../../../../../../packages/web/ui/fonts/OpenRunde-Medium.woff2");
const FONT_FAMILY: &str = "Open Runde";
const HEAD_LENGTH: f64 = 4.0;
const HEAD_ANGLE: f64 = 0.5;
const HIGHLIGHT_OPACITY: f64 = 0.38;

fn escaped(text: &str) -> String {
    text.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
}

fn arrow_head(from: Point, to: Point, width: f64) -> String {
    let angle = (to.y - from.y).atan2(to.x - from.x);
    let length = width * HEAD_LENGTH;
    let corner = |side: f64| {
        let turned = angle + side * HEAD_ANGLE;
        (to.x - length * turned.cos(), to.y - length * turned.sin())
    };
    let (left, right) = (corner(1.0), corner(-1.0));
    format!(
        "M{} {}L{} {}L{} {}Z",
        to.x, to.y, left.0, left.1, right.0, right.1
    )
}

fn line(svg: &mut String, from: Point, to: Point, color: &str, width: f64) {
    let _ = write!(
        svg,
        r#"<line x1="{}" y1="{}" x2="{}" y2="{}" stroke="{color}" stroke-width="{width}" stroke-linecap="round"/>"#,
        from.x, from.y, to.x, to.y
    );
}

fn shape(svg: &mut String, mark: &Mark) {
    match mark {
        Mark::Arrow {
            from,
            to,
            color,
            width,
        } => {
            line(svg, *from, *to, color, *width);
            let _ = write!(
                svg,
                r#"<path d="{}" fill="{color}"/>"#,
                arrow_head(*from, *to, *width)
            );
        }
        Mark::Line {
            from,
            to,
            color,
            width,
        } => line(svg, *from, *to, color, *width),
        Mark::Box { area, color, width } => {
            let _ = write!(
                svg,
                r#"<rect x="{}" y="{}" width="{}" height="{}" rx="{width}" fill="none" stroke="{color}" stroke-width="{width}"/>"#,
                area.x, area.y, area.width, area.height
            );
        }
        Mark::Ellipse { area, color, width } => {
            let _ = write!(
                svg,
                r#"<ellipse cx="{}" cy="{}" rx="{}" ry="{}" fill="none" stroke="{color}" stroke-width="{width}"/>"#,
                area.x + area.width / 2.0,
                area.y + area.height / 2.0,
                area.width / 2.0,
                area.height / 2.0
            );
        }
        Mark::Highlight { area, color } => {
            let _ = write!(
                svg,
                r#"<rect x="{}" y="{}" width="{}" height="{}" fill="{color}" fill-opacity="{HIGHLIGHT_OPACITY}"/>"#,
                area.x, area.y, area.width, area.height
            );
        }
        Mark::Text {
            at,
            text,
            color,
            size,
        } => {
            let _ = write!(
                svg,
                r#"<text x="{}" y="{}" font-family="{FONT_FAMILY}" font-weight="500" font-size="{size}" fill="{color}" xml:space="preserve">{}</text>"#,
                at.x,
                at.y,
                escaped(text)
            );
        }
        Mark::Blur { .. } | Mark::Redact { .. } => {}
    }
}

pub fn overlay(marks: &[Mark], width: u32, height: u32) -> Result<Option<tiny_skia::Pixmap>> {
    let mut body = String::new();
    marks.iter().for_each(|mark| shape(&mut body, mark));
    if body.is_empty() {
        return Ok(None);
    }
    let svg = format!(
        r#"<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}">{body}</svg>"#
    );
    let mut options = usvg::Options::default();
    let font = wuff::decompress_woff2(FONT).map_err(|error| Failure::damaged(error.to_string()))?;
    options.fontdb_mut().load_font_data(font);
    let tree = usvg::Tree::from_str(&svg, &options).map_err(Failure::damaged)?;
    let mut pixmap =
        tiny_skia::Pixmap::new(width, height).ok_or_else(|| Failure::damaged("size"))?;
    resvg::render(
        &tree,
        tiny_skia::Transform::identity(),
        &mut pixmap.as_mut(),
    );
    Ok(Some(pixmap))
}

pub fn composite(pixels: &mut [u8], overlay: &tiny_skia::Pixmap) {
    for (pixel, layer) in pixels
        .as_chunks_mut::<4>()
        .0
        .iter_mut()
        .zip(overlay.data().as_chunks::<4>().0)
    {
        let alpha = u16::from(layer[3]);
        if alpha == 0 {
            continue;
        }
        for channel in 0..3 {
            let under = u16::from(pixel[channel]) * (255 - alpha) / 255;
            pixel[channel] = (under + u16::from(layer[channel])).min(255) as u8;
        }
        pixel[3] = pixel[3].max(layer[3]);
    }
}

pub fn censor(canvas: &mut RgbaImage, marks: &[Mark]) {
    for mark in marks {
        match mark {
            Mark::Blur { area, strength } => blur_region(canvas, *area, *strength),
            Mark::Redact { area } => fill_region(canvas, *area, REDACTED),
            _ => {}
        }
    }
}

pub fn apply(canvas: &mut RgbaImage, marks: &[Mark]) -> Result<()> {
    censor(canvas, marks);
    if let Some(layer) = overlay(marks, canvas.width(), canvas.height())? {
        composite(canvas, &layer);
    }
    Ok(())
}
