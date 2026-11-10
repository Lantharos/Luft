use std::fs;
use std::os::unix::ffi::OsStrExt;
use std::os::unix::fs::{PermissionsExt, symlink};
use std::path::Path;

use super::copy::{copy, move_to};
use super::place::Place;
use super::remove::remove;

fn place(path: &Path) -> std::io::Result<Place> {
    Place::find(path.as_os_str().as_bytes())
}

#[test]
fn refuses_a_way_through_a_link() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().canonicalize().unwrap();
    fs::create_dir(root.join("real")).unwrap();
    fs::write(root.join("real/file"), "kept").unwrap();
    symlink(root.join("real"), root.join("link")).unwrap();

    assert!(place(&root.join("real/file")).is_ok());
    assert!(place(&root.join("link/file")).is_err());
    assert!(place(&root.join("real/../real/file")).is_err());
}

#[test]
fn copies_moves_and_removes_links_as_links() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().canonicalize().unwrap();
    fs::create_dir_all(root.join("outside")).unwrap();
    fs::write(root.join("outside/precious"), "kept").unwrap();
    fs::create_dir_all(root.join("tree/inner")).unwrap();
    fs::write(root.join("tree/inner/file"), "contents").unwrap();
    fs::set_permissions(
        root.join("tree/inner/file"),
        fs::Permissions::from_mode(0o640),
    )
    .unwrap();
    symlink(root.join("outside"), root.join("tree/way-out")).unwrap();

    copy(
        &place(&root.join("tree")).unwrap(),
        &place(&root.join("copy")).unwrap(),
    )
    .unwrap();
    assert_eq!(
        fs::read_to_string(root.join("copy/inner/file")).unwrap(),
        "contents"
    );
    let mode = fs::metadata(root.join("copy/inner/file"))
        .unwrap()
        .permissions()
        .mode();
    assert_eq!(mode & 0o777, 0o640);
    assert!(
        fs::symlink_metadata(root.join("copy/way-out"))
            .unwrap()
            .is_symlink()
    );
    assert!(
        copy(
            &place(&root.join("tree")).unwrap(),
            &place(&root.join("copy")).unwrap()
        )
        .is_err()
    );
    assert!(root.join("copy/inner/file").exists());

    move_to(
        &place(&root.join("copy")).unwrap(),
        &place(&root.join("moved")).unwrap(),
    )
    .unwrap();
    assert!(
        move_to(
            &place(&root.join("tree")).unwrap(),
            &place(&root.join("moved")).unwrap()
        )
        .is_err()
    );

    remove(&place(&root.join("moved")).unwrap()).unwrap();
    assert!(!root.join("moved").exists());
    assert_eq!(
        fs::read_to_string(root.join("outside/precious")).unwrap(),
        "kept"
    );
}
