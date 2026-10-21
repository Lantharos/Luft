use std::fs;
use std::path::{Path, PathBuf};

use luft_software::apps::appimage::{Icon, IconSize};

const GROUP: &str = "[Flatpak Ref]";
const SYSTEM_INSTALLATION: &str = "/var/lib/flatpak";
const ICON_FOLDERS: [&str; 2] = ["128x128", "64x64"];

pub fn is_reference(head: &[u8]) -> bool {
    head.windows(GROUP.len())
        .any(|window| window == GROUP.as_bytes())
}

fn app_id(text: &str) -> Option<&str> {
    text.lines()
        .map(str::trim)
        .skip_while(|line| *line != GROUP)
        .skip(1)
        .take_while(|line| !line.starts_with('['))
        .find_map(|line| line.strip_prefix("Name="))
        .map(str::trim)
        .filter(|id| {
            !id.is_empty()
                && !id.starts_with('.')
                && id
                    .chars()
                    .all(|character| character.is_ascii_alphanumeric() || "._-".contains(character))
        })
}

fn installation(variable: &str, fallback: Option<PathBuf>) -> Option<PathBuf> {
    std::env::var_os(variable)
        .filter(|path| !path.is_empty())
        .map(PathBuf::from)
        .or(fallback)
}

fn appstream_icons() -> impl Iterator<Item = PathBuf> {
    [
        installation(
            "FLATPAK_USER_DIR",
            dirs::data_dir().map(|data| data.join("flatpak")),
        ),
        installation(
            "FLATPAK_SYSTEM_DIR",
            Some(PathBuf::from(SYSTEM_INSTALLATION)),
        ),
    ]
    .into_iter()
    .flatten()
    .filter_map(|installation| fs::read_dir(installation.join("appstream")).ok())
    .flatten()
    .flatten()
    .map(|remote| {
        remote
            .path()
            .join(std::env::consts::ARCH)
            .join("active/icons")
    })
}

fn icon_at(path: &Path) -> Option<Icon> {
    let bytes = fs::read(path).ok()?;
    Some(Icon {
        size: IconSize::of_png(&bytes)?,
        bytes,
        extension: "png",
    })
}

pub fn icons(path: &Path) -> Result<Vec<Icon>, String> {
    let text = fs::read_to_string(path).map_err(|error| error.to_string())?;
    let id = app_id(&text).ok_or("This Flatpak reference doesn't name an app")?;
    let file = format!("{id}.png");
    Ok(appstream_icons()
        .flat_map(|icons| ICON_FOLDERS.map(|folder| icons.join(folder).join(&file)))
        .filter_map(|path| icon_at(&path))
        .collect())
}
