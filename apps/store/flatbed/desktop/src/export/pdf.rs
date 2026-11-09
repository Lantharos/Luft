use std::fs;
use std::io::{Cursor, Write};
use std::path::Path;

use flate2::Compression;
use flate2::write::ZlibEncoder;
use image::codecs::jpeg::JpegDecoder;
use image::{GrayImage, ImageDecoder};
use pdf_writer::{Content, Filter, Finish, Name, Pdf, Rect, Ref, TextStr};

use super::text::{self, Letters, Placement};
use crate::document::{Kind, Page, Word};
use crate::settings::PaperSize;

const POINTS_PER_INCH: f32 = 72.0;
const A4: (f32, f32) = (595.28, 841.89);
const LETTER: (f32, f32) = (612.0, 792.0);
/// How close a page's proportions must be to a paper size to take it.
const SAME_SHAPE: f32 = 0.04;

pub struct Sheet<'a> {
    pub page: &'a Page,
    pub image: Vec<u8>,
    pub words: Option<Vec<Word>>,
}

/// The size a page is printed at, in points.
fn page_size(page: &Page, paper: PaperSize) -> (f32, f32) {
    let (width, height) = (page.size.0 as f32, page.size.1 as f32);
    let landscape = width > height;
    let oriented = |(short, long): (f32, f32)| {
        if landscape {
            (long, short)
        } else {
            (short, long)
        }
    };
    match paper {
        PaperSize::A4 => oriented(A4),
        PaperSize::Letter => oriented(LETTER),
        PaperSize::Automatic => {
            if let Some(dpi) = page.dpi {
                return (
                    width / dpi * POINTS_PER_INCH,
                    height / dpi * POINTS_PER_INCH,
                );
            }
            let proportion = width.max(height) / width.min(height);
            let close = |(short, long): (f32, f32)| {
                ((long / short) - proportion).abs() / proportion <= SAME_SHAPE
            };
            match [A4, LETTER].into_iter().find(|size| close(*size)) {
                Some(size) => oriented(size),
                None => {
                    let short = A4.0;
                    if landscape {
                        (short * proportion, short)
                    } else {
                        (short, short * proportion)
                    }
                }
            }
        }
    }
}

/// A black and white page as one bit per pixel, packed and compressed.
fn packed_bits(png: &[u8]) -> Result<(Vec<u8>, u32, u32), String> {
    let image: GrayImage = image::load_from_memory(png)
        .map_err(|error| error.to_string())?
        .into_luma8();
    let (width, height) = image.dimensions();
    let row_bytes = width.div_ceil(8) as usize;
    let mut bits = vec![0u8; row_bytes * height as usize];
    for (x, y, pixel) in image.enumerate_pixels() {
        if pixel.0[0] > 127 {
            bits[y as usize * row_bytes + x as usize / 8] |= 0x80 >> (x % 8);
        }
    }
    let mut encoder = ZlibEncoder::new(Vec::new(), Compression::default());
    encoder
        .write_all(&bits)
        .map_err(|error| error.to_string())?;
    Ok((
        encoder.finish().map_err(|error| error.to_string())?,
        width,
        height,
    ))
}

/// Whether a JPEG has one channel, read from its header alone.
fn is_grey_jpeg(bytes: &[u8]) -> bool {
    JpegDecoder::new(Cursor::new(bytes))
        .is_ok_and(|decoder| decoder.color_type().channel_count() == 1)
}

pub fn write(path: &Path, title: &str, sheets: &[Sheet], paper: PaperSize) -> Result<(), String> {
    let mut pdf = Pdf::new();
    let mut last = 0;
    let mut next = || {
        last += 1;
        Ref::new(last)
    };
    let (catalog, tree, info) = (next(), next(), next());
    let mut letters = Letters::default();
    let mut pages = Vec::new();
    for sheet in sheets {
        let (page_width, page_height) = page_size(sheet.page, paper);
        let (pixels_wide, pixels_high) = sheet.page.size;
        let scale = (page_width / pixels_wide as f32).min(page_height / pixels_high as f32);
        let placement = Placement {
            scale,
            left: (page_width - pixels_wide as f32 * scale) / 2.0,
            bottom: (page_height - pixels_high as f32 * scale) / 2.0,
            height: pixels_high,
        };
        let mut content = Content::new();
        content.save_state();
        content.transform([
            pixels_wide as f32 * scale,
            0.0,
            0.0,
            pixels_high as f32 * scale,
            placement.left,
            placement.bottom,
        ]);
        content.x_object(Name(b"Page"));
        content.restore_state();
        if let Some(words) = &sheet.words {
            text::draw(&mut content, &mut letters, words, &placement);
        }
        let (page, contents, image) = (next(), next(), next());
        pages.push((
            page,
            contents,
            image,
            page_width,
            page_height,
            content.finish(),
        ));
    }
    let fonts = letters.write(&mut pdf, &mut next);
    for ((page, contents, image, width, height, content), sheet) in pages.iter().zip(sheets) {
        let mut writer = pdf.page(*page);
        writer.parent(tree);
        writer.media_box(Rect::new(0.0, 0.0, *width, *height));
        writer.contents(*contents);
        let mut resources = writer.resources();
        resources.x_objects().pair(Name(b"Page"), *image);
        let mut font_names = resources.fonts();
        for (index, font) in fonts.iter().enumerate() {
            font_names.pair(Name(Letters::font_name(index).as_bytes()), *font);
        }
        font_names.finish();
        resources.finish();
        writer.finish();
        pdf.stream(*contents, content);
        match sheet.page.developed {
            Some(Kind::Png) => {
                let (bits, width, height) = packed_bits(&sheet.image)?;
                let mut xobject = pdf.image_xobject(*image, &bits);
                xobject.filter(Filter::FlateDecode);
                xobject.width(width as i32);
                xobject.height(height as i32);
                xobject.color_space().device_gray();
                xobject.bits_per_component(1);
            }
            _ => {
                let mut xobject = pdf.image_xobject(*image, &sheet.image);
                xobject.filter(Filter::DctDecode);
                xobject.width(sheet.page.size.0 as i32);
                xobject.height(sheet.page.size.1 as i32);
                if is_grey_jpeg(&sheet.image) {
                    xobject.color_space().device_gray();
                } else {
                    xobject.color_space().device_rgb();
                }
                xobject.bits_per_component(8);
            }
        }
    }
    pdf.catalog(catalog).pages(tree);
    pdf.pages(tree)
        .kids(pages.iter().map(|(page, ..)| *page))
        .count(pages.len() as i32);
    let mut details = pdf.document_info(info);
    details.title(TextStr(title));
    details.producer(TextStr("Flatbed"));
    details.finish();
    fs::write(path, pdf.finish()).map_err(|error| error.to_string())
}
