use gio::prelude::*;
use luft_app::apps::App;
use serde::Serialize;

const OWN_APP_PREFIX: &str = "com.lantharos.rover";

#[derive(Serialize)]
pub struct OpenWith {
    default: Option<App>,
    others: Vec<App>,
}

pub fn apps_for(path: &str) -> OpenWith {
    let Some(content_type) = gio::File::for_path(path)
        .query_info(
            gio::FILE_ATTRIBUTE_STANDARD_CONTENT_TYPE,
            gio::FileQueryInfoFlags::NONE,
            gio::Cancellable::NONE,
        )
        .ok()
        .and_then(|info| info.content_type())
    else {
        return OpenWith {
            default: None,
            others: Vec::new(),
        };
    };
    let default = gio::AppInfo::default_for_type(&content_type, false)
        .filter(is_foreign)
        .and_then(|info| App::from_info(&info));
    let mut others: Vec<App> = gio::AppInfo::recommended_for_type(&content_type)
        .into_iter()
        .chain(gio::AppInfo::fallback_for_type(&content_type))
        .filter(is_foreign)
        .filter_map(|info| App::from_info(&info))
        .filter(|app| default.as_ref().is_none_or(|default| default.id != app.id))
        .collect();
    others.sort_by_cached_key(|app| app.name.to_lowercase());
    others.dedup_by(|a, b| a.id == b.id);
    OpenWith { default, others }
}

pub fn launch(path: &str, app: &str) -> Result<(), String> {
    gio_unix::DesktopAppInfo::new(app)
        .ok_or("This app is no longer installed")?
        .launch(&[gio::File::for_path(path)], gio::AppLaunchContext::NONE)
        .map_err(|error| error.to_string())
}

fn is_foreign(info: &gio::AppInfo) -> bool {
    info.id().is_none_or(|id| !id.starts_with(OWN_APP_PREFIX))
}
