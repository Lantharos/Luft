use std::fs::{self, File};
use std::os::unix::fs::PermissionsExt;
use std::path::Path;

use super::{root, unpack};

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
