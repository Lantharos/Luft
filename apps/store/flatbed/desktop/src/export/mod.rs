mod pdf;
mod text;

use std::fs;
use std::path::{Path, PathBuf};

use image::codecs::png::PngEncoder;
use image::{ExtendedColorType, ImageEncoder};
use jpeg_encoder::{ColorType, Encoder};
use luft_app::portal::{FileChooser, Filter, uri_path};
use sabine::{BridgeEvent, SabineWindow};
use serde::{Deserialize, Serialize};
use specta::Type;

use crate::document::{self, Page};
use crate::imaging::{self, Cleaned, Mode};
use crate::settings::PaperSize;
use crate::{EVENTS, settings};

pub const PROGRESS: BridgeEvent<f32> = BridgeEvent::new("save.progress");

const JPEG_QUALITY: u8 = 92;

#[derive(Clone, Copy, PartialEq, Eq, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub enum Format {
    Pdf,
    Jpeg,
    Png,
}

impl Format {
    fn extension(self) -> &'static str {
        match self {
            Self::Pdf => "pdf",
            Self::Jpeg => "jpg",
            Self::Png => "png",
        }
    }
}

#[derive(Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Save {
    pub format: Format,
    pub searchable: bool,
    /// The file's name without its extension.
    pub name: String,
    /// The file chooser's title.
    pub title: String,
    /// What the file chooser calls files of this format.
    pub filter: String,
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Saved {
    /// The file, or the folder the pages went into.
    pub path: String,
    pub files: u32,
}

/// Asks where to save and saves the document there: one file, or a folder
/// for a picture of each page.
pub async fn save(request: Save) -> Result<Option<Saved>, String> {
    let (pages, mode, _) = document::snapshot();
    if pages.is_empty() {
        return Ok(None);
    }
    let one_file = request.format == Format::Pdf || pages.len() == 1;
    let file_name = format!("{}.{}", request.name, request.format.extension());
    let documents = dirs::document_dir();
    let chooser = FileChooser {
        title: &request.title,
        filters: vec![Filter {
            name: &request.filter,
            patterns: vec![format!("*.{}", request.format.extension())],
        }],
        directory: !one_file,
        current_name: one_file.then_some(file_name.as_str()),
        current_folder: documents.as_deref(),
        ..FileChooser::default()
    };
    let chosen = if one_file {
        chooser.save().await?
    } else {
        chooser.open().await?.into_iter().next()
    };
    let Some(target) = chosen.and_then(|uri| uri_path(&uri)) else {
        return Ok(None);
    };
    let paper = settings::current().paper;
    tokio::task::spawn_blocking(move || match request.format {
        Format::Pdf => save_pdf(&target, &request.name, &pages, paper, request.searchable),
        format => save_pictures(&target, &request.name, &pages, mode, format),
    })
    .await
    .map_err(|error| error.to_string())?
    .map(Some)
}

fn progress(done: usize, total: usize) {
    EVENTS.emit(PROGRESS, done as f32 / total.max(1) as f32);
}

fn save_pdf(
    path: &Path,
    name: &str,
    pages: &[Page],
    paper: PaperSize,
    searchable: bool,
) -> Result<Saved, String> {
    let folder = document::folder();
    let sheets = pages
        .iter()
        .enumerate()
        .map(|(index, page)| {
            let image = page.image_path(&folder).ok_or("A page isn't ready yet")?;
            let words = if searchable {
                document::read_page(page)?
            } else {
                None
            };
            progress(index + 1, pages.len() + 1);
            Ok(pdf::Sheet {
                page,
                image: fs::read(image).map_err(|error| error.to_string())?,
                words,
            })
        })
        .collect::<Result<Vec<_>, String>>()?;
    pdf::write(path, name, &sheets, paper)?;
    progress(1, 1);
    Ok(Saved {
        path: path.to_string_lossy().into_owned(),
        files: 1,
    })
}

fn picture(cleaned: &Cleaned, format: Format) -> Result<Vec<u8>, String> {
    let (pixels, (width, height), colour) = match cleaned {
        Cleaned::Colour(image) => (image.as_raw(), image.dimensions(), ColorType::Rgb),
        Cleaned::Grey(image) | Cleaned::BlackAndWhite(image) => {
            (image.as_raw(), image.dimensions(), ColorType::Luma)
        }
    };
    let mut out = Vec::new();
    if format == Format::Jpeg {
        let size =
            |value: u32| u16::try_from(value).map_err(|_| "The page is too large".to_string());
        Encoder::new(&mut out, JPEG_QUALITY)
            .encode(pixels, size(width)?, size(height)?, colour)
            .map_err(|error| error.to_string())?;
    } else {
        let layout = if colour == ColorType::Rgb {
            ExtendedColorType::Rgb8
        } else {
            ExtendedColorType::L8
        };
        PngEncoder::new(&mut out)
            .write_image(pixels, width, height, layout)
            .map_err(|error| error.to_string())?;
    }
    Ok(out)
}

/// Each page developed afresh and saved as a picture of its own: into the
/// file chosen for one page, or numbered in the folder chosen for several.
fn save_pictures(
    target: &Path,
    name: &str,
    pages: &[Page],
    mode: Mode,
    format: Format,
) -> Result<Saved, String> {
    for (index, page) in pages.iter().enumerate() {
        let source = document::source_of(page)?;
        let cleaned = imaging::develop(&source, &page.quad, page.turns, page.origin, mode);
        let path: PathBuf = if pages.len() == 1 {
            target.to_path_buf()
        } else {
            target.join(format!("{name} {}.{}", index + 1, format.extension()))
        };
        fs::write(&path, picture(&cleaned, format)?).map_err(|error| error.to_string())?;
        progress(index + 1, pages.len());
    }
    Ok(Saved {
        path: target.to_string_lossy().into_owned(),
        files: pages.len() as u32,
    })
}

pub fn declare(window: SabineWindow) -> SabineWindow {
    window.bridge_event(&PROGRESS)
}
