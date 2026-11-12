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

const BOUNDED: Rules = Rules {
    max_bytes: 64 * 1024,
    max_entries: 8,
    outward_links: false,
    keep_metadata: false,
};

fn tar_of(entries: &[(&str, &[u8])]) -> Vec<u8> {
    let mut builder = tar::Builder::new(Vec::new());
    for (path, contents) in entries {
        let mut header = tar::Header::new_gnu();
        header.set_size(contents.len() as u64);
        header.set_mode(0o644);
        builder.append_data(&mut header, path, *contents).unwrap();
    }
    builder.into_inner().unwrap()
}

fn tar_entry_named(name: &[u8], contents: &[u8]) -> Vec<u8> {
    let mut header = tar::Header::new_gnu();
    header.as_gnu_mut().unwrap().name[..name.len()].copy_from_slice(name);
    header.set_size(contents.len() as u64);
    header.set_mode(0o644);
    header.set_entry_type(tar::EntryType::Regular);
    header.set_cksum();
    let mut builder = tar::Builder::new(Vec::new());
    builder.append(&header, contents).unwrap();
    builder.into_inner().unwrap()
}

fn tar_links(links: &[(tar::EntryType, &str, &Path)]) -> Vec<u8> {
    let mut builder = tar::Builder::new(Vec::new());
    for (kind, path, target) in links {
        let mut header = tar::Header::new_gnu();
        header.set_entry_type(*kind);
        header.set_size(0);
        builder.append_link(&mut header, path, target).unwrap();
    }
    builder.into_inner().unwrap()
}

fn unpacked_bytes(folder: &Path) -> u64 {
    fs::read_dir(folder)
        .unwrap()
        .map(|entry| entry.unwrap().metadata().unwrap().len())
        .sum()
}

#[test]
fn an_archive_that_unpacks_to_more_than_allowed_stops_at_the_limit() {
    let half = vec![7u8; BOUNDED.max_bytes as usize / 2];
    let into = tempfile::tempdir().unwrap();
    let fits = tar_of(&[("a", &half), ("b", &half)]);
    unpack_tar(Cursor::new(fits), into.path(), BOUNDED, |_| {}).unwrap();

    let into = tempfile::tempdir().unwrap();
    let over = tar_of(&[("a", &half), ("b", &half), ("c", b"x")]);
    assert!(matches!(
        unpack_tar(Cursor::new(over), into.path(), BOUNDED, |_| {}),
        Err(Error::TooLarge)
    ));

    let options = zip::write::SimpleFileOptions::default()
        .compression_method(zip::CompressionMethod::Deflated);
    let mut writer = zip::ZipWriter::new(Cursor::new(Vec::new()));
    writer.start_file("zeros", options).unwrap();
    writer.write_all(&vec![0u8; 4 << 20]).unwrap();
    let bomb = writer.finish().unwrap().into_inner();
    assert!(bomb.len() < 64 * 1024);
    let into = tempfile::tempdir().unwrap();
    assert!(matches!(
        unpack_zip(Cursor::new(bomb), into.path(), BOUNDED, |_| {}),
        Err(Error::TooLarge)
    ));
    assert!(unpacked_bytes(into.path()) <= BOUNDED.max_bytes + 1);
}

#[test]
fn an_archive_with_more_entries_than_allowed_is_refused() {
    let names: Vec<String> = (0..=BOUNDED.max_entries)
        .map(|index| index.to_string())
        .collect();
    let entries: Vec<(&str, &[u8])> = names.iter().map(|name| (name.as_str(), &b""[..])).collect();
    let into = tempfile::tempdir().unwrap();
    let allowed = tar_of(&entries[..BOUNDED.max_entries as usize]);
    unpack_tar(Cursor::new(allowed), into.path(), BOUNDED, |_| {}).unwrap();
    let into = tempfile::tempdir().unwrap();
    assert!(matches!(
        unpack_tar(Cursor::new(tar_of(&entries)), into.path(), BOUNDED, |_| {}),
        Err(Error::TooLarge)
    ));
}

#[test]
fn paths_that_climb_out_are_skipped_and_absolute_ones_land_inside() {
    let into = tempfile::tempdir().unwrap();
    let destination = into.path().join("inside");
    fs::create_dir(&destination).unwrap();
    for name in [&b"../escaped"[..], b"/escaped"] {
        unpack_tar(
            Cursor::new(tar_entry_named(name, b"data")),
            &destination,
            BOUNDED,
            |_| {},
        )
        .unwrap();
    }
    assert!(!into.path().join("escaped").exists());
    assert_eq!(fs::read(destination.join("escaped")).unwrap(), b"data");
}

#[test]
fn links_never_reach_outside_unless_allowed() {
    let outside = tempfile::tempdir().unwrap();
    let secret = outside.path().join("secret");
    fs::write(&secret, b"secret").unwrap();
    let archive = tar_links(&[
        (tar::EntryType::Symlink, "up", Path::new("../..")),
        (tar::EntryType::Symlink, "absolute", outside.path()),
        (tar::EntryType::Symlink, "within", Path::new("folder/file")),
        (tar::EntryType::Link, "copied", &secret),
        (tar::EntryType::Link, "climbed", Path::new("../secret")),
    ]);
    let into = tempfile::tempdir().unwrap();
    unpack_tar(Cursor::new(archive.clone()), into.path(), BOUNDED, |_| {}).unwrap();
    let mut left: Vec<String> = fs::read_dir(into.path())
        .unwrap()
        .map(|entry| entry.unwrap().file_name().into_string().unwrap())
        .collect();
    left.sort();
    assert_eq!(left, ["within"]);

    let trusting = tempfile::tempdir().unwrap();
    unpack_tar(Cursor::new(archive), trusting.path(), UNBOUNDED, |_| {}).unwrap();
    assert_eq!(
        fs::read_link(trusting.path().join("up")).unwrap(),
        Path::new("../..")
    );
    assert!(!trusting.path().join("copied").exists());
}
