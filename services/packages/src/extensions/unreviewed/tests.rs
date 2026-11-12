use std::fs::{self, File, Permissions};
use std::os::fd::AsFd;
use std::os::unix::fs::{MetadataExt, PermissionsExt, symlink};
use std::path::{Path, PathBuf};

use super::Unreviewed;

const ID: &str = "com.example.Clock";

fn mode(path: &Path) -> u32 {
    fs::symlink_metadata(path).unwrap().permissions().mode() & 0o7777
}

fn extension(scratch: &Path) -> PathBuf {
    let folder = scratch.join("own").join(ID);
    fs::create_dir_all(folder.join("locales/en")).unwrap();
    fs::write(
        folder.join("extension.toml"),
        "id = \"com.example.Clock\"\n",
    )
    .unwrap();
    fs::write(folder.join("extension.js"), "export default () => {};\n").unwrap();
    fs::write(
        folder.join("locales/en/clock.ftl"),
        "extension-name = Clock\n",
    )
    .unwrap();
    fs::write(folder.join("helper"), "#!/bin/sh\n").unwrap();
    fs::set_permissions(folder.join("helper"), Permissions::from_mode(0o777)).unwrap();
    fs::set_permissions(folder.join("extension.js"), Permissions::from_mode(0o666)).unwrap();
    folder
}

fn install(unreviewed: &Unreviewed, folder: &Path, owner: u32) -> anyhow::Result<()> {
    unreviewed.install_copy(owner, ID, File::open(folder).unwrap().as_fd())
}

#[test]
fn a_copy_holds_the_whole_folder_and_only_its_owner_can_change_it() {
    let scratch = tempfile::tempdir().unwrap();
    let source = extension(scratch.path());
    let unreviewed = Unreviewed::at(&scratch.path().join("unreviewed"));
    let uid = fs::metadata(scratch.path()).unwrap().uid();
    install(&unreviewed, &source, uid).unwrap();
    let copy = unreviewed.account(uid).join(ID);
    for name in [
        "extension.toml",
        "extension.js",
        "locales/en/clock.ftl",
        "helper",
    ] {
        assert_eq!(
            fs::read(copy.join(name)).unwrap(),
            fs::read(source.join(name)).unwrap(),
            "{name}"
        );
        assert_eq!(fs::metadata(copy.join(name)).unwrap().uid(), uid);
    }
    assert_eq!(mode(&copy.join("extension.js")), 0o644);
    assert_eq!(mode(&copy.join("helper")), 0o755);
    assert_eq!(mode(&copy.join("locales")), 0o755);
    fs::write(source.join("extension.js"), "changed").unwrap();
    assert_eq!(
        fs::read_to_string(copy.join("extension.js")).unwrap(),
        "export default () => {};\n"
    );
}

#[test]
fn a_folder_with_a_link_or_files_of_someone_else_is_refused_and_the_earlier_copy_stays() {
    let scratch = tempfile::tempdir().unwrap();
    let source = extension(scratch.path());
    let unreviewed = Unreviewed::at(&scratch.path().join("unreviewed"));
    let uid = fs::metadata(scratch.path()).unwrap().uid();
    install(&unreviewed, &source, uid).unwrap();
    assert!(install(&unreviewed, &source, uid + 1).is_err());

    fs::write(scratch.path().join("secret"), "kept out").unwrap();
    symlink(
        scratch.path().join("secret"),
        source.join("locales/en/secret.ftl"),
    )
    .unwrap();
    assert!(install(&unreviewed, &source, uid).is_err());
    fs::remove_file(source.join("locales/en/secret.ftl")).unwrap();
    fs::rename(source.join("locales"), scratch.path().join("locales")).unwrap();
    symlink(scratch.path().join("locales"), source.join("locales")).unwrap();
    assert!(install(&unreviewed, &source, uid).is_err());

    let copy = unreviewed.account(uid).join(ID);
    assert!(copy.join("locales/en/clock.ftl").is_file());
    assert!(fs::symlink_metadata(copy.join("locales")).unwrap().is_dir());
    assert_eq!(fs::read_dir(unreviewed.account(uid)).unwrap().count(), 1);
}

#[test]
fn a_folder_is_approved_only_by_a_plain_path_ending_in_its_id_and_removing_forgets_it() {
    let scratch = tempfile::tempdir().unwrap();
    let unreviewed = Unreviewed::at(scratch.path());
    for path in [
        "own/com.example.Clock",
        "/var/home/mara/../../etc/com.example.Clock",
        "/var/home/mara/.local/share/luft/extensions/com.example.Other",
    ] {
        assert!(unreviewed.allow_folder(1000, ID, path).is_err(), "{path}");
    }
    unreviewed
        .allow_folder(
            1000,
            ID,
            "/var/home/mara/.local/share/luft/extensions/com.example.Clock",
        )
        .unwrap();
    let record = unreviewed.account(1000).join(".folders.json");
    assert_eq!(
        fs::read_to_string(&record).unwrap(),
        r#"{"com.example.Clock":"/var/home/mara/.local/share/luft/extensions/com.example.Clock"}"#
    );
    assert_eq!(mode(&record), 0o644);
    unreviewed.remove(1000, ID).unwrap();
    assert_eq!(fs::read_to_string(&record).unwrap(), "{}");
}
