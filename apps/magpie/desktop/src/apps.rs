use std::path::Path;

use gio::prelude::*;
use luft_app::apps::{self, App};

const OWN_ID: &str = "com.lantharos.magpie";

fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
}

pub fn others(path: &Path) -> Vec<App> {
    let (mime, _) = gio::content_type_guess(Some(path), None);
    let mut others: Vec<App> = gio::AppInfo::all_for_type(&mime)
        .iter()
        .filter(|info| info.id().is_some_and(|id| !id.starts_with(OWN_ID)))
        .filter_map(App::from_info)
        .collect();
    apps::sort_by_name(&mut others);
    others
}

pub fn open_with(path: &Path, app: &str) -> Result<(), String> {
    let info = gio_unix::DesktopAppInfo::new(app).ok_or("That app is no longer installed")?;
    info.launch(&[gio::File::for_path(path)], gio::AppLaunchContext::NONE)
        .map_err(failed)
}

pub fn open_uri(uri: &str) -> Result<(), String> {
    gio::AppInfo::launch_default_for_uri(uri, gio::AppLaunchContext::NONE).map_err(failed)
}
