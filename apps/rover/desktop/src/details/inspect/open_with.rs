use gio::prelude::*;
use luft_app::apps::App;
use luft_app::launch;
use serde::Serialize;
use specta::Type;

#[derive(Serialize, Type)]
pub struct OpenWithApps {
    default: Option<App>,
    others: Vec<App>,
}

pub fn apps_for(path: &str) -> OpenWithApps {
    let Some(content_type) = gio::File::for_path(path)
        .query_info(
            gio::FILE_ATTRIBUTE_STANDARD_CONTENT_TYPE,
            gio::FileQueryInfoFlags::NONE,
            gio::Cancellable::NONE,
        )
        .ok()
        .and_then(|info| info.content_type())
    else {
        return OpenWithApps {
            default: None,
            others: Vec::new(),
        };
    };
    let default =
        gio::AppInfo::default_for_type(&content_type, false).and_then(|info| App::from_info(&info));
    let mut others: Vec<App> = gio::AppInfo::recommended_for_type(&content_type)
        .into_iter()
        .chain(gio::AppInfo::fallback_for_type(&content_type))
        .filter_map(|info| App::from_info(&info))
        .filter(|app| default.as_ref().is_none_or(|default| default.id != app.id))
        .collect();
    others.sort_by_cached_key(|app| app.name.to_lowercase());
    others.dedup_by(|a, b| a.id == b.id);
    OpenWithApps { default, others }
}

pub fn launch(path: &str, app: &str, token: Option<&str>) -> Result<bool, String> {
    let app = gio_unix::DesktopAppInfo::new(app).ok_or("This app is no longer installed")?;
    open_in(app.upcast_ref(), &gio::File::for_path(path), token)
}

pub fn launch_default(path: &str, token: Option<&str>) -> Result<bool, String> {
    let file = gio::File::for_path(path);
    let app = file
        .query_default_handler(gio::Cancellable::NONE)
        .map_err(|error| error.to_string())?;
    open_in(&app, &file, token)
}

fn open_in(app: &gio::AppInfo, file: &gio::File, token: Option<&str>) -> Result<bool, String> {
    if app.id().is_some_and(|id| id.starts_with(crate::APP_ID)) {
        return Ok(true);
    }
    launch::open_files(app, std::slice::from_ref(file), token)
        .map_err(|error| error.to_string())?;
    Ok(false)
}
