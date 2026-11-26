use luft_i18n::t;
use std::io::Write;
use std::path::Path;

use krilla::Document;
use krilla::geom::Size;
use krilla::page::PageSettings;
use krilla_svg::{SurfaceExt, SvgSettings};

use crate::files::{failed, write_atomically};
use crate::l10n::L10N;

pub fn write(path: &Path, svg: &[u8]) -> Result<(), String> {
    let mut options = usvg::Options::default();
    options.fontdb_mut().load_system_fonts();
    let tree = usvg::Tree::from_data(svg, &options).map_err(failed)?;
    let size = tree.size();
    let mut document = Document::new();
    let mut page = document.start_page_with(PageSettings::new(
        Size::from_wh(size.width(), size.height())
            .ok_or_else(|| t!(L10N, "easel-error-empty-board"))?,
    ));
    let mut surface = page.surface();
    surface.draw_svg(
        &tree,
        Size::from_wh(size.width(), size.height())
            .ok_or_else(|| t!(L10N, "easel-error-empty-board"))?,
        SvgSettings::default(),
    );
    surface.finish();
    page.finish();
    let pdf = document.finish().map_err(|error| format!("{error:?}"))?;
    write_atomically(path, |file| file.write_all(&pdf).map_err(failed))
}
