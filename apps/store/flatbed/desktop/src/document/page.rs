use std::fs;
use std::io::Cursor;
use std::path::{Path, PathBuf};

use fast_image_resize::images::{Image, ImageRef};
use fast_image_resize::{PixelType, Resizer};
use image::{DynamicImage, GrayImage, ImageFormat, RgbImage};
use jpeg_encoder::{ColorType, Encoder};
use serde::{Deserialize, Serialize};
use specta::Type;

use crate::imaging::{self, Cleaned, Mode, Origin, Quad};

const PAGE_QUALITY: u8 = 88;
const SOURCE_QUALITY: u8 = 95;
const THUMBNAIL_WIDTH: u32 = 360;

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Page {
    pub id: String,
    pub origin: Origin,
    pub quad: Quad,
    pub turns: u8,
    pub dpi: Option<f32>,
    pub source_size: (u32, u32),
    pub source_kind: Kind,
    pub shape: u32,
    pub version: u32,
    pub size: (u32, u32),
    pub developed: Option<Kind>,
}

#[derive(Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Kind {
    Jpeg,
    Png,
}

impl Kind {
    fn extension(self) -> &'static str {
        match self {
            Self::Jpeg => "jpg",
            Self::Png => "png",
        }
    }
}

pub struct Developed {
    version: u32,
    kind: Kind,
    size: (u32, u32),
    shape: u32,
    mode: Mode,
}

#[derive(Clone, Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct PageView {
    id: String,
    image: Option<String>,
    thumbnail: Option<String>,
    source: String,
    version: u32,
    width: u32,
    height: u32,
    quad: Quad,
    turns: u8,
}

pub enum Source {
    Encoded { bytes: Vec<u8>, kind: Kind },
    Pixels(RgbImage),
}

impl Page {
    pub fn new(
        id: String,
        folder: &Path,
        source: Source,
        origin: Origin,
        dpi: Option<f32>,
    ) -> Result<(Self, RgbImage), String> {
        let (pixels, bytes, kind) = match source {
            Source::Encoded { bytes, kind } => (decode(&bytes)?, bytes, kind),
            Source::Pixels(pixels) => {
                let bytes = jpeg(
                    pixels.as_raw(),
                    pixels.width(),
                    pixels.height(),
                    ColorType::Rgb,
                    SOURCE_QUALITY,
                )?;
                (pixels, bytes, Kind::Jpeg)
            }
        };
        let page = Self {
            id,
            origin,
            quad: imaging::suggest(&pixels, origin),
            turns: 0,
            dpi,
            source_size: pixels.dimensions(),
            source_kind: kind,
            shape: 0,
            version: 0,
            size: (0, 0),
            developed: None,
        };
        fs::write(page.source_path(folder), bytes).map_err(|error| error.to_string())?;
        Ok((page, pixels))
    }

    pub fn source_path(&self, folder: &Path) -> PathBuf {
        folder.join(format!(
            "{}-source.{}",
            self.id,
            self.source_kind.extension()
        ))
    }

    pub fn image_path(&self, folder: &Path) -> Option<PathBuf> {
        self.developed
            .map(|kind| folder.join(format!("{}-{}.{}", self.id, self.version, kind.extension())))
    }

    fn thumbnail_path(&self, folder: &Path) -> PathBuf {
        folder.join(format!("{}-{}-thumbnail.jpg", self.id, self.version))
    }

    pub fn load_source(&self, folder: &Path) -> Result<RgbImage, String> {
        decode(&fs::read(self.source_path(folder)).map_err(|error| error.to_string())?)
    }

    pub fn view(&self, folder: &Path) -> PageView {
        let text = |path: PathBuf| path.to_string_lossy().into_owned();
        PageView {
            id: self.id.clone(),
            image: self.image_path(folder).map(text),
            thumbnail: self.developed.map(|_| text(self.thumbnail_path(folder))),
            source: text(self.source_path(folder)),
            version: self.version,
            width: self.size.0,
            height: self.size.1,
            quad: self.quad,
            turns: self.turns,
        }
    }

    pub fn develop(
        &self,
        folder: &Path,
        source: &RgbImage,
        mode: Mode,
        version: u32,
    ) -> Result<Developed, String> {
        let cleaned = imaging::develop(source, &self.quad, self.turns, self.origin, mode);
        let (bytes, kind) = encode(&cleaned)?;
        let developed = Developed {
            version,
            kind,
            size: cleaned.size(),
            shape: self.shape,
            mode,
        };
        let names = Self {
            version,
            developed: Some(kind),
            ..self.clone()
        };
        fs::write(names.thumbnail_path(folder), thumbnail(&cleaned)?)
            .map_err(|error| error.to_string())?;
        fs::write(names.image_path(folder).expect("developed"), bytes)
            .map_err(|error| error.to_string())?;
        Ok(developed)
    }

    pub fn adopt(&mut self, folder: &Path, developed: Developed, mode: Mode) {
        let fresh = Self {
            version: developed.version,
            developed: Some(developed.kind),
            size: developed.size,
            ..self.clone()
        };
        let stale = if developed.shape == self.shape && developed.mode == mode {
            std::mem::replace(self, fresh)
        } else {
            fresh
        };
        stale.remove_developed(folder);
    }

    pub fn discard(&self, folder: &Path, developed: Developed) {
        Self {
            version: developed.version,
            developed: Some(developed.kind),
            ..self.clone()
        }
        .remove_developed(folder);
    }

    fn remove_developed(&self, folder: &Path) {
        if let Some(image) = self.image_path(folder) {
            let _ = fs::remove_file(image);
            let _ = fs::remove_file(self.thumbnail_path(folder));
        }
    }

    pub fn remove_files(&self, folder: &Path) {
        let _ = fs::remove_file(self.source_path(folder));
        self.remove_developed(folder);
    }
}

pub fn decode(bytes: &[u8]) -> Result<RgbImage, String> {
    let mut decoder = image::ImageReader::new(Cursor::new(bytes))
        .with_guessed_format()
        .map_err(|error| error.to_string())?
        .into_decoder()
        .map_err(|error| error.to_string())?;
    let orientation =
        image::ImageDecoder::orientation(&mut decoder).map_err(|error| error.to_string())?;
    let mut picture = DynamicImage::from_decoder(decoder).map_err(|error| error.to_string())?;
    picture.apply_orientation(orientation);
    Ok(picture.into_rgb8())
}

fn jpeg(
    pixels: &[u8],
    width: u32,
    height: u32,
    colour: ColorType,
    quality: u8,
) -> Result<Vec<u8>, String> {
    let mut out = Vec::new();
    let size = |value: u32| u16::try_from(value).map_err(|_| "The page is too large".to_string());
    Encoder::new(&mut out, quality)
        .encode(pixels, size(width)?, size(height)?, colour)
        .map_err(|error| error.to_string())?;
    Ok(out)
}

fn encode(cleaned: &Cleaned) -> Result<(Vec<u8>, Kind), String> {
    match cleaned {
        Cleaned::Colour(image) => Ok((
            jpeg(
                image.as_raw(),
                image.width(),
                image.height(),
                ColorType::Rgb,
                PAGE_QUALITY,
            )?,
            Kind::Jpeg,
        )),
        Cleaned::Grey(image) => Ok((
            jpeg(
                image.as_raw(),
                image.width(),
                image.height(),
                ColorType::Luma,
                PAGE_QUALITY,
            )?,
            Kind::Jpeg,
        )),
        Cleaned::BlackAndWhite(image) => Ok((png(image)?, Kind::Png)),
    }
}

pub fn png(image: &GrayImage) -> Result<Vec<u8>, String> {
    let mut out = Vec::new();
    image
        .write_to(&mut Cursor::new(&mut out), ImageFormat::Png)
        .map_err(|error| error.to_string())?;
    Ok(out)
}

fn thumbnail(cleaned: &Cleaned) -> Result<Vec<u8>, String> {
    let (width, height) = cleaned.size();
    let out_height =
        (u64::from(height) * u64::from(THUMBNAIL_WIDTH) / u64::from(width.max(1))).max(1) as u32;
    let (pixels, kind, colour) = match cleaned {
        Cleaned::Colour(image) => (image.as_raw(), PixelType::U8x3, ColorType::Rgb),
        Cleaned::Grey(image) | Cleaned::BlackAndWhite(image) => {
            (image.as_raw(), PixelType::U8, ColorType::Luma)
        }
    };
    let from = ImageRef::new(width, height, pixels, kind).map_err(|error| error.to_string())?;
    let mut to = Image::new(THUMBNAIL_WIDTH, out_height, kind);
    Resizer::new()
        .resize(&from, &mut to, None)
        .map_err(|error| error.to_string())?;
    jpeg(to.buffer(), THUMBNAIL_WIDTH, out_height, colour, 80)
}
