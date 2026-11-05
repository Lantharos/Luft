mod common;

use std::fs;
use std::io::Write;
use std::path::Path;

use common::{job, run};
use tempfile::tempdir;

fn tree(root: &Path) -> Vec<(String, Vec<u8>)> {
    let mut files: Vec<_> = walkdir::WalkDir::new(root)
        .into_iter()
        .flatten()
        .filter(|entry| entry.file_type().is_file())
        .map(|entry| {
            (
                entry
                    .path()
                    .strip_prefix(root)
                    .unwrap()
                    .to_string_lossy()
                    .into_owned(),
                fs::read(entry.path()).unwrap(),
            )
        })
        .collect();
    files.sort();
    files
}

fn sample(root: &Path) -> std::path::PathBuf {
    let folder = root.join("photos");
    fs::create_dir_all(folder.join("deep/er")).unwrap();
    fs::write(folder.join("a.txt"), b"first").unwrap();
    fs::write(folder.join("deep/b.bin"), vec![7u8; 70_000]).unwrap();
    fs::write(folder.join("deep/er/c.txt"), b"third").unwrap();
    folder
}

#[test]
fn every_archive_format_round_trips_a_folder() {
    let work = tempdir().unwrap();
    let source = sample(work.path());
    let expected = tree(work.path());
    let formats = [
        ("zip", "out.zip"),
        ("7z", "out.7z"),
        ("tar", "out.tar"),
        ("tar.gz", "out.tar.gz"),
        ("tar.xz", "out.tar.xz"),
        ("tar.zst", "out.tar.zst"),
        ("tar.bz2", "out.tar.bz2"),
    ];
    for (id, name) in formats {
        let output = run(&job(&[&source], work.path(), name, id)).unwrap();
        assert!(fs::metadata(&output).unwrap().len() > 0);
        let target = tempdir().unwrap();
        let unpacked = run(&job(&[&output], target.path(), "unpacked", "folder")).unwrap();
        let found = tree(&unpacked);
        let source_files: Vec<_> = expected
            .iter()
            .filter(|(name, _)| name.starts_with("photos"))
            .cloned()
            .collect();
        assert_eq!(found, source_files, "{id}");
        fs::remove_file(output).unwrap();
    }
}

#[test]
fn archives_convert_directly_into_each_other() {
    let work = tempdir().unwrap();
    let source = sample(work.path());
    let zip = run(&job(&[&source], work.path(), "out.zip", "zip")).unwrap();
    let seven = run(&job(&[&zip], work.path(), "out.7z", "7z")).unwrap();
    let tar = run(&job(&[&seven], work.path(), "out.tar.zst", "tar.zst")).unwrap();
    let target = tempdir().unwrap();
    let unpacked = run(&job(&[&tar], target.path(), "unpacked", "folder")).unwrap();
    assert_eq!(tree(&unpacked).len(), 3);
    assert_eq!(
        fs::read(unpacked.join("photos/deep/b.bin")).unwrap().len(),
        70_000
    );
}

#[test]
fn entries_cannot_escape_the_output_folder() {
    let work = tempdir().unwrap();
    let archive = work.path().join("evil.zip");
    let mut writer = zip::ZipWriter::new(fs::File::create(&archive).unwrap());
    let options = zip::write::SimpleFileOptions::default();
    writer.start_file("../../escaped.txt", options).unwrap();
    writer.write_all(b"out").unwrap();
    writer.start_file("fine.txt", options).unwrap();
    writer.write_all(b"in").unwrap();
    writer.finish().unwrap();
    let target = tempdir().unwrap();
    let inner = target.path().join("a/b");
    fs::create_dir_all(&inner).unwrap();
    let unpacked = run(&job(&[&archive], &inner, "unpacked", "folder")).unwrap();
    assert!(unpacked.join("fine.txt").exists());
    assert!(!target.path().join("escaped.txt").exists());
    assert!(!inner.join("escaped.txt").exists());
}

#[test]
fn locked_archives_say_so() {
    let work = tempdir().unwrap();
    for name in ["locked.zip", "locked.7z"] {
        let failure = run(&job(
            &[&common::fixture(name)],
            work.path(),
            "unpacked",
            "folder",
        ))
        .unwrap_err();
        assert!(
            failure.0.to_lowercase().contains("password"),
            "{name}: {failure}"
        );
    }
}
