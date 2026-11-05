use std::fs;
use std::path::{Path, PathBuf};
use std::time::{Duration, SystemTime};

use super::{Install, LIBRARY, ORIGINAL, Steam};
use crate::home::Home;
use crate::look::sample;
use crate::themes::Theme;

const STEAM_STYLES: &str = "button.DialogButton{color:#dfe3e6}";

struct Fixture {
    _home: tempfile::TempDir,
    steam: Steam,
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
    let styles = folder.join("steamui/css");
    fs::create_dir_all(&styles).unwrap();
    let long = STEAM_STYLES.repeat(40);
    fs::write(styles.join(LIBRARY), &long).unwrap();
    let assets = scratch.path().join("assets");
    fs::create_dir_all(&assets).unwrap();
    fs::write(assets.join("steam.css"), "body{}").unwrap();
    Fixture {
        steam: Steam::new(home, assets),
        folder,
        _home: scratch,
    }
}

fn snapshot(folder: &Path) -> Vec<(PathBuf, Vec<u8>, SystemTime, u32)> {
    use std::os::unix::fs::PermissionsExt;
    let mut found: Vec<_> = fs::read_dir(folder.join("steamui/css"))
        .unwrap()
        .map(|entry| {
            let path = entry.unwrap().path();
            let details = fs::metadata(&path).unwrap();
            let contents = fs::read(&path).unwrap();
            (
                path,
                contents,
                details.modified().unwrap(),
                details.permissions().mode(),
            )
        })
        .collect();
    found.sort();
    found
}

const FLATPAK: &str = ".var/app/com.valvesoftware.Steam/.local/share/Steam";

#[test]
fn restoring_puts_every_file_back_exactly() {
    let mut fixture = fixture(FLATPAK);
    let library = fixture.folder.join("steamui/css").join(LIBRARY);
    let old = SystemTime::UNIX_EPOCH + Duration::from_secs(1_700_000_000);
    fs::File::options()
        .write(true)
        .open(&library)
        .unwrap()
        .set_modified(old)
        .unwrap();
    let before = snapshot(&fixture.folder);

    fixture.steam.apply(&sample("#a0c4ff")).unwrap();
    assert!(fs::read(&library).unwrap().starts_with(super::MARK));
    fixture.steam.restore().unwrap();

    assert_eq!(snapshot(&fixture.folder), before);
    assert!(!fixture.folder.join("steamui/tailor").exists());
    assert!(fixture.steam.watched().is_empty());
}

#[test]
fn the_stand_in_keeps_steam_s_size_check_happy_and_loads_steam_s_own_styles() {
    let mut fixture = fixture(FLATPAK);
    let styles = fixture.folder.join("steamui/css");
    let size = fs::metadata(styles.join(LIBRARY)).unwrap().len();

    fixture.steam.apply(&sample("#a0c4ff")).unwrap();

    assert_eq!(fs::metadata(styles.join(LIBRARY)).unwrap().len(), size);
    let stand_in = fs::read_to_string(styles.join(LIBRARY)).unwrap();
    assert!(stand_in.contains(&format!("@import url(\"{ORIGINAL}\");")));
    assert_eq!(
        fs::read_to_string(styles.join(ORIGINAL)).unwrap(),
        STEAM_STYLES.repeat(40)
    );
}

#[test]
fn a_new_look_changes_only_the_colors() {
    let mut fixture = fixture(FLATPAK);
    let look = fixture.folder.join("steamui/tailor/look.css");
    fixture.steam.apply(&sample("#a0c4ff")).unwrap();
    let stand_in = fs::read(fixture.folder.join("steamui/css").join(LIBRARY)).unwrap();

    fixture.steam.refresh(&sample("#ffb4ab")).unwrap();

    assert!(fs::read_to_string(look).unwrap().contains("#ffb4ab"));
    assert_eq!(
        fs::read(fixture.folder.join("steamui/css").join(LIBRARY)).unwrap(),
        stand_in
    );
}

#[test]
fn an_update_is_covered_again_and_restoring_gives_the_update_s_file() {
    let mut fixture = fixture(FLATPAK);
    let styles = fixture.folder.join("steamui/css");
    fixture.steam.apply(&sample("#a0c4ff")).unwrap();

    let updated = "button.DialogButton{color:#fff}".repeat(50);
    fs::write(styles.join(LIBRARY), &updated).unwrap();
    assert!(fixture.steam.stirred_by(LIBRARY.as_ref()));
    fixture.steam.apply(&sample("#a0c4ff")).unwrap();

    assert_eq!(fs::read_to_string(styles.join(ORIGINAL)).unwrap(), updated);
    fixture.steam.restore().unwrap();
    assert_eq!(fs::read_to_string(styles.join(LIBRARY)).unwrap(), updated);
    assert!(!styles.join(ORIGINAL).exists());
}

#[test]
fn an_update_while_tailor_was_off_leaves_nothing_of_ours_behind() {
    let mut fixture = fixture(FLATPAK);
    let styles = fixture.folder.join("steamui/css");
    fixture.steam.apply(&sample("#a0c4ff")).unwrap();
    let updated = "button{}".repeat(200);
    fs::write(styles.join(LIBRARY), &updated).unwrap();

    fixture.steam.restore().unwrap();

    assert_eq!(fs::read_to_string(styles.join(LIBRARY)).unwrap(), updated);
    assert!(!styles.join(ORIGINAL).exists());
}

#[test]
fn a_native_steam_works_the_same_way() {
    let mut fixture = fixture(".local/share/Steam");
    let before = snapshot(&fixture.folder);
    assert_eq!(fixture.steam.apply(&sample("#a0c4ff")).unwrap(), "ready");
    assert!(!fixture.steam.watched().is_empty());
    fixture.steam.restore().unwrap();
    assert_eq!(snapshot(&fixture.folder), before);
}

#[test]
fn a_steam_that_never_ran_is_asked_to_run_first() {
    let fixture = fixture(FLATPAK);
    let install = Install(fixture.folder.clone());
    assert!(install.is_ready());
    fs::remove_file(fixture.folder.join("steamui/css").join(LIBRARY)).unwrap();
    assert!(!install.is_ready());
    let mut steam = fixture.steam;
    assert_eq!(steam.apply(&sample("#a0c4ff")).unwrap(), "first-run");
}

#[test]
fn every_stylesheet_of_steam_s_is_recolored_once() {
    let mut fixture = fixture(FLATPAK);
    let styles = fixture.folder.join("steamui/css");
    fs::write(styles.join("sp.css"), ".library{color:#67c1f5}").unwrap();
    fs::write(
        styles.join("chunk~1.css"),
        ".chunk{background-color:#171d25}",
    )
    .unwrap();

    fixture.steam.apply(&sample("#a0c4ff")).unwrap();

    let recolored =
        fs::read_to_string(fixture.folder.join("steamui/tailor/recolored.css")).unwrap();
    assert!(recolored.contains(".library{color:var(--luft-accent);}"));
    assert!(recolored.contains(".chunk{background-color:var(--luft-low);}"));
    assert_eq!(recolored.matches(".DialogButton").count(), 40);
}

#[test]
fn an_update_with_new_colors_is_recolored_again() {
    let mut fixture = fixture(FLATPAK);
    let styles = fixture.folder.join("steamui/css");
    fixture.steam.apply(&sample("#a0c4ff")).unwrap();
    fs::write(styles.join("sp.css"), ".new-in-the-update{color:#67c1f5}").unwrap();

    assert!(fixture.steam.stirred_by("sp.css".as_ref()));
    fixture.steam.apply(&sample("#a0c4ff")).unwrap();

    let recolored =
        fs::read_to_string(fixture.folder.join("steamui/tailor/recolored.css")).unwrap();
    assert!(recolored.contains(".new-in-the-update"));
}

#[test]
fn a_stand_in_from_an_older_tailor_is_brought_up_to_date_and_steam_s_file_stays() {
    let mut fixture = fixture(FLATPAK);
    let library = fixture.folder.join("steamui/css").join(LIBRARY);
    fixture.steam.apply(&sample("#a0c4ff")).unwrap();
    let size = fs::metadata(&library).unwrap().len();
    let mut older = b"/* Tailor */\n".to_vec();
    older.resize(usize::try_from(size).unwrap(), b' ');
    fs::write(&library, older).unwrap();

    fixture.steam.apply(&sample("#a0c4ff")).unwrap();

    assert!(
        fs::read_to_string(&library)
            .unwrap()
            .contains("recolored.css")
    );
    let original = fs::read_to_string(fixture.folder.join("steamui/css").join(ORIGINAL)).unwrap();
    assert_eq!(original, STEAM_STYLES.repeat(40));
}
