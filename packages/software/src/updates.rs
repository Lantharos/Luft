use crate::appimage::{self, AppImage, Available};
use crate::classify::Classification;
use crate::flatpak;
use crate::packagekit::{self, Mode, Update};

pub struct PackageUpdates {
    pub system: Vec<Update>,
    pub apps: Vec<Update>,
}

impl PackageUpdates {
    pub fn load(mode: Mode) -> Result<Self, String> {
        let classification = Classification::current();
        let (apps, system) = packagekit::updates(mode)?
            .into_iter()
            .partition(|update| classification.is_app(&update.package.name));
        Ok(Self { system, apps })
    }
}

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

pub fn app_count(packages: &PackageUpdates) -> usize {
    std::thread::scope(|scope| {
        let flatpaks = scope.spawn(|| flatpak::updates().map(|updates| updates.len()).unwrap_or(0));
        let appimages = scope.spawn(|| appimages().len());
        packages.apps.len() + flatpaks.join().unwrap_or(0) + appimages.join().unwrap_or(0)
    })
}
