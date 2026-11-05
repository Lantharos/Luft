use std::fs;
use std::os::unix::fs::PermissionsExt;
use std::path::{Path, PathBuf};
use std::sync::mpsc;

use super::{PREVIOUS, Spotify, THEME};
use crate::home::Home;
use crate::look::sample;
use crate::themes::Theme;

fn stand_in(config: &Path, spotify: &Path) -> String {
    format!(
        "#!/bin/sh\nif [ \"$1\" = config ]; then\n  shift\n  while [ $# -gt 1 ]; do\n    sed -i \"s|^$1 *=.*|$1 = $2|\" '{}'\n    shift 2\n  done\n  exit 0\nfi\nrm -f '{}/Apps/xpui.spa'\n",
        config.display(),
        spotify.display()
    )
}

struct Fixture {
    scratch: tempfile::TempDir,
    spotify: Spotify,
    ini: PathBuf,
}

fn config(spotify: &Path, theme: &str, scheme: &str) -> String {
    format!(
        "[Setting]\nspotify_path = {}\nprefs_path = /tmp/prefs\ncurrent_theme = {theme}\ncolor_scheme = {scheme}\noverwrite_assets = 0\ninject_css = 1\nreplace_colors = 1\ninject_theme_js = 1\n",
        spotify.display()
    )
}

fn fixture() -> Fixture {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path();
    let home = Home {
        home: root.to_owned(),
        config: root.join(".config"),
        data: root.join(".local/share"),
    };
    let installed = root.join("spotify/Apps");
    fs::create_dir_all(&installed).unwrap();
    fs::write(installed.join("xpui.spa"), "").unwrap();

    let spicetify = home.config.join("spicetify");
    fs::create_dir_all(&spicetify).unwrap();
    let ini = spicetify.join("config-xpui.ini");
    fs::write(&ini, config(&root.join("spotify"), "Marketplace", "Green")).unwrap();

    let program = root.join(".spicetify/spicetify");
    fs::create_dir_all(program.parent().unwrap()).unwrap();
    fs::write(&program, stand_in(&ini, &root.join("spotify"))).unwrap();
    fs::set_permissions(&program, fs::Permissions::from_mode(0o755)).unwrap();

    let assets = root.join("assets");
    fs::create_dir_all(&assets).unwrap();
    fs::write(assets.join("user.css"), "body{}").unwrap();

    let (events, _) = mpsc::channel();
    let mut spotify = Spotify::new(home, assets, events);
    spotify.port = 0;
    Fixture {
        spotify,
        ini,
        scratch,
    }
}

#[test]
fn restoring_goes_back_to_the_theme_from_before() {
    let mut fixture = fixture();
    let before = fs::read_to_string(&fixture.ini).unwrap();
    let theme = fixture
        .scratch
        .path()
        .join(".config/spicetify/Themes")
        .join(THEME);

    assert_eq!(
        fixture.spotify.apply(&sample("#a0c4ff")).unwrap(),
        "restart"
    );
    let dressed = fs::read_to_string(&fixture.ini).unwrap();
    assert!(dressed.contains("current_theme = Luft"));
    assert_eq!(
        fs::read_to_string(theme.join(PREVIOUS)).unwrap(),
        "Marketplace\nGreen\n"
    );

    fixture.spotify.restore().unwrap();

    assert_eq!(fs::read_to_string(&fixture.ini).unwrap(), before);
    assert!(!theme.exists());
    assert!(fixture.spotify.watched().is_empty());
}

#[test]
fn an_app_that_already_has_the_theme_isn_t_applied_again() {
    let mut fixture = fixture();
    fixture.spotify.apply(&sample("#a0c4ff")).unwrap();
    assert_eq!(fixture.spotify.apply(&sample("#a0c4ff")).unwrap(), "ready");
}

#[test]
fn only_a_new_spotify_stirs_the_helper() {
    let mut fixture = fixture();
    fixture.spotify.apply(&sample("#a0c4ff")).unwrap();
    assert!(!fixture.spotify.stirred_by("xpui.spa".as_ref()));
    let installed = fixture.scratch.path().join("spotify/Apps/xpui.spa");
    fs::write(installed, "").unwrap();
    assert!(fixture.spotify.stirred_by("xpui.spa".as_ref()));
}
