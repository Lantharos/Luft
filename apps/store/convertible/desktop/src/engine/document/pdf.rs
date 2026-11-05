use std::fs::{self, File};
use std::io::{BufWriter, Write};
use std::path::{Path, PathBuf};

use hayro::hayro_interpret::InterpreterSettings;
use hayro::hayro_syntax::Pdf;
use hayro::{PixmapSettings, RenderCache, RenderSettings, render};
use image::{DynamicImage, RgbaImage};
use lopdf::{Dictionary, Document, Object, ObjectId, Stream, dictionary};

use crate::engine::Progress;
use crate::engine::error::{Failure, Result};
use crate::engine::formats::{self, Family};
use crate::engine::image::decode;
use crate::engine::image::encode::{self, Settings};
use crate::engine::job::{Job, PageSize};
use crate::l10n::L10N;
use luft_i18n::t;

const POINTS_PER_INCH: f32 = 72.0;
const A4: (f32, f32) = (595.28, 841.89);
const LETTER: (f32, f32) = (612.0, 792.0);
const IMAGE_POINTS_PER_PIXEL: f32 = 0.75;

fn load_pdf(path: &Path) -> Result<Document> {
    let document = Document::load(path).map_err(Failure::damaged)?;
    if document.is_encrypted() {
        return Err(Failure::new(t!(L10N, "failure-password")));
    }
    Ok(document)
}

pub fn parse_pages(text: &str, count: u32) -> Result<Vec<u32>> {
    let invalid = || Failure::new(t!(L10N, "failure-pages", pages = text.to_owned()));
    if text.trim().is_empty() {
        return Ok((1..=count).collect());
    }
    let mut pages = Vec::new();
    for part in text.split(',') {
        let (start, end) = part.split_once('-').unwrap_or((part, part));
        let start: u32 = start.trim().parse().map_err(|_| invalid())?;
        let end: u32 = match end.trim() {
            "" => count,
            end => end.parse().map_err(|_| invalid())?,
        };
        if start == 0 || start > end || end > count {
            return Err(invalid());
        }
        pages.extend(start..=end);
    }
    Ok(pages)
}

fn pixmap_image(pixmap: hayro::vello_cpu::Pixmap) -> Result<DynamicImage> {
    let (width, height) = (u32::from(pixmap.width()), u32::from(pixmap.height()));
    let bytes = pixmap.data_as_u8_slice().to_vec();
    let image =
        RgbaImage::from_raw(width, height, bytes).ok_or_else(|| Failure::damaged("page"))?;
    Ok(DynamicImage::ImageRgba8(image))
}

fn open_hayro(path: &Path) -> Result<Pdf> {
    Pdf::new(fs::read(path)?).map_err(|error| match format!("{error:?}") {
        text if text.contains("Encrypt") || text.contains("Password") => {
            Failure::new(t!(L10N, "failure-password"))
        }
        text => Failure::damaged(text),
    })
}

pub fn page_count(path: &Path) -> Result<usize> {
    Ok(open_hayro(path)?.pages().len())
}

pub fn render_page(path: &Path, page: usize, dpi: u32) -> Result<DynamicImage> {
    let pdf = open_hayro(path)?;
    let pages = pdf.pages();
    let page = pages.get(page).ok_or_else(|| Failure::damaged("page"))?;
    rendered(page, dpi, &RenderCache::new())
}

fn rendered<'a>(
    page: &'a hayro::hayro_syntax::page::Page<'a>,
    dpi: u32,
    cache: &'a RenderCache<'a>,
) -> Result<DynamicImage> {
    let scale = dpi as f32 / POINTS_PER_INCH;
    let settings = PixmapSettings {
        x_scale: scale,
        y_scale: scale,
        ..PixmapSettings::default()
    };
    pixmap_image(render(
        page,
        cache,
        &InterpreterSettings::default(),
        &RenderSettings::default(),
        &settings,
    ))
}

pub fn to_images(job: &Job, progress: &Progress) -> Result<()> {
    let pdf = open_hayro(&job.inputs[0])?;
    let pages = pdf.pages();
    let chosen = parse_pages(&job.options.pages, pages.len() as u32)?;
    let single = chosen.len() == 1;
    if !single {
        fs::create_dir_all(&job.temp)?;
    }
    let cache = RenderCache::new();
    let width = pages.len().to_string().len();
    let extension = formats::extension_for(&job.format);
    let settings = Settings {
        quality: job.options.quality,
        lossless: false,
    };
    for (index, number) in chosen.iter().enumerate() {
        let page = &pages[*number as usize - 1];
        let image = rendered(page, job.options.dpi, &cache)?;
        let bytes = encode::encode(&image, &job.format, &settings)?;
        if single {
            fs::write(&job.temp, bytes)?;
        } else {
            fs::write(
                job.temp.join(format!("page-{number:0width$}.{extension}")),
                bytes,
            )?;
        }
        progress.report((index + 1) as f32 / chosen.len() as f32);
    }
    Ok(())
}

pub fn to_text(job: &Job) -> Result<()> {
    let document = load_pdf(&job.inputs[0])?;
    let chosen = parse_pages(&job.options.pages, document.get_pages().len() as u32)?;
    let text = document.extract_text(&chosen).map_err(Failure::damaged)?;
    fs::write(&job.temp, text)?;
    Ok(())
}

fn renumbered(path: &Path, next: &mut u32) -> Result<(Document, Vec<ObjectId>)> {
    let mut document = load_pdf(path)?;
    document.renumber_objects_with(*next);
    *next = document.max_id + 1;
    let pages = document.get_pages().into_values().collect();
    Ok((document, pages))
}

fn pages_root(target: &mut Document, kids: Vec<ObjectId>) -> ObjectId {
    let count = kids.len() as i64;
    let kids = kids.into_iter().map(Object::Reference).collect();
    let root = target.add_object(
        dictionary! { "Type" => "Pages", "Kids" => Object::Array(kids), "Count" => count },
    );
    let catalog = target.add_object(dictionary! { "Type" => "Catalog", "Pages" => root });
    target.trailer.set("Root", catalog);
    root
}

fn adopt_pages(target: &mut Document, pages: &[ObjectId], parent: ObjectId) -> Result<()> {
    for id in pages {
        let page = target.get_object_mut(*id).map_err(Failure::damaged)?;
        let dictionary = page.as_dict_mut().map_err(Failure::damaged)?;
        dictionary.set("Parent", parent);
    }
    Ok(())
}

fn inherit_attributes(document: &mut Document, pages: &[ObjectId]) {
    const INHERITED: [&[u8]; 4] = [b"Resources", b"MediaBox", b"CropBox", b"Rotate"];
    for id in pages {
        let mut found = Vec::new();
        for key in INHERITED {
            let Ok(page) = document.get_dictionary(*id) else {
                continue;
            };
            if page.has(key) {
                continue;
            }
            let mut parent = page.get(b"Parent").and_then(Object::as_reference).ok();
            while let Some(node) = parent.and_then(|id| document.get_dictionary(id).ok()) {
                if let Ok(value) = node.get(key) {
                    found.push((key, value.clone()));
                    break;
                }
                parent = node.get(b"Parent").and_then(Object::as_reference).ok();
            }
        }
        if let Ok(page) = document.get_dictionary_mut(*id) {
            found
                .into_iter()
                .for_each(|(key, value)| page.set(key, value));
        }
    }
}

pub fn merge(job: &Job, progress: &Progress) -> Result<()> {
    let mut target = Document::with_version("1.7");
    let mut next = 1;
    let mut every_page = Vec::new();
    for (index, input) in job.inputs.iter().enumerate() {
        let source = formats::detect(input).ok_or_else(|| Failure::unsupported("", "pdf"))?;
        let (mut document, pages) = if source.id == "pdf" {
            renumbered(input, &mut next)?
        } else if source.family == Family::Image {
            let document = image_document(std::slice::from_ref(input), job, next)?;
            next = document.max_id + 1;
            let pages = document.get_pages().into_values().collect();
            (document, pages)
        } else {
            return Err(Failure::unsupported(source.label, "PDF"));
        };
        inherit_attributes(&mut document, &pages);
        every_page.extend(pages);
        let Document {
            objects, max_id, ..
        } = document;
        target.objects.extend(objects);
        target.max_id = target.max_id.max(max_id);
        progress.report((index + 1) as f32 / job.inputs.len() as f32 * 0.9);
    }
    let root = pages_root(&mut target, every_page.clone());
    adopt_pages(&mut target, &every_page, root)?;
    target.prune_objects();
    target.renumber_objects();
    target.compress();
    save(&mut target, &job.temp)
}

fn save(document: &mut Document, path: &Path) -> Result<()> {
    let mut out = BufWriter::new(File::create(path)?);
    document.save_to(&mut out).map_err(Failure::damaged)?;
    out.flush()?;
    Ok(())
}

fn keep_pages(document: &mut Document, keep: &[u32]) {
    let pages: Vec<u32> = document
        .get_pages()
        .into_keys()
        .filter(|page| !keep.contains(page))
        .collect();
    document.delete_pages(&pages);
    document.prune_objects();
}

pub fn split(job: &Job, progress: &Progress) -> Result<()> {
    let source = load_pdf(&job.inputs[0])?;
    let count = source.get_pages().len() as u32;
    let chosen = parse_pages(&job.options.pages, count)?;
    if !job.options.split {
        let mut document = source;
        keep_pages(&mut document, &chosen);
        return save(&mut document, &job.temp);
    }
    fs::create_dir_all(&job.temp)?;
    let width = count.to_string().len();
    let stem = formats::file_stem(&job.inputs[0], formats::by_id("pdf"));
    for (index, page) in chosen.iter().enumerate() {
        let mut document = source.clone();
        keep_pages(&mut document, std::slice::from_ref(page));
        save(
            &mut document,
            &job.temp.join(format!("{stem} {page:0width$}.pdf")),
        )?;
        progress.report((index + 1) as f32 / chosen.len() as f32);
    }
    Ok(())
}

fn image_stream(path: &Path, job: &Job) -> Result<(Stream, u32, u32)> {
    let source = formats::detect(path).ok_or_else(|| Failure::unsupported("", "PDF"))?;
    let unedited =
        !job.edits.changes_pixels() && job.options.width.is_none() && job.options.height.is_none();
    if source.id == "jpeg" && unedited {
        let bytes = fs::read(path)?;
        let (width, height) = decode::dimensions(path).ok_or_else(|| Failure::damaged("jpeg"))?;
        let dictionary = dictionary! {
            "Type" => "XObject", "Subtype" => "Image", "Width" => width as i64, "Height" => height as i64,
            "ColorSpace" => jpeg_color_space(&bytes), "BitsPerComponent" => 8, "Filter" => "DCTDecode",
        };
        return Ok((Stream::new(dictionary, bytes), width, height));
    }
    let decoded = decode::decode(path, source)?;
    let image = crate::engine::image::edit::apply(decoded.image, &job.edits, &job.options)?;
    let rgb = image.to_rgb8();
    let (width, height) = rgb.dimensions();
    let dictionary = dictionary! {
        "Type" => "XObject", "Subtype" => "Image", "Width" => width as i64, "Height" => height as i64,
        "ColorSpace" => "DeviceRGB", "BitsPerComponent" => 8,
    };
    let mut stream = Stream::new(dictionary, rgb.into_raw());
    stream.compress().map_err(Failure::damaged)?;
    Ok((stream, width, height))
}

fn jpeg_color_space(bytes: &[u8]) -> &'static str {
    const START_OF_FRAME: [u8; 2] = [0xC0, 0xC2];
    let mut at = 2;
    while at + 9 < bytes.len() && bytes[at] == 0xFF {
        let marker = bytes[at + 1];
        let length = usize::from(u16::from_be_bytes([bytes[at + 2], bytes[at + 3]]));
        if START_OF_FRAME.contains(&marker) {
            return match bytes[at + 9] {
                1 => "DeviceGray",
                4 => "DeviceCMYK",
                _ => "DeviceRGB",
            };
        }
        at += 2 + length;
    }
    "DeviceRGB"
}

fn page_box(job: &Job, width: u32, height: u32) -> ((f32, f32), (f32, f32, f32, f32)) {
    let natural = (
        width as f32 * IMAGE_POINTS_PER_PIXEL,
        height as f32 * IMAGE_POINTS_PER_PIXEL,
    );
    let page = match job.options.page_size {
        PageSize::Fit => return (natural, (0.0, 0.0, natural.0, natural.1)),
        PageSize::A4 => A4,
        PageSize::Letter => LETTER,
    };
    let landscape = natural.0 > natural.1;
    let page = if landscape { (page.1, page.0) } else { page };
    let scale = (page.0 / natural.0).min(page.1 / natural.1).min(1.0);
    let (drawn_width, drawn_height) = (natural.0 * scale, natural.1 * scale);
    (
        page,
        (
            (page.0 - drawn_width) / 2.0,
            (page.1 - drawn_height) / 2.0,
            drawn_width,
            drawn_height,
        ),
    )
}

fn image_document(paths: &[PathBuf], job: &Job, first_id: u32) -> Result<Document> {
    let mut document = Document::with_version("1.7");
    document.max_id = first_id;
    let tree = document.new_object_id();
    let mut kids = Vec::with_capacity(paths.len());
    for path in paths {
        let (stream, width, height) = image_stream(path, job)?;
        let image = document.add_object(stream);
        let (page, (x, y, drawn_width, drawn_height)) = page_box(job, width, height);
        let content = format!("q {drawn_width} 0 0 {drawn_height} {x} {y} cm /Image Do Q");
        let content = document.add_object(Stream::new(Dictionary::new(), content.into_bytes()));
        let resources = dictionary! { "XObject" => dictionary! { "Image" => image } };
        let id = document.add_object(dictionary! {
            "Type" => "Page", "Parent" => tree, "Contents" => content, "Resources" => resources,
            "MediaBox" => vec![0.into(), 0.into(), page.0.into(), page.1.into()],
        });
        kids.push(Object::Reference(id));
    }
    let count = kids.len() as i64;
    document.objects.insert(
        tree,
        Object::Dictionary(dictionary! { "Type" => "Pages", "Kids" => kids, "Count" => count }),
    );
    let catalog = document.add_object(dictionary! { "Type" => "Catalog", "Pages" => tree });
    document.trailer.set("Root", catalog);
    Ok(document)
}

pub fn from_images(job: &Job) -> Result<()> {
    let mut document = image_document(&job.inputs, job, 1)?;
    save(&mut document, &job.temp)
}
