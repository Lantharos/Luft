use std::fs;
use std::io::{Cursor, Write};
use std::os::unix::fs::PermissionsExt;
use std::path::Path;

use super::*;

const UNBOUNDED: Rules = Rules {
    max_bytes: u64::MAX,
    max_entries: u32::MAX,
    outward_links: true,
    keep_metadata: true,
};

fn tar_through_link(outside: &Path) -> Vec<u8> {
    let mut builder = tar::Builder::new(Vec::new());
    let mut link = tar::Header::new_gnu();
    link.set_entry_type(tar::EntryType::Symlink);
    link.set_size(0);
    builder.append_link(&mut link, "link", outside).unwrap();
    let mut file = tar::Header::new_gnu();
    file.set_size(4);
    file.set_mode(0o644);
    builder
        .append_data(&mut file, "link/escaped", &b"data"[..])
        .unwrap();
    builder.into_inner().unwrap()
}

fn zip_through_link(outside: &Path) -> Vec<u8> {
    let options =
        zip::write::SimpleFileOptions::default().compression_method(zip::CompressionMethod::Stored);
    let mut writer = zip::ZipWriter::new(Cursor::new(Vec::new()));
    writer
        .add_symlink("link", outside.to_str().unwrap(), options)
        .unwrap();
    writer.start_file("link/escaped", options).unwrap();
    writer.write_all(b"data").unwrap();
    writer.finish().unwrap().into_inner()
}

fn assert_contained(unpack: impl FnOnce(&Path, &Path) -> Result<(), Error>) {
    let outside = tempfile::tempdir().unwrap();
    let into = tempfile::tempdir().unwrap();
    assert!(matches!(
        unpack(outside.path(), into.path()),
        Err(Error::Damaged(_))
    ));
    assert!(!outside.path().join("escaped").exists());
}

#[test]
fn an_entry_beneath_a_symlink_entry_stays_inside_the_destination() {
    assert_contained(|outside, into| {
        unpack_tar(
            Cursor::new(tar_through_link(outside)),
            into,
            UNBOUNDED,
            |_| {},
        )
    });
    assert_contained(|outside, into| {
        unpack_zip(
            Cursor::new(zip_through_link(outside)),
            into,
            UNBOUNDED,
            |_| {},
        )
    });
}

#[test]
fn special_mode_bits_are_dropped() {
    let mut builder = tar::Builder::new(Vec::new());
    let mut header = tar::Header::new_gnu();
    header.set_size(0);
    header.set_mode(0o6755);
    builder.append_data(&mut header, "tool", &b""[..]).unwrap();
    let into = tempfile::tempdir().unwrap();
    unpack_tar(
        Cursor::new(builder.into_inner().unwrap()),
        into.path(),
        UNBOUNDED,
        |_| {},
    )
    .unwrap();
    let mode = fs::metadata(into.path().join("tool"))
        .unwrap()
        .permissions()
        .mode();
    assert_eq!(mode & 0o7777, 0o755);
}
