use gio::prelude::*;
use serde::{Deserialize, Serialize};

use luft_app::apps::{self, App};
use luft_i18n::t;
use specta::Type;

use crate::L10N;

struct Category {
    id: &'static str,
    types: &'static [&'static str],
}

const CATEGORIES: [Category; 9] = [
    Category {
        id: "browser",
        types: &[
            "x-scheme-handler/http",
            "x-scheme-handler/https",
            "text/html",
            "application/xhtml+xml",
        ],
    },
    Category {
        id: "email",
        types: &["x-scheme-handler/mailto"],
    },
    Category {
        id: "calendar",
        types: &["text/calendar"],
    },
    Category {
        id: "music",
        types: &[
            "audio/mpeg",
            "audio/flac",
            "audio/x-flac",
            "audio/ogg",
            "audio/x-vorbis+ogg",
            "audio/x-opus+ogg",
            "audio/opus",
            "audio/wav",
            "audio/x-wav",
            "audio/mp4",
            "audio/x-m4a",
            "audio/aac",
        ],
    },
    Category {
        id: "video",
        types: &[
            "video/mp4",
            "video/x-matroska",
            "video/webm",
            "video/quicktime",
            "video/x-msvideo",
            "video/mpeg",
            "video/ogg",
        ],
    },
    Category {
        id: "photos",
        types: &[
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/avif",
            "image/jxl",
            "image/heif",
            "image/bmp",
            "image/tiff",
        ],
    },
    Category {
        id: "text",
        types: &["text/plain"],
    },
    Category {
        id: "files",
        types: &["inode/directory"],
    },
    Category {
        id: "archives",
        types: &[
            "application/zip",
            "application/x-7z-compressed",
            "application/vnd.rar",
            "application/x-tar",
            "application/x-compressed-tar",
            "application/x-bzip2-compressed-tar",
            "application/x-xz-compressed-tar",
            "application/x-zstd-compressed-tar",
            "application/gzip",
            "application/x-bzip2",
            "application/x-xz",
            "application/zstd",
        ],
    },
];

#[derive(Serialize, Type)]
pub struct Handler {
    category: &'static str,
    apps: Vec<App>,
    current: Option<String>,
}

#[derive(Deserialize, Type)]
pub struct DefaultApp {
    category: String,
    app: String,
}

fn representative(category: &Category) -> &'static str {
    category.types[0]
}

pub fn list() -> Vec<Handler> {
    CATEGORIES
        .iter()
        .map(|category| {
            let kind = representative(category);
            let mut apps: Vec<App> = gio::AppInfo::all_for_type(kind)
                .iter()
                .filter_map(App::from_info)
                .collect();
            apps::sort_by_name(&mut apps);
            Handler {
                category: category.id,
                apps,
                current: gio::AppInfo::default_for_type(kind, false)
                    .and_then(|app| app.id())
                    .map(|id| id.to_string()),
            }
        })
        .collect()
}

pub fn set(DefaultApp { category, app }: DefaultApp) -> Result<(), String> {
    let category = CATEGORIES
        .iter()
        .find(|known| known.id == category)
        .ok_or_else(|| t!(L10N, "desktop-apps-kind-not-choosable"))?;
    let app =
        gio_unix::DesktopAppInfo::new(&app).ok_or_else(|| t!(L10N, "desktop-apps-uninstalled"))?;
    let supported = app.supported_types();
    let failed = |error: gio::glib::Error| error.to_string();
    app.set_as_default_for_type(representative(category))
        .map_err(failed)?;
    for kind in &category.types[1..] {
        if supported.iter().any(|supported| supported == kind) {
            app.set_as_default_for_type(kind).map_err(failed)?;
        }
    }
    Ok(())
}
