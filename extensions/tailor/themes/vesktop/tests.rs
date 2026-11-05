use std::fs;
use std::os::unix::fs::symlink;
use std::os::unix::net::UnixListener;
use std::path::PathBuf;

use super::{FILE, Install, Vesktop};
use crate::home::Home;
use crate::look::sample;
use crate::themes::Theme;

const SETTINGS: &str =
    "{\n    \"autoUpdate\": true,\n    \"enabledThemes\": [],\n    \"plugins\": {}\n}";

struct Fixture {
    _home: tempfile::TempDir,
    vesktop: Vesktop,
    folder: PathBuf,
}

fn fixture(inside: &str) -> Fixture {
    let scratch = tempfile::tempdir().unwrap();
    let home = Home {
        home: scratch.path().to_owned(),
        config: scratch.path().join(".config"),
        data: scratch.path().join(".local/share"),
    };
    let folder = scratch.path().join(inside);
    fs::create_dir_all(folder.join("settings")).unwrap();
    fs::write(folder.join("settings/settings.json"), SETTINGS).unwrap();
    let fonts = scratch.path().join("fonts.css");
    fs::write(&fonts, "@font-face{}").unwrap();
    Fixture {
        vesktop: Vesktop::new(home, fonts),
        folder,
        _home: scratch,
    }
}

impl Fixture {
    fn settings(&self) -> String {
        fs::read_to_string(self.folder.join("settings/settings.json")).unwrap()
    }

    /// Chromium's socket lives elsewhere, with a link in the profile, as a profile's path can be too long for one.
    fn open_vesktop(&self) -> (tempfile::TempDir, UnixListener) {
        symlink("rechner-3", self.folder.join("SingletonLock")).unwrap();
        let elsewhere = tempfile::tempdir().unwrap();
        let socket = elsewhere.path().join("SingletonSocket");
        let listener = UnixListener::bind(&socket).unwrap();
        symlink(&socket, self.folder.join("SingletonSocket")).unwrap();
        (elsewhere, listener)
    }

    fn close_vesktop(&self, open: (tempfile::TempDir, UnixListener)) {
        drop(open);
        fs::remove_file(self.folder.join("SingletonLock")).unwrap();
        fs::remove_file(self.folder.join("SingletonSocket")).unwrap();
    }
}

const FLATPAK: &str = ".var/app/dev.vencord.Vesktop/config/vesktop";

#[test]
fn turning_off_gives_back_the_settings_byte_for_byte() {
    let mut fixture = fixture(FLATPAK);
    assert_eq!(fixture.vesktop.apply(&sample("#a0c4ff")).unwrap(), "ready");
    assert!(fixture.settings().contains(FILE));
    assert!(fixture.folder.join("themes").join(FILE).is_file());

    fixture.vesktop.restore().unwrap();

    assert_eq!(fixture.settings(), SETTINGS);
    assert!(!fixture.folder.join("themes").join(FILE).exists());
    assert_eq!(
        fs::read_dir(fixture.folder.join("themes")).unwrap().count(),
        0
    );
    assert!(fixture.vesktop.watched().is_empty());
}

#[test]
fn settings_are_left_alone_while_vesktop_is_open() {
    let mut fixture = fixture(FLATPAK);
    let open = fixture.open_vesktop();

    assert_eq!(
        fixture.vesktop.apply(&sample("#a0c4ff")).unwrap(),
        "quit-once"
    );
    assert_eq!(fixture.settings(), SETTINGS);
    assert!(fixture.folder.join("themes").join(FILE).is_file());

    fixture.close_vesktop(open);
    assert!(fixture.vesktop.stirred_by("SingletonLock".as_ref()));
    assert_eq!(fixture.vesktop.apply(&sample("#a0c4ff")).unwrap(), "ready");
    assert!(fixture.settings().contains(FILE));
}

#[test]
fn a_lock_left_by_a_crash_doesn_t_hold_things_up() {
    let mut fixture = fixture(FLATPAK);
    symlink("rechner-3", fixture.folder.join("SingletonLock")).unwrap();
    symlink(
        "/nowhere/SingletonSocket",
        fixture.folder.join("SingletonSocket"),
    )
    .unwrap();
    assert_eq!(fixture.vesktop.apply(&sample("#a0c4ff")).unwrap(), "ready");
}

#[test]
fn a_socket_that_can_t_be_asked_counts_as_open() {
    let mut fixture = fixture(FLATPAK);
    symlink("rechner-3", fixture.folder.join("SingletonLock")).unwrap();
    let too_long = format!("/{}/SingletonSocket", "x".repeat(200));
    symlink(too_long, fixture.folder.join("SingletonSocket")).unwrap();
    assert_eq!(
        fixture.vesktop.apply(&sample("#a0c4ff")).unwrap(),
        "quit-once"
    );
    assert_eq!(fixture.settings(), SETTINGS);
}

#[test]
fn turning_off_while_open_finishes_when_vesktop_closes() {
    let mut fixture = fixture(FLATPAK);
    fixture.vesktop.apply(&sample("#a0c4ff")).unwrap();
    let open = fixture.open_vesktop();

    fixture.vesktop.restore().unwrap();
    assert!(!fixture.folder.join("themes").join(FILE).exists());
    assert_eq!(fixture.vesktop.watched(), vec![fixture.folder.clone()]);

    fixture.close_vesktop(open);
    fixture.vesktop.restore().unwrap();
    assert_eq!(fixture.settings(), SETTINGS);
    assert!(fixture.vesktop.watched().is_empty());
}

#[test]
fn a_new_look_rewrites_the_theme_vesktop_reloads_by_itself() {
    let mut fixture = fixture(FLATPAK);
    fixture.vesktop.apply(&sample("#a0c4ff")).unwrap();
    let settings = fixture.settings();

    fixture.vesktop.refresh(&sample("#ffb4ab")).unwrap();

    let theme = fs::read_to_string(fixture.folder.join("themes").join(FILE)).unwrap();
    assert!(theme.contains("--kestrel-primary: #ffb4ab;"));
    assert!(theme.starts_with("/**\n * @name Luft"));
    assert_eq!(fixture.settings(), settings);
}

#[test]
fn a_native_vesktop_works_the_same_way() {
    let mut fixture = fixture(".config/vesktop");
    assert_eq!(fixture.vesktop.apply(&sample("#a0c4ff")).unwrap(), "ready");
    fixture.vesktop.restore().unwrap();
    assert_eq!(fixture.settings(), SETTINGS);
}

#[test]
fn a_vesktop_that_never_ran_is_asked_to_run_first() {
    let fixture = fixture(FLATPAK);
    fs::remove_file(fixture.folder.join("settings/settings.json")).unwrap();
    let install = Install(fixture.folder.clone());
    assert_eq!(install.apply("", &sample("#a0c4ff")).unwrap(), "first-run");
}

#[test]
fn square_corners_come_and_go_with_the_desktop_s_setting() {
    let mut fixture = fixture(FLATPAK);
    let theme = fixture.folder.join("themes").join(FILE);
    let mut look = sample("#a0c4ff");
    fixture.vesktop.apply(&look).unwrap();
    assert!(
        !fs::read_to_string(&theme)
            .unwrap()
            .contains("foreignObject")
    );

    look.square_corners = true;
    fixture.vesktop.refresh(&look).unwrap();
    let square = fs::read_to_string(&theme).unwrap();
    assert!(square.contains("foreignObject"));
    assert!(square.contains("border-radius: 0 !important"));

    look.square_corners = false;
    fixture.vesktop.refresh(&look).unwrap();
    assert!(
        !fs::read_to_string(&theme)
            .unwrap()
            .contains("foreignObject")
    );
}
