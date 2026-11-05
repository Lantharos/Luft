use std::path::Path;

use serde::{Deserialize, Serialize};
use specta::Type;

use super::document::pdf;
use super::error::{Failure, Result};
use super::formats::{self, Family, Format};
use super::image::decode;
use super::image::{self as images};
use super::media::probe::{self, MediaInfo};
use super::media::{frame, waveform};
use crate::l10n::L10N;
use luft_i18n::t;

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Details {
    pub width: Option<u32>,
    pub height: Option<u32>,
    pub animated: bool,
    pub pages: Option<u32>,
    pub media: Option<MediaInfo>,
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Proxy {
    pub width: u32,
    pub height: u32,
}

pub fn details(path: &Path, format: &Format) -> Result<Details> {
    let dimensions = (format.family == Family::Image)
        .then(|| decode::dimensions(path))
        .flatten();
    let media = match format.family {
        Family::Video | Family::Audio => Some(probe::discover(path)?),
        _ => None,
    };
    let frame_size = media
        .as_ref()
        .and_then(|media| media.video.as_ref())
        .map(|video| (video.width, video.height));
    let dimensions = dimensions.or(frame_size);
    Ok(Details {
        width: dimensions.map(|size| size.0),
        height: dimensions.map(|size| size.1),
        animated: decode::is_animated(path, format),
        pages: (format.id == "pdf")
            .then(|| pdf::page_count(path))
            .transpose()?
            .map(|pages| pages as u32),
        media,
    })
}

pub fn proxy(path: &Path, format: &Format, edge: u32, time: f64, out: &Path) -> Result<Proxy> {
    let dimensions = match format.family {
        Family::Image => images::proxy::write(path, format, edge, out)?,
        Family::Video => frame::write(path, time, edge, out)?,
        _ if format.id == "pdf" => {
            let page = pdf::render_page(path, time as usize, PDF_PREVIEW_DPI)?;
            let dimensions = (page.width(), page.height());
            images::proxy::store(&page, edge, out)?;
            dimensions
        }
        _ => return Err(Failure::new(t!(L10N, "failure-no-preview"))),
    };
    Ok(Proxy {
        width: dimensions.0,
        height: dimensions.1,
    })
}

const PDF_PREVIEW_DPI: u32 = 110;

pub fn peaks(path: &Path, duration: f64, buckets: usize) -> Result<Vec<f32>> {
    waveform::peaks(path, duration, buckets)
}

pub fn detected(path: &Path) -> Result<&'static Format> {
    formats::detect(path).ok_or_else(|| Failure::unsupported(&path.to_string_lossy(), ""))
}
