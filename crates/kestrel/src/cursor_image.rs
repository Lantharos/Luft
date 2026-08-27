use luft_config::DEFAULT_CURSOR_THEME_DIR;
use std::{env, fs, path::PathBuf};

#[path = "backend/drm/cursor/name.rs"]
mod name;
const ARROW_WIDTH: u32 = 28;
const ARROW_HEIGHT: u32 = 28;
const CURSOR_IMAGE_SIZE: u32 = 24;

fn generated_cursor_pixels(width: u32, height: u32) -> (Vec<u8>, (u32, u32), String) {
    let mut pixels = vec![0; width as usize * height as usize * 4];
    for y in 0..ARROW_HEIGHT.min(height) {
        for x in 0..ARROW_WIDTH.min(width) {
            let coverage = arrow_coverage(x as f64 + 0.5, y as f64 + 0.5);
            let shadow = shadow_coverage(x as f64 + 0.5, y as f64 + 0.5);
            if shadow > 0.0 {
                write_argb(
                    &mut pixels,
                    width as usize * 4,
                    x,
                    y,
                    [0, 0, 0, (shadow * 120.0) as u8],
                );
            }
            if coverage > 0.0 {
                write_argb(
                    &mut pixels,
                    width as usize * 4,
                    x,
                    y,
                    [255, 255, 255, (coverage * 245.0) as u8],
                );
            }
        }
    }
    (pixels, (0, 0), "generated-default".to_string())
}

fn load_cursor_pixels(
    name: &str,
    max_width: u32,
    max_height: u32,
) -> Option<(Vec<u8>, (u32, u32), String)> {
    if let Some((bytes, cursor_name)) = cursor_theme_bytes(name)
        && let Some(image) = parse_xcursor(&bytes, max_width, max_height)
    {
        return Some(cursor_pixels_from_image(
            image,
            max_width,
            max_height,
            cursor_name,
        ));
    }

    let image = parse_xcursor(cursor_bytes(name), max_width, max_height)?;
    Some(cursor_pixels_from_image(
        image,
        max_width,
        max_height,
        name.to_string(),
    ))
}

fn cursor_pixels_from_image(
    image: XcursorImage,
    max_width: u32,
    max_height: u32,
    cursor_name: String,
) -> (Vec<u8>, (u32, u32), String) {
    let mut pixels = vec![0; max_width as usize * max_height as usize * 4];
    let copy_width = image.width.min(max_width);
    let copy_height = image.height.min(max_height);
    for y in 0..copy_height {
        for x in 0..copy_width {
            let src = (y as usize * image.width as usize + x as usize) * 4;
            let dst = (y as usize * max_width as usize + x as usize) * 4;
            pixels[dst..dst + 4].copy_from_slice(&image.pixels[src..src + 4]);
        }
    }
    (
        pixels,
        (
            image.xhot.min(max_width.saturating_sub(1)),
            image.yhot.min(max_height.saturating_sub(1)),
        ),
        cursor_name,
    )
}

fn cursor_theme_bytes(name: &str) -> Option<(Vec<u8>, String)> {
    let theme_dir = env::var_os("LUFT_CURSOR_THEME_DIR")
        .map(PathBuf::from)
        .or_else(default_cursor_theme_dir)?;
    let path = theme_dir.join("cursors").join(name);
    fs::read(&path)
        .ok()
        .map(|bytes| (bytes, path.display().to_string()))
}

fn default_cursor_theme_dir() -> Option<PathBuf> {
    let path = PathBuf::from(DEFAULT_CURSOR_THEME_DIR);
    path.join("cursors").is_dir().then_some(path)
}

fn cursor_bytes(name: &str) -> &'static [u8] {
    match name {
        "alias" => include_bytes!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/assets-aosp-cursors/cursors/alias"
        )),
        "all-scroll" => include_bytes!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/assets-aosp-cursors/cursors/all-scroll"
        )),
        "cell" => include_bytes!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/assets-aosp-cursors/cursors/cell"
        )),
        "context-menu" => include_bytes!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/assets-aosp-cursors/cursors/context-menu"
        )),
        "copy" => include_bytes!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/assets-aosp-cursors/cursors/copy"
        )),
        "crosshair" => include_bytes!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/assets-aosp-cursors/cursors/crosshair"
        )),
        "ew-resize" => include_bytes!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/assets-aosp-cursors/cursors/ew-resize"
        )),
        "grab" => include_bytes!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/assets-aosp-cursors/cursors/grab"
        )),
        "grabbing" => include_bytes!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/assets-aosp-cursors/cursors/grabbing"
        )),
        "help" => include_bytes!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/assets-aosp-cursors/cursors/help"
        )),
        "nesw-resize" => include_bytes!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/assets-aosp-cursors/cursors/nesw-resize"
        )),
        "no-drop" => include_bytes!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/assets-aosp-cursors/cursors/no-drop"
        )),
        "ns-resize" => include_bytes!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/assets-aosp-cursors/cursors/ns-resize"
        )),
        "nwse-resize" => include_bytes!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/assets-aosp-cursors/cursors/nwse-resize"
        )),
        "pointer" => include_bytes!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/assets-aosp-cursors/cursors/pointer"
        )),
        "text" => include_bytes!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/assets-aosp-cursors/cursors/text"
        )),
        "vertical-text" => include_bytes!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/assets-aosp-cursors/cursors/vertical-text"
        )),
        "wait" => include_bytes!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/assets-aosp-cursors/cursors/wait"
        )),
        "zoom-in" => include_bytes!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/assets-aosp-cursors/cursors/zoom-in"
        )),
        "zoom-out" => include_bytes!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/assets-aosp-cursors/cursors/zoom-out"
        )),
        _ => include_bytes!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/assets-aosp-cursors/cursors/default"
        )),
    }
}

struct XcursorImage {
    width: u32,
    height: u32,
    xhot: u32,
    yhot: u32,
    pixels: Vec<u8>,
}

fn parse_xcursor(bytes: &[u8], max_width: u32, max_height: u32) -> Option<XcursorImage> {
    if bytes.len() < 16 || &bytes[0..4] != b"Xcur" {
        return None;
    }
    let header_len = read_u32(bytes, 4)? as usize;
    let ntoc = read_u32(bytes, 12)? as usize;
    if bytes.len() < header_len || header_len < 16 {
        return None;
    }

    let mut best_offset = None;
    let mut best_size = u32::MAX;
    for index in 0..ntoc {
        let entry = 16 + index * 12;
        let chunk_type = read_u32(bytes, entry)?;
        if chunk_type != 0xfffd0002 {
            continue;
        }
        let nominal_size = read_u32(bytes, entry + 4)?;
        let offset = read_u32(bytes, entry + 8)? as usize;
        let fits = nominal_size <= max_width.min(max_height);
        let better = if fits {
            best_size > max_width.min(max_height) || nominal_size > best_size
        } else {
            nominal_size < best_size
        };
        if best_offset.is_none() || better {
            best_offset = Some(offset);
            best_size = nominal_size;
        }
    }

    let offset = best_offset?;
    if read_u32(bytes, offset + 4)? != 0xfffd0002 {
        return None;
    }
    let source_width = read_u32(bytes, offset + 16)?;
    let source_height = read_u32(bytes, offset + 20)?;
    let xhot = read_u32(bytes, offset + 24)?;
    let yhot = read_u32(bytes, offset + 28)?;
    let pixel_start = offset + 36;
    let pixel_count = source_width.checked_mul(source_height)? as usize;
    if bytes.len() < pixel_start + pixel_count * 4 {
        return None;
    }
    let width = source_width.min(max_width);
    let height = source_height.min(max_height);
    let mut pixels = Vec::with_capacity(pixel_count * 4);
    for y in 0..height {
        for x in 0..width {
            let index = y as usize * source_width as usize + x as usize;
            let pixel = read_u32(bytes, pixel_start + index * 4)?;
            pixels.push((pixel & 0xff) as u8);
            pixels.push(((pixel >> 8) & 0xff) as u8);
            pixels.push(((pixel >> 16) & 0xff) as u8);
            pixels.push(((pixel >> 24) & 0xff) as u8);
        }
    }
    Some(XcursorImage {
        width,
        height,
        xhot,
        yhot,
        pixels,
    })
}

fn read_u32(bytes: &[u8], offset: usize) -> Option<u32> {
    Some(u32::from_le_bytes(
        bytes.get(offset..offset + 4)?.try_into().ok()?,
    ))
}

fn arrow_coverage(x: f64, y: f64) -> f64 {
    supersampled_coverage(x, y, 0.0, 0.0)
}

fn shadow_coverage(x: f64, y: f64) -> f64 {
    supersampled_coverage(x, y, -1.2, -1.2)
}

fn supersampled_coverage(x: f64, y: f64, offset_x: f64, offset_y: f64) -> f64 {
    let mut covered = 0;
    for sample_y in 0..3 {
        for sample_x in 0..3 {
            let point = (
                x + offset_x + (f64::from(sample_x) - 1.0) / 3.0,
                y + offset_y + (f64::from(sample_y) - 1.0) / 3.0,
            );
            if arrow_contains(point) {
                covered += 1;
            }
        }
    }
    f64::from(covered) / 9.0
}

fn arrow_contains(point: (f64, f64)) -> bool {
    triangle_contains(point, (3.0, 2.0), (3.0, 23.0), (18.0, 15.0))
        || triangle_contains(point, (12.0, 15.0), (18.5, 26.0), (22.0, 24.0))
}

fn triangle_contains(point: (f64, f64), a: (f64, f64), b: (f64, f64), c: (f64, f64)) -> bool {
    let d1 = edge_sign(point, a, b);
    let d2 = edge_sign(point, b, c);
    let d3 = edge_sign(point, c, a);
    let has_negative = d1 < 0.0 || d2 < 0.0 || d3 < 0.0;
    let has_positive = d1 > 0.0 || d2 > 0.0 || d3 > 0.0;
    !(has_negative && has_positive)
}

fn edge_sign(point: (f64, f64), a: (f64, f64), b: (f64, f64)) -> f64 {
    (point.0 - b.0) * (a.1 - b.1) - (a.0 - b.0) * (point.1 - b.1)
}

fn write_argb(buffer: &mut [u8], pitch: usize, x: u32, y: u32, rgba: [u8; 4]) {
    let index = y as usize * pitch + x as usize * 4;
    if index + 3 >= buffer.len() {
        return;
    }
    let [r, g, b, a] = rgba;
    buffer[index] = b;
    buffer[index + 1] = g;
    buffer[index + 2] = r;
    buffer[index + 3] = a;
}

pub fn named_cursor_element(
    renderer: &mut smithay::backend::renderer::gles::GlesRenderer,
    icon: smithay::input::pointer::CursorIcon,
    position: smithay::utils::Point<i32, smithay::utils::Physical>,
) -> Option<
    smithay::backend::renderer::element::memory::MemoryRenderBufferRenderElement<
        smithay::backend::renderer::gles::GlesRenderer,
    >,
> {
    use smithay::{
        backend::{
            allocator::Fourcc,
            renderer::element::{
                Kind,
                memory::{MemoryRenderBuffer, MemoryRenderBufferRenderElement},
            },
        },
        input::pointer::CursorImageStatus,
        utils::{Size, Transform},
    };

    let image_size = (CURSOR_IMAGE_SIZE, CURSOR_IMAGE_SIZE);
    let name = name::cursor_name(&CursorImageStatus::Named(icon));
    let (pixels, hotspot, _) = load_cursor_pixels(name, image_size.0, image_size.1)
        .unwrap_or_else(|| generated_cursor_pixels(image_size.0, image_size.1));
    let buffer = MemoryRenderBuffer::from_slice(
        &pixels,
        Fourcc::Abgr8888,
        Size::from((image_size.0 as i32, image_size.1 as i32)),
        1,
        Transform::Normal,
        None,
    );
    MemoryRenderBufferRenderElement::from_buffer(
        renderer,
        (
            f64::from(position.x.saturating_sub(hotspot.0 as i32)),
            f64::from(position.y.saturating_sub(hotspot.1 as i32)),
        ),
        &buffer,
        None,
        None,
        None,
        Kind::Cursor,
    )
    .ok()
}
