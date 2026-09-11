use super::{resolve_icon_path, xdg};
use gio::prelude::*;
use gio_unix::DesktopAppInfo;
use luft_config::LuftConfig;
use std::{
    collections::HashSet,
    env, fs,
    path::{Path, PathBuf},
    sync::{Mutex, OnceLock},
    time::{Duration, Instant},
};

const APPLICATION_CACHE_TTL: Duration = Duration::from_secs(3);
type CachedApplications = Option<(Instant, Vec<AppEntry>)>;
static APPLICATION_CACHE: OnceLock<Mutex<CachedApplications>> = OnceLock::new();

#[derive(Debug, Clone)]
pub struct AppEntry {
    pub desktop_id: Option<String>,
    pub name: String,
    pub command: String,
    pub comment: Option<String>,
    pub icon: Option<String>,
    pub icon_path: Option<PathBuf>,
    pub startup_wm_class: Option<String>,
}

pub fn discover_applications(_config: &LuftConfig) -> Vec<AppEntry> {
    let cache = APPLICATION_CACHE.get_or_init(|| Mutex::new(None));
    let mut cache = cache.lock().expect("application cache");
    if let Some((scanned, entries)) = &*cache
        && scanned.elapsed() < APPLICATION_CACHE_TTL
    {
        return entries.clone();
    }
    let mut entries = gio::AppInfo::all()
        .into_iter()
        .filter_map(|app| app.downcast::<DesktopAppInfo>().ok())
        .filter(|app| app.should_show() && !app.is_hidden() && app.shows_in(Some("Luft")))
        .filter_map(entry)
        .collect::<Vec<_>>();
    entries.sort_by_cached_key(|app| app.name.to_lowercase());
    *cache = Some((Instant::now(), entries.clone()));
    entries
}

pub fn discover_user_autostart(_config: &LuftConfig) -> Vec<AppEntry> {
    let mut directories = xdg::config_home().into_iter().collect::<Vec<_>>();
    directories.extend(env::split_paths(
        &env::var_os("XDG_CONFIG_DIRS").unwrap_or_else(|| "/etc/xdg".into()),
    ));
    let mut seen = HashSet::new();
    let mut entries = Vec::new();
    for directory in directories {
        let Ok(files) = fs::read_dir(directory.join("autostart")) else {
            continue;
        };
        for file in files.flatten() {
            let path = file.path();
            if path.extension().is_none_or(|ext| ext != "desktop") || !seen.insert(file.file_name())
            {
                continue;
            }
            let Some(app) = DesktopAppInfo::from_filename(&path) else {
                continue;
            };
            if app.is_hidden()
                || !app.shows_in(Some("Luft"))
                || app
                    .string("X-GNOME-Autostart-enabled")
                    .is_some_and(|value| value == "false")
            {
                continue;
            }
            if let Some(app) = entry(app) {
                entries.push(app);
            }
        }
    }
    entries
}

fn entry(app: DesktopAppInfo) -> Option<AppEntry> {
    let path = app.filename()?;
    let icon = app.string("Icon").map(|value| value.to_string());
    Some(AppEntry {
        desktop_id: app
            .id()
            .map(|id| id.trim_end_matches(".desktop").to_owned()),
        name: app.name().to_string(),
        command: format!("desktop:{}", path.display()),
        comment: app.description().map(|value| value.to_string()),
        icon_path: resolve_icon_path(icon.as_deref()),
        icon,
        startup_wm_class: app.startup_wm_class().map(|value| value.to_string()),
    })
}

pub fn launch_desktop(path: &Path) -> Result<(), Box<dyn std::error::Error>> {
    let app = DesktopAppInfo::from_filename(path).ok_or("desktop entry is unavailable")?;
    let context = gio::AppLaunchContext::new();
    gio::glib::MainContext::new().block_on(app.launch_uris_future(&[], Some(&context)))?;
    Ok(())
}
