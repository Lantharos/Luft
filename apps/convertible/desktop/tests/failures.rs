mod common;

use std::fs;

use common::{job, only_entries, run, write_scene};
use convertible_lib::engine::job::Conflict;
use tempfile::tempdir;

#[test]
fn a_failed_job_leaves_nothing_behind() {
    let folder = tempdir().unwrap();
    let inputs = [
        ("broken.png", "png", "out.jpg", "jpeg"),
        ("broken.mp4", "mp4", "out.webm", "webm"),
        ("broken.flac", "flac", "out.mp3", "mp3"),
        ("broken.pdf", "pdf", "out.png", "png"),
        ("broken.zip", "zip", "out.7z", "7z"),
        ("broken.woff2", "woff2", "out.ttf", "ttf"),
    ];
    for (name, _, output, format) in inputs {
        let source = folder.path().join(name);
        fs::write(&source, b"this file is not what its name says").unwrap();
        let before = only_entries(folder.path());
        run(&job(&[&source], folder.path(), output, format)).expect_err(name);
        assert_eq!(
            only_entries(folder.path()),
            before,
            "{name} left something behind"
        );
    }
}

#[test]
fn never_overwrites_unless_told_to() {
    let folder = tempdir().unwrap();
    let source = write_scene(folder.path(), 16, 16);
    let taken = folder.path().join("out.jpg");
    fs::write(&taken, b"keep me").unwrap();
    let output = run(&job(&[&source], folder.path(), "out.jpg", "jpeg")).unwrap();
    assert_eq!(output, folder.path().join("out (1).jpg"));
    assert_eq!(fs::read(&taken).unwrap(), b"keep me");

    let mut replace = job(&[&source], folder.path(), "out.jpg", "jpeg");
    replace.conflict = Conflict::Replace;
    assert_eq!(run(&replace).unwrap(), taken);
    assert_ne!(fs::read(&taken).unwrap(), b"keep me");
    assert!(
        only_entries(folder.path())
            .iter()
            .all(|name| !name.starts_with('.'))
    );
}

#[test]
fn keeps_the_original_time_when_asked() {
    let folder = tempdir().unwrap();
    let source = write_scene(folder.path(), 16, 16);
    let earlier = std::time::SystemTime::UNIX_EPOCH + std::time::Duration::from_secs(1_000_000_000);
    fs::File::options()
        .write(true)
        .open(&source)
        .unwrap()
        .set_modified(earlier)
        .unwrap();
    let mut keep = job(&[&source], folder.path(), "out.jpg", "jpeg");
    keep.keep_times = true;
    let output = run(&keep).unwrap();
    assert_eq!(fs::metadata(output).unwrap().modified().unwrap(), earlier);
}

#[test]
fn a_missing_input_is_reported() {
    let folder = tempdir().unwrap();
    let missing = folder.path().join("gone.png");
    assert!(run(&job(&[&missing], folder.path(), "out.jpg", "jpeg")).is_err());
    assert!(only_entries(folder.path()).is_empty());
}
