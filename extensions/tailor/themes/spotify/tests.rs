use std::fs;
use std::os::unix::fs::PermissionsExt;
use std::path::{Path, PathBuf};
use std::sync::mpsc;

use super::{PREVIOUS, Spotify, THEME};
use crate::home::Home;
use crate::look::sample;
use crate::themes::Problem;
use crate::themes::Theme;

/// A stand-in for Spicetify that keeps its config the way the real one does, and says what it's given to say.
fn stand_in(config: &Path, says: &str) -> String {
    format!(
        "#!/bin/sh\nif [ \"$1\" = -c ]; then echo '{ini}'; exit 0; fi\nif [ \"$1\" = config ]; then\n  shift\n  while [ $# -gt 1 ]; do\n    sed -i \"s|^$1 *=.*|$1 = $2|\" '{ini}'\n    shift 2\n  done\n  exit 0\nfi\n{says}\nspotify=$(sed -n 's/^spotify_path = //p' '{ini}')\nrm -f \"$spotify/Apps/xpui.spa\"\nmkdir -p \"$spotify/Apps/xpui/extensions\"\ntouch \"$spotify/Apps/xpui/extensions/theme.js\"\n",
        ini = config.display(),
    )
}

fn install_program(root: &Path, ini: &Path, says: &str) {
    let program = root.join(".spicetify/spicetify");
    fs::create_dir_all(program.parent().unwrap()).unwrap();
    fs::write(&program, stand_in(ini, says)).unwrap();
    fs::set_permissions(&program, fs::Permissions::from_mode(0o755)).unwrap();
}

struct Fixture {
    scratch: tempfile::TempDir,
    spotify: Spotify,
    ini: PathBuf,
}

fn config(spotify: &Path, theme: &str, scheme: &str) -> String {
    format!(
        "[Setting]\nspotify_path = {}\nprefs_path = /tmp/prefs\ncurrent_theme = {theme}\ncolor_scheme = {scheme}\noverwrite_assets = 0\ninject_css = 0\nreplace_colors = 1\ninject_theme_js = 1\n",
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

    install_program(root, &ini, "");

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
        "Marketplace\nGreen\n0\n1\n1\n0\n"
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

const FLATPAK_FOLDER: &str = "com.spotify.Client/current/active/files/extra/share/spotify";

impl Fixture {
    fn say(&self, says: &str) {
        install_program(self.scratch.path(), &self.ini, says);
    }

    fn set(&self, key: &str, value: &str) {
        let config = fs::read_to_string(&self.ini).unwrap();
        let changed: Vec<_> = config
            .lines()
            .map(|line| {
                if line.starts_with(key) {
                    format!("{key} = {value}")
                } else {
                    line.to_owned()
                }
            })
            .collect();
        fs::write(&self.ini, changed.join("\n") + "\n").unwrap();
    }

    fn get(&self, key: &str) -> String {
        fs::read_to_string(&self.ini)
            .unwrap()
            .lines()
            .find_map(|line| line.strip_prefix(&format!("{key} = ")).map(str::to_owned))
            .unwrap_or_default()
    }

    fn problem(&mut self) -> Problem {
        let error = self.spotify.apply(&sample("#a0c4ff")).unwrap_err();
        let problem = error.into_inner().unwrap().downcast::<Problem>().unwrap();
        *problem
    }

    fn flatpak_spotify(&self, root: &Path) -> PathBuf {
        let folder = root.join(FLATPAK_FOLDER);
        fs::create_dir_all(folder.join("Apps")).unwrap();
        fs::write(folder.join("Apps/xpui.spa"), "").unwrap();
        folder
    }
}

#[test]
fn a_flatpak_spotify_with_a_hand_made_config_is_found() {
    let mut fixture = fixture();
    let root = fixture.scratch.path().join(".local/share/flatpak/app");
    let folder = fixture.flatpak_spotify(&root);
    let prefs = fixture
        .scratch
        .path()
        .join(".var/app/com.spotify.Client/config/spotify");
    fs::create_dir_all(&prefs).unwrap();
    fs::write(prefs.join("prefs"), "").unwrap();
    fixture.set("spotify_path", "/opt/gone");
    fixture.set("prefs_path", "");

    assert_eq!(
        fixture.spotify.apply(&sample("#a0c4ff")).unwrap(),
        "restart"
    );
    assert_eq!(fixture.get("spotify_path"), folder.to_string_lossy());
    assert_eq!(
        fixture.get("prefs_path"),
        prefs.join("prefs").to_string_lossy()
    );
}

#[test]
fn prefs_that_are_gone_are_replaced_by_the_flatpak_s() {
    let mut fixture = fixture();
    let prefs = fixture
        .scratch
        .path()
        .join(".var/app/com.spotify.Client/config/spotify");
    fs::create_dir_all(&prefs).unwrap();
    fs::write(prefs.join("prefs"), "").unwrap();
    fixture.set("prefs_path", "/home/someone/.config/spotify/prefs");

    fixture.spotify.apply(&sample("#a0c4ff")).unwrap();

    assert_eq!(
        fixture.get("prefs_path"),
        prefs.join("prefs").to_string_lossy()
    );
}

#[test]
fn prefs_written_from_the_home_folder_are_kept() {
    let mut fixture = fixture();
    let relative = "./.var/app/com.spotify.Client/config/spotify/prefs";
    let prefs = fixture.scratch.path().join(relative);
    fs::create_dir_all(prefs.parent().unwrap()).unwrap();
    fs::write(prefs, "").unwrap();
    fixture.set("prefs_path", relative);

    fixture.spotify.apply(&sample("#a0c4ff")).unwrap();

    assert_eq!(fixture.get("prefs_path"), relative);
}

fn refuse_writes(apps: &Path) {
    fs::create_dir(apps.join(".tailor-can-write")).unwrap();
}

#[test]
fn a_spotify_installed_for_everyone_is_found_and_can_t_be_dressed() {
    let mut fixture = fixture();
    let root = fixture.scratch.path().join("system");
    let folder = fixture.flatpak_spotify(&root);
    fixture.spotify.system_flatpaks = root;
    fixture.set("spotify_path", "");
    refuse_writes(&folder.join("Apps"));

    let state = fixture.spotify.apply(&sample("#a0c4ff")).unwrap();

    assert_eq!(state, "read-only");
    assert_eq!(fixture.get("spotify_path"), folder.to_string_lossy());
}

#[test]
fn this_person_s_own_spotify_takes_over_from_one_that_can_t_be_changed() {
    let mut fixture = fixture();
    let shared = fixture.scratch.path().join("spotify/Apps");
    let own = fixture.flatpak_spotify(&fixture.scratch.path().join(".local/share/flatpak/app"));
    refuse_writes(&shared);

    let state = fixture.spotify.apply(&sample("#a0c4ff")).unwrap();

    assert_eq!(state, "restart");
    assert_eq!(fixture.get("spotify_path"), own.to_string_lossy());
}

#[test]
fn what_spicetify_says_becomes_a_state_people_can_act_on() {
    for (says, state) in [
        (
            "echo 'error Cannot detect Spotify \"prefs\" file location'; exit 1",
            "no-prefs",
        ),
        (
            "echo 'FATAL open xpui: permission denied'; exit 1",
            "read-only",
        ),
        (
            "echo 'info Spotify cannot be backed up at this state.'; exit 1",
            "not-stock",
        ),
        (
            "echo 'error Spotify version mismatch with Spicetify.'",
            "too-new",
        ),
        ("echo 'error something nobody expected'; exit 1", "failed"),
    ] {
        let mut fixture = fixture();
        fixture.say(says);
        let problem = fixture.problem();
        assert_eq!(problem.state, state);
        assert!(!problem.detail.is_empty());
    }
}

#[test]
fn spicetify_finishing_without_the_theme_isn_t_called_success() {
    let mut fixture = fixture();
    fixture.say("exit 0");
    assert_eq!(fixture.problem().state, "failed");
}

#[test]
fn settings_it_turned_on_go_back_too() {
    let mut fixture = fixture();
    fixture.spotify.apply(&sample("#a0c4ff")).unwrap();
    assert_eq!(fixture.get("inject_css"), "1");
    fixture.spotify.restore().unwrap();
    assert_eq!(fixture.get("inject_css"), "0");
    assert_eq!(fixture.get("current_theme"), "Marketplace");
    assert_eq!(fixture.get("color_scheme"), "Green");
}

#[test]
fn a_config_with_the_theme_selected_but_settings_off_is_put_right() {
    let mut fixture = fixture();
    fixture.spotify.apply(&sample("#a0c4ff")).unwrap();
    fixture.set("inject_theme_js", "0");
    assert_eq!(
        fixture.spotify.apply(&sample("#a0c4ff")).unwrap(),
        "restart"
    );
    assert_eq!(fixture.get("inject_theme_js"), "1");
}
