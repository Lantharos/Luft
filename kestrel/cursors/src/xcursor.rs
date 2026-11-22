use std::f32::consts::TAU;

use resvg::tiny_skia::{Pixmap, Transform};
use resvg::usvg::{Options, Tree};

use crate::draw::ANGLE;
use crate::set::Cursor;

const SIZES: [u32; 4] = [24, 32, 48, 64];
const FRAMES: u32 = 24;
const FRAME_MS: u32 = 75;
const SWAY_DEGREES: f32 = 28.0;
const GRID: f32 = 32.0;
const LIFT: &str = r##"<filter id="lift" x="-25%" y="-25%" width="150%" height="150%"><feDropShadow dx="0" dy=".8" stdDeviation=".9" flood-color="#000" flood-opacity=".32"/></filter>"##;

const MAGIC: &[u8; 4] = b"Xcur";
const HEADER_LEN: u32 = 16;
const TOC_ENTRY_LEN: u32 = 12;
const IMAGE_HEADER_LEN: u32 = 36;
const FILE_VERSION: u32 = 0x10000;
const IMAGE_TYPE: u32 = 0xfffd_0002;
const IMAGE_VERSION: u32 = 1;

struct Image {
    size: u32,
    hotspot: (u32, u32),
    delay: u32,
    pixels: Vec<u8>,
}

fn frames(art: &str) -> Vec<String> {
    if !art.contains(ANGLE) {
        return vec![art.to_owned()];
    }
    (0..FRAMES)
        .map(|frame| {
            let sway = SWAY_DEGREES * (TAU * frame as f32 / FRAMES as f32).sin();
            art.replace(ANGLE, &format!("{sway:.2}"))
        })
        .collect()
}

fn render(art: &str, size: u32) -> Vec<u8> {
    let svg = format!(
        r#"<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32"><defs>{LIFT}</defs><g filter="url(#lift)">{art}</g></svg>"#
    );
    let tree = Tree::from_str(&svg, &Options::default()).expect("cursor drawings are valid SVG");
    let mut pixmap = Pixmap::new(size, size).expect("cursor sizes are not zero");
    let scale = size as f32 / GRID;
    resvg::render(
        &tree,
        Transform::from_scale(scale, scale),
        &mut pixmap.as_mut(),
    );
    pixmap
        .data()
        .as_chunks::<4>()
        .0
        .iter()
        .flat_map(|&[red, green, blue, alpha]| [blue, green, red, alpha])
        .collect()
}

pub fn encode(cursor: &Cursor) -> Vec<u8> {
    let frames = frames(&cursor.art);
    let delay = if frames.len() > 1 { FRAME_MS } else { 0 };
    let images: Vec<Image> = SIZES
        .iter()
        .flat_map(|&size| {
            let scale = size as f32 / GRID;
            let hotspot = (
                (cursor.hotspot.0 * scale).round() as u32,
                (cursor.hotspot.1 * scale).round() as u32,
            );
            frames.iter().map(move |frame| Image {
                size,
                hotspot,
                delay,
                pixels: render(frame, size),
            })
        })
        .collect();

    let mut toc = Vec::new();
    let mut chunks = Vec::new();
    let mut offset = HEADER_LEN + TOC_ENTRY_LEN * images.len() as u32;
    for image in &images {
        for value in [IMAGE_TYPE, image.size, offset] {
            toc.extend(value.to_le_bytes());
        }
        let header = [
            IMAGE_HEADER_LEN,
            IMAGE_TYPE,
            image.size,
            IMAGE_VERSION,
            image.size,
            image.size,
            image.hotspot.0,
            image.hotspot.1,
            image.delay,
        ];
        header
            .iter()
            .for_each(|value| chunks.extend(value.to_le_bytes()));
        chunks.extend(&image.pixels);
        offset += IMAGE_HEADER_LEN + image.pixels.len() as u32;
    }

    let mut file = MAGIC.to_vec();
    for value in [HEADER_LEN, FILE_VERSION, images.len() as u32] {
        file.extend(value.to_le_bytes());
    }
    file.extend(toc);
    file.extend(chunks);
    file
}
