use std::fs::{self, File};
use std::os::unix::fs::PermissionsExt;
use std::path::Path;

use luft_store_seal::Listed;

use super::store::Store;
use super::{root, unpack};

const ID: &str = "com.example.Clock";
const UID: u32 = 1000;

fn archive(folder: &Path) -> File {
    let path = folder.join("extension.tar.zst");
    let mut builder = tar::Builder::new(
        zstd::Encoder::new(File::create(&path).unwrap(), 3)
            .unwrap()
            .auto_finish(),
    );
    let mut add = |name: &str, mode: u32, contents: &[u8]| {
        let mut header = tar::Header::new_gnu();
        header.set_size(contents.len() as u64);
        header.set_mode(mode);
        header.set_cksum();
        builder.append_data(&mut header, name, contents).unwrap();
    };
    add(
        "com.example.Clock/extension.toml",
        0o666,
        b"id = \"com.example.Clock\"\n",
    );
    add("com.example.Clock/helper", 0o4777, b"#!/bin/sh\n");
    let mut link = tar::Header::new_gnu();
    link.set_entry_type(tar::EntryType::Symlink);
    link.set_size(0);
    builder
        .append_link(
            &mut link,
            "com.example.Clock/outside",
            "/var/home/elsewhere",
        )
        .unwrap();
    builder.into_inner().unwrap();
    File::open(path).unwrap()
}

#[test]
fn an_unpacked_extension_is_only_writable_by_root_and_keeps_no_link_out() {
    let scratch = tempfile::tempdir().unwrap();
    let into = scratch.path().join("unpacking");
    unpack(archive(scratch.path()), &into).unwrap();
    let folder = root(&into).unwrap();
    let mode = |name: &str| {
        fs::metadata(folder.join(name))
            .unwrap()
            .permissions()
            .mode()
            & 0o7777
    };
    assert_eq!(mode("extension.toml"), 0o644);
    assert_eq!(mode("helper"), 0o755);
    assert_eq!(
        fs::metadata(&folder).unwrap().permissions().mode() & 0o7777,
        0o755
    );
    assert!(fs::symlink_metadata(folder.join("outside")).is_err());
}

fn release(version: &str, in_shell: bool) -> Listed {
    Listed {
        version: version.to_owned(),
        luft: None,
        in_shell,
    }
}

fn manifest(folder: &Path) -> bool {
    folder.join(ID).join("extension.toml").is_file()
}

#[test]
fn a_release_not_approved_to_run_inside_the_shell_only_lands_where_it_runs_sandboxed() {
    let scratch = tempfile::tempdir().unwrap();
    let store = Store::at(scratch.path());
    store
        .place(UID, ID, &release("1.0.0", false), archive(scratch.path()))
        .unwrap();
    assert!(manifest(&scratch.path().join("sandboxed-extensions/1000")));
    assert!(!scratch.path().join("extensions/1000").join(ID).exists());
}

#[test]
fn an_approved_update_moves_a_sandboxed_extension_inside_the_shell() {
    let scratch = tempfile::tempdir().unwrap();
    let store = Store::at(scratch.path());
    store
        .place(UID, ID, &release("1.0.0", false), archive(scratch.path()))
        .unwrap();
    store
        .place(UID, ID, &release("1.1.0", true), archive(scratch.path()))
        .unwrap();
    assert!(manifest(&scratch.path().join("extensions/1000")));
    assert!(
        !scratch
            .path()
            .join("sandboxed-extensions/1000")
            .join(ID)
            .exists()
    );
}

#[test]
fn a_release_not_approved_yet_never_replaces_an_approved_one() {
    let scratch = tempfile::tempdir().unwrap();
    let store = Store::at(scratch.path());
    store
        .place(UID, ID, &release("1.0.0", true), archive(scratch.path()))
        .unwrap();
    let refused = store
        .place(UID, ID, &release("1.1.0", false), archive(scratch.path()))
        .unwrap_err();
    assert!(refused.to_string().contains("approved version stays"));
    assert!(manifest(&scratch.path().join("extensions/1000")));
    assert!(
        !scratch
            .path()
            .join("sandboxed-extensions/1000")
            .join(ID)
            .exists()
    );
}
