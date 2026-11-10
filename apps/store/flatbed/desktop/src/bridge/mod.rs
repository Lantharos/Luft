mod params;

use std::fs;
use std::path::Path;

use luft_app::portal::{self, FileChooser, Filter, uri_path};
use luft_app::{Commands, Empty, share};
use sabine::SabineWindow;

use crate::document::{self, Kind, Source};
use crate::imaging::Origin;
use crate::settings;
use crate::{camera, export, scanners, state};
use params::*;

const PICTURES: [&str; 14] = [
    "*.jpg", "*.jpeg", "*.png", "*.webp", "*.tif", "*.tiff", "*.bmp", "*.JPG", "*.JPEG", "*.PNG",
    "*.WEBP", "*.TIF", "*.TIFF", "*.BMP",
];

async fn choose_pictures(Choose { title, filter }: Choose) -> Result<Vec<String>, String> {
    let pictures = dirs::picture_dir();
    let chooser = FileChooser {
        title: &title,
        filters: vec![Filter {
            name: &filter,
            patterns: PICTURES.map(String::from).to_vec(),
        }],
        multiple: true,
        current_folder: pictures.as_deref(),
        ..FileChooser::default()
    };
    Ok(chooser
        .open()
        .await?
        .iter()
        .filter_map(|uri| uri_path(uri))
        .map(|path| path.to_string_lossy().into_owned())
        .collect())
}

fn import(paths: &[String]) -> u32 {
    let mut added = 0;
    for path in paths {
        let Ok(bytes) = fs::read(path) else {
            continue;
        };
        let source = if bytes.starts_with(&[0xff, 0xd8]) {
            Source::Encoded {
                bytes,
                kind: Kind::Jpeg,
            }
        } else if bytes.starts_with(b"\x89PNG") {
            Source::Encoded {
                bytes,
                kind: Kind::Png,
            }
        } else {
            match document::decode(&bytes) {
                Ok(pixels) => Source::Pixels(pixels),
                Err(_) => continue,
            }
        };
        if document::add(source, Origin::Picture, None).is_ok() {
            added += 1;
        }
    }
    added
}

async fn blocking<T: Send + 'static>(
    work: impl FnOnce() -> T + Send + 'static,
) -> Result<T, String> {
    tokio::task::spawn_blocking(work)
        .await
        .map_err(|error| error.to_string())
}

pub fn register(window: SabineWindow) -> SabineWindow {
    let window = scanners::declare(export::declare(camera::register(window)));
    window
        .bridge_event(&document::CHANGED)
        .command_async("app_state", |Empty {}| state::app_state())
        .command_async("choose_pictures", choose_pictures)
        .command_async("import_pictures", |Paths { paths }| {
            blocking(move || import(&paths))
        })
        .command("page_corners", |Corners { id, quad }| {
            document::set_corners(&id, quad)
        })
        .command("page_turn", |Turn { id, quarters }| {
            document::turn(&id, quarters)
        })
        .command("page_remove", |Id { id }| {
            document::remove(&id);
            Ok(())
        })
        .command("pages_reorder", |Order { ids }| {
            document::reorder(&ids);
            Ok(())
        })
        .command("document_mode", |SetMode { mode }| {
            document::set_mode(mode);
            Ok(())
        })
        .command("document_clear", |Empty {}| {
            document::clear();
            Ok(())
        })
        .command("scan_start", |Scan { scanner, feed }| {
            scanners::scan(&scanner, feed)
        })
        .command("scan_cancel", |Empty {}| {
            scanners::cancel();
            Ok(())
        })
        .command_async("scanner_add", |Address { address }| async move {
            blocking(move || scanners::add_address(&address)).await?
        })
        .command_async("scanner_trust", |Id { id }| async move {
            blocking(move || scanners::trust(&id)).await?
        })
        .command("settings_save", |chosen: Preferences| {
            settings::update(|settings| {
                settings.languages = chosen.languages;
                settings.paper = chosen.paper;
                settings.fine = chosen.fine;
                settings.scanner = chosen.scanner;
            })
            .map(drop)
        })
        .command_async("save", export::save)
        .command_async("reveal", |Saved { path, token }| async move {
            portal::reveal(Path::new(&path), token.as_deref()).await
        })
        .command_async("send", |Files { files }| async move {
            share::send(&files).await
        })
}
