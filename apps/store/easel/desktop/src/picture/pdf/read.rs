use std::fs;
use std::path::Path;

use hayro::hayro_interpret::InterpreterSettings;
use hayro::hayro_syntax::Pdf;
use hayro::vello_cpu::color::palette::css::WHITE;
use hayro::{PixmapSettings, RenderCache, RenderSettings, render};
use luft_i18n::t;
use serde::Serialize;
use specta::Type;

use crate::files::{cache_file, failed};
use crate::l10n::L10N;
use crate::picture::decode::Decoded;

const POINTS_PER_INCH: f32 = 72.0;
const PAPER_DPI: f32 = 150.0;

#[derive(Serialize, Type)]
pub struct PageCount {
    pages: u32,
}

fn open(path: &Path) -> Result<Pdf, String> {
    Pdf::new(fs::read(path).map_err(failed)?).map_err(|error| match format!("{error:?}") {
        text if text.contains("Encrypt") || text.contains("Password") => {
            t!(L10N, "easel-error-pdf-locked")
        }
        text => text,
    })
}

pub fn page_count(path: &Path) -> Result<PageCount, String> {
    Ok(PageCount {
        pages: open(path)?.pages().len() as u32,
    })
}

pub fn render_page(path: &Path, page: u32, longest: u32) -> Result<Decoded, String> {
    let pdf = open(path)?;
    let pages = pdf.pages();
    let page = pages
        .get(page as usize)
        .ok_or_else(|| t!(L10N, "easel-error-pdf-no-page"))?;
    let (width, height) = page.render_dimensions();
    let scale = (PAPER_DPI / POINTS_PER_INCH).min(longest as f32 / width.max(height));
    let pixmap = render(
        page,
        &RenderCache::new(),
        &InterpreterSettings::default(),
        &RenderSettings::default(),
        &PixmapSettings {
            x_scale: scale,
            y_scale: scale,
            bg_color: WHITE,
        },
    );
    let target = cache_file("pixels")?;
    fs::write(&target, pixmap.data_as_u8_slice()).map_err(failed)?;
    Ok(Decoded::new(
        target,
        u32::from(pixmap.width()),
        u32::from(pixmap.height()),
    ))
}
