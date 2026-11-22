mod draw;
mod palette;
mod set;
mod shapes;
mod xcursor;

use std::fs;
use std::io;
use std::os::unix::fs::symlink;
use std::path::{Path, PathBuf};

use palette::{DARK, LIGHT, Palette};

const THEMES: [(&str, &str, &Palette); 2] = [
    ("Plume", "Plume", &LIGHT),
    ("Plume-Dark", "Plume Dark", &DARK),
];

fn write_theme(icons: &Path, folder: &str, title: &str, palette: &Palette) -> io::Result<()> {
    let theme = icons.join(folder);
    if theme.exists() {
        fs::remove_dir_all(&theme)?;
    }
    let cursors = theme.join("cursors");
    fs::create_dir_all(&cursors)?;
    fs::write(
        theme.join("index.theme"),
        format!("[Icon Theme]\nName={title}\n"),
    )?;
    for cursor in set::cursors(palette) {
        fs::write(cursors.join(cursor.name), xcursor::encode(&cursor))?;
        for alias in cursor.aliases {
            symlink(cursor.name, cursors.join(alias))?;
        }
    }
    Ok(())
}

fn main() -> io::Result<()> {
    let Some(icons) = std::env::args_os().nth(1).map(PathBuf::from) else {
        eprintln!("Usage: luft-cursors ICONS_FOLDER");
        std::process::exit(2);
    };
    for (folder, title, palette) in THEMES {
        write_theme(&icons, folder, title, palette)?;
    }
    Ok(())
}
