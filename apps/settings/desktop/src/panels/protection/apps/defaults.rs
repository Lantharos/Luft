use gio::prelude::*;
use serde::{Deserialize, Serialize};

use luft_app::apps::{self, App};
use luft_i18n::t;
use specta::Type;

use crate::L10N;

#[derive(Serialize, Deserialize, Type, Clone, Copy)]
#[serde(rename_all = "lowercase")]
pub enum AppCategory {
    Browser,
    Email,
    Calendar,
    Music,
    Video,
    Photos,
    Text,
    Files,
    Archives,
}

const CATEGORIES: [AppCategory; 9] = [
    AppCategory::Browser,
    AppCategory::Email,
    AppCategory::Calendar,
    AppCategory::Music,
    AppCategory::Video,
    AppCategory::Photos,
    AppCategory::Text,
    AppCategory::Files,
    AppCategory::Archives,
];

impl AppCategory {
    fn types(self) -> &'static [&'static str] {
        match self {
            Self::Browser => &[
                "x-scheme-handler/http",
                "x-scheme-handler/https",
                "text/html",
                "application/xhtml+xml",
            ],
            Self::Email => &["x-scheme-handler/mailto"],
            Self::Calendar => &["text/calendar"],
            Self::Music => &[
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
            Self::Video => &[
                "video/mp4",
                "video/x-matroska",
                "video/webm",
                "video/quicktime",
                "video/x-msvideo",
                "video/mpeg",
                "video/ogg",
            ],
            Self::Photos => &[
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
            Self::Text => &["text/plain"],
            Self::Files => &["inode/directory"],
            Self::Archives => &[
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
        }
    }

    fn representative(self) -> &'static str {
        self.types()[0]
    }
}

#[derive(Serialize, Type)]
pub struct Handler {
    category: AppCategory,
    apps: Vec<App>,
    current: Option<String>,
}

#[derive(Deserialize, Type)]
pub struct DefaultApp {
    category: AppCategory,
    app: String,
}

pub fn list() -> Vec<Handler> {
    CATEGORIES
        .into_iter()
        .map(|category| {
            let kind = category.representative();
            let mut apps: Vec<App> = gio::AppInfo::all_for_type(kind)
                .iter()
                .filter_map(App::from_info)
                .collect();
            apps::sort_by_name(&mut apps);
            Handler {
                category,
                apps,
                current: gio::AppInfo::default_for_type(kind, false)
                    .and_then(|app| app.id())
                    .map(|id| id.to_string()),
            }
        })
        .collect()
}

pub fn set(DefaultApp { category, app }: DefaultApp) -> Result<(), String> {
    let app =
        gio_unix::DesktopAppInfo::new(&app).ok_or_else(|| t!(L10N, "desktop-apps-uninstalled"))?;
    let supported = app.supported_types();
    let failed = |error: gio::glib::Error| error.to_string();
    app.set_as_default_for_type(category.representative())
        .map_err(failed)?;
    for kind in &category.types()[1..] {
        if supported.iter().any(|supported| supported == kind) {
            app.set_as_default_for_type(kind).map_err(failed)?;
        }
    }
    Ok(())
}
