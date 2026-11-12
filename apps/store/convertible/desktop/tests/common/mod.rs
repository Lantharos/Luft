#![allow(dead_code)]

use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

use convertible_lib::engine::capabilities::Capabilities;
use convertible_lib::engine::error::Result;
use convertible_lib::engine::job::{Conflict, Edits, Job, Options};
use convertible_lib::engine::{self, Progress};
use image::{Rgba, RgbaImage};

pub fn installed(found: &Capabilities, id: &str) -> bool {
    let missing = found.missing.iter().any(|missing| missing == id);
    if missing {
        eprintln!("{id} isn't installed here, so it goes untested");
    }
    !missing
}

pub fn fixture(name: &str) -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("tests/fixtures")
        .join(name)
}

pub fn job(inputs: &[&Path], folder: &Path, name: &str, format: &str) -> Job {
    Job {
        inputs: inputs.iter().map(|path| path.to_path_buf()).collect(),
        format: format.to_owned(),
        temp: folder.join(format!(".convertible-1.{name}")),
        destination: folder.join(name),
        conflict: Conflict::KeepBoth,
        keep_times: false,
        options: Options::default(),
        edits: Edits::default(),
    }
}

pub fn run(job: &Job) -> Result<PathBuf> {
    let last = Mutex::new(0.0f32);
    let report = |fraction: f32| {
        assert!(
            (0.0..=1.0).contains(&fraction),
            "progress stays between 0 and 1, got {fraction}"
        );
        *last.lock().unwrap() = fraction;
    };
    engine::run(job, &Progress::new(&report))
}

pub fn scene(width: u32, height: u32) -> RgbaImage {
    RgbaImage::from_fn(width, height, |x, y| {
        let red = (x * 255 / width.max(1)) as u8;
        let green = (y * 255 / height.max(1)) as u8;
        Rgba([red, green, 128, 255])
    })
}

pub fn write_scene(folder: &Path, width: u32, height: u32) -> PathBuf {
    let path = folder.join("scene.png");
    scene(width, height).save(&path).unwrap();
    path
}

pub fn difference(first: &RgbaImage, second: &RgbaImage) -> f64 {
    assert_eq!(first.dimensions(), second.dimensions());
    let total: u64 = first
        .as_raw()
        .iter()
        .zip(second.as_raw())
        .map(|(one, other)| u64::from(one.abs_diff(*other)))
        .sum();
    total as f64 / first.as_raw().len() as f64
}

pub fn only_entries(folder: &Path) -> Vec<String> {
    let mut names: Vec<String> = fs::read_dir(folder)
        .unwrap()
        .flatten()
        .map(|entry| entry.file_name().to_string_lossy().into_owned())
        .collect();
    names.sort();
    names
}
