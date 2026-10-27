use crate::apps::appimage::{self, AppImage, Available};
use crate::apps::flatpak;

pub fn appimages() -> Vec<(AppImage, Available)> {
    let apps: Vec<AppImage> = appimage::list()
        .into_iter()
        .filter(|app| app.updatable)
        .collect();
    std::thread::scope(|scope| {
        let checks: Vec<_> = apps
            .into_iter()
            .map(|app| {
                scope.spawn(move || {
                    appimage::check(&app)
                        .ok()
                        .flatten()
                        .map(|available| (app, available))
                })
            })
            .collect();
        checks
            .into_iter()
            .filter_map(|check| check.join().ok().flatten())
            .collect()
    })
}

pub fn count() -> usize {
    std::thread::scope(|scope| {
        let flatpaks = scope.spawn(|| flatpak::updates().map(|updates| updates.len()).unwrap_or(0));
        let appimages = scope.spawn(|| appimages().len());
        flatpaks.join().unwrap_or(0) + appimages.join().unwrap_or(0)
    })
}
