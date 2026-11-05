use std::fs;
use std::io;
use std::path::Path;

use crate::spicetify::{Spicetify, write_changed};

const THEME: &str = "Luft";
const PREVIOUS: &str = "previous-theme";

fn copy_changed(from: &Path, to: &Path) -> io::Result<bool> {
    let mut changed = false;
    for entry in fs::read_dir(from)? {
        let entry = entry?;
        let target = to.join(entry.file_name());
        changed |= if entry.file_type()?.is_dir() {
            copy_changed(&entry.path(), &target)?
        } else {
            write_changed(&target, &fs::read(entry.path())?)?
        };
    }
    Ok(changed)
}

/// Puts the theme in place and applies it if Spotify doesn't have it yet. Says whether Spotify needs a restart to show it.
pub fn install(spicetify: &Spicetify, theme: &Path) -> io::Result<bool> {
    let installed = spicetify.themes().join(THEME);
    let changed = copy_changed(theme, &installed)?;
    let current = spicetify.setting("current_theme").unwrap_or_default();
    let selected = current == THEME;
    if !selected {
        let previous = format!(
            "{current}\n{}\n",
            spicetify.setting("color_scheme").unwrap_or_default()
        );
        fs::write(installed.join(PREVIOUS), previous)?;
        spicetify.configure(&[
            ("current_theme", THEME),
            ("color_scheme", ""),
            ("inject_css", "1"),
            ("replace_colors", "1"),
            ("inject_theme_js", "1"),
            ("overwrite_assets", "1"),
        ])?;
    }
    spicetify.find_prefs()?;
    let needed = changed || !selected || !spicetify.is_patched();
    if needed {
        spicetify.apply()?;
    }
    Ok(needed)
}

/// Goes back to the theme from before, as this runs when the extension is turned off.
pub fn restore(spicetify: &Spicetify) {
    let installed = spicetify.themes().join(THEME);
    let Ok(previous) = fs::read_to_string(installed.join(PREVIOUS)) else {
        return;
    };
    let mut lines = previous.lines();
    let (theme, scheme) = (
        lines.next().unwrap_or_default(),
        lines.next().unwrap_or_default(),
    );
    let restored = spicetify
        .configure(&[
            ("current_theme", theme),
            ("color_scheme", scheme),
            ("overwrite_assets", "0"),
        ])
        .and_then(|()| spicetify.apply());
    if let Err(error) = restored {
        eprintln!("Couldn't go back to the theme from before: {error}");
    }
    if let Err(error) = fs::remove_dir_all(installed) {
        eprintln!("Couldn't remove the theme: {error}");
    }
}
