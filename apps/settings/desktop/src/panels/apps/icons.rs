use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::OnceLock;

use gio::glib;
use gio::prelude::*;

const FALLBACK_THEME: &str = "hicolor";
const IDEAL_SIZE: u32 = 128;
const SMALLEST_GOOD_SIZE: u32 = 48;
const EXTENSIONS: [&str; 2] = ["svg", "png"];
const FLATPAK_EXPORTS: &str = "/var/lib/flatpak/exports/share";
const PIXMAPS: &str = "/usr/share/pixmaps";

static INDEX: OnceLock<HashMap<String, PathBuf>> = OnceLock::new();

pub fn lookup(name: &str) -> Option<PathBuf> {
    INDEX.get_or_init(build).get(name).cloned()
}

fn build() -> HashMap<String, PathBuf> {
    let bases = icon_bases();
    let mut index = HashMap::new();
    for theme in theme_chain(&bases) {
        for (name, (_, path)) in theme_icons(&bases, &theme) {
            index.entry(name).or_insert(path);
        }
    }
    for (name, path) in icons_in(Path::new(PIXMAPS)) {
        index.entry(name).or_insert(path);
    }
    index
}

fn icon_bases() -> Vec<PathBuf> {
    let mut data_dirs: Vec<PathBuf> = dirs::data_dir().into_iter().collect();
    data_dirs.extend(
        std::env::var("XDG_DATA_DIRS")
            .unwrap_or_else(|_| "/usr/local/share:/usr/share".into())
            .split(':')
            .filter(|directory| !directory.is_empty())
            .map(PathBuf::from),
    );
    data_dirs.extend(dirs::data_dir().map(|data| data.join("flatpak/exports/share")));
    data_dirs.push(PathBuf::from(FLATPAK_EXPORTS));
    let mut bases: Vec<PathBuf> = dirs::home_dir()
        .map(|home| home.join(".icons"))
        .into_iter()
        .collect();
    for directory in data_dirs
        .into_iter()
        .map(|directory| directory.join("icons"))
    {
        if !bases.contains(&directory) {
            bases.push(directory);
        }
    }
    bases
}

fn current_theme() -> String {
    gio::Settings::new("org.gnome.desktop.interface")
        .string("icon-theme")
        .to_string()
}

fn theme_file(bases: &[PathBuf], theme: &str) -> Option<glib::KeyFile> {
    bases.iter().find_map(|base| {
        let file = glib::KeyFile::new();
        file.load_from_file(
            base.join(theme).join("index.theme"),
            glib::KeyFileFlags::NONE,
        )
        .ok()
        .map(|_| file)
    })
}

fn theme_chain(bases: &[PathBuf]) -> Vec<String> {
    let mut chain = vec![current_theme()];
    let mut next = 0;
    while let Some(theme) = chain.get(next).cloned() {
        next += 1;
        let inherited = theme_file(bases, &theme)
            .and_then(|file| file.string("Icon Theme", "Inherits").ok())
            .map(|inherits| inherits.to_string())
            .unwrap_or_default();
        for parent in inherited
            .split(',')
            .map(str::trim)
            .filter(|parent| !parent.is_empty())
        {
            if !chain.iter().any(|known| known == parent) {
                chain.push(parent.to_owned());
            }
        }
    }
    chain.retain(|theme| theme != FALLBACK_THEME);
    chain.push(FALLBACK_THEME.to_owned());
    chain
}

fn app_directories(file: &glib::KeyFile) -> Vec<(u32, String)> {
    let listed = ["Directories", "ScaledDirectories"]
        .into_iter()
        .filter_map(|key| file.string("Icon Theme", key).ok())
        .flat_map(|list| {
            list.split(',')
                .map(|directory| directory.trim().to_owned())
                .collect::<Vec<_>>()
        })
        .filter(|directory| !directory.is_empty() && !directory.contains("symbolic"));
    listed
        .filter_map(|directory| {
            let context = file.string(&directory, "Context").ok()?;
            if context != "Applications" {
                return None;
            }
            let size = file.integer(&directory, "Size").ok()?.max(1) as u32;
            let scale = file.integer(&directory, "Scale").unwrap_or(1).max(1) as u32;
            let scalable = file
                .string(&directory, "Type")
                .is_ok_and(|kind| kind == "Scalable");
            Some((rank(scalable, size * scale), directory))
        })
        .collect()
}

fn rank(scalable: bool, size: u32) -> u32 {
    match size {
        _ if scalable => 0,
        SMALLEST_GOOD_SIZE..=IDEAL_SIZE => 1 + IDEAL_SIZE - size,
        size if size > IDEAL_SIZE => IDEAL_SIZE + size,
        size => 4 * IDEAL_SIZE - size,
    }
}

fn theme_icons(bases: &[PathBuf], theme: &str) -> HashMap<String, (u32, PathBuf)> {
    let Some(file) = theme_file(bases, theme) else {
        return HashMap::new();
    };
    let mut icons: HashMap<String, (u32, PathBuf)> = HashMap::new();
    for (rank, directory) in app_directories(&file) {
        for base in bases {
            for (name, path) in icons_in(&base.join(theme).join(&directory)) {
                if icons.get(&name).is_none_or(|(best, _)| rank < *best) {
                    icons.insert(name, (rank, path));
                }
            }
        }
    }
    icons
}

fn icons_in(directory: &Path) -> Vec<(String, PathBuf)> {
    let Ok(entries) = fs::read_dir(directory) else {
        return Vec::new();
    };
    entries
        .flatten()
        .filter_map(|entry| {
            let path = entry.path();
            let extension = path.extension()?.to_str()?;
            if !EXTENSIONS.contains(&extension) {
                return None;
            }
            Some((path.file_stem()?.to_str()?.to_owned(), path))
        })
        .collect()
}
