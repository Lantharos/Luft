mod common;

use std::fs;

use common::{job, run};
use convertible_lib::engine::font;
use skrifa::{FontRef, raw::TableProvider};
use tempfile::tempdir;

const SOURCE: &str = concat!(
    env!("CARGO_MANIFEST_DIR"),
    "/../../../../packages/web/ui/fonts/OpenRunde-Regular.woff2"
);

#[test]
fn fonts_keep_every_glyph_between_formats() {
    let folder = tempdir().unwrap();
    let source = std::path::Path::new(SOURCE);
    let extension = font::outlines(source).unwrap();
    let unpacked = fs::read(
        run(&job(
            &[source],
            folder.path(),
            &format!("font.{extension}"),
            extension,
        ))
        .unwrap(),
    )
    .unwrap();
    let glyphs = FontRef::new(&unpacked)
        .unwrap()
        .maxp()
        .unwrap()
        .num_glyphs();

    let plain = folder.path().join(format!("font.{extension}"));
    let woff = run(&job(&[&plain], folder.path(), "out.woff", "woff")).unwrap();
    let woff2 = run(&job(&[&plain], folder.path(), "out.woff2", "woff2")).unwrap();
    for packed in [woff, woff2] {
        let back = run(&job(
            &[&packed],
            folder.path(),
            &format!("back.{extension}"),
            extension,
        ))
        .unwrap();
        let bytes = fs::read(&back).unwrap();
        assert_eq!(
            FontRef::new(&bytes).unwrap().maxp().unwrap().num_glyphs(),
            glyphs
        );
        fs::remove_file(back).unwrap();
    }
}
