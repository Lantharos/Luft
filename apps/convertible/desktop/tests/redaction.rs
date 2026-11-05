mod common;

use std::fs;

use common::{fixture, job, run};
use convertible_lib::engine::job::{Mark, Rect};
use convertible_lib::engine::media::frame;
use image::{Rgba, RgbaImage};
use tempfile::tempdir;

const SECRET: [u8; 3] = [0x13, 0xF7, 0x2A];
const AREA: Rect = Rect {
    x: 20.0,
    y: 10.0,
    width: 40.0,
    height: 20.0,
};

fn secret_picture(path: &std::path::Path) {
    let image = RgbaImage::from_fn(80, 40, |x, y| {
        let inside = (20..60).contains(&x) && (10..30).contains(&y);
        if inside {
            Rgba([SECRET[0], SECRET[1], SECRET[2], 255])
        } else {
            Rgba([240, 240, 240, 255])
        }
    });
    image
        .save_with_format(path, image::ImageFormat::Bmp)
        .unwrap();
}

fn contains_secret(bytes: &[u8]) -> bool {
    bytes
        .windows(3)
        .any(|window| window == SECRET || window == [SECRET[2], SECRET[1], SECRET[0]])
}

#[test]
fn redaction_removes_the_pixels_from_the_file() {
    let folder = tempdir().unwrap();
    let source = folder.path().join("secret.bmp");
    secret_picture(&source);
    assert!(contains_secret(&fs::read(&source).unwrap()));
    for (id, extension) in [
        ("bmp", "bmp"),
        ("tga", "tga"),
        ("tiff", "tiff"),
        ("png", "png"),
        ("jpeg", "jpg"),
        ("webp", "webp"),
    ] {
        let mut redact = job(&[&source], folder.path(), &format!("clean.{extension}"), id);
        redact.edits.marks = vec![Mark::Redact { area: AREA }];
        let output = run(&redact).unwrap();
        let bytes = fs::read(&output).unwrap();
        assert!(
            !contains_secret(&bytes),
            "{id} still holds the secret bytes"
        );
        let format = image::ImageFormat::from_extension(extension).unwrap();
        let image = image::load_from_memory_with_format(&bytes, format)
            .unwrap()
            .to_rgba8();
        for (x, y, pixel) in image.enumerate_pixels() {
            if (20..60).contains(&x) && (10..30).contains(&y) {
                assert!(
                    pixel.0[..3].iter().all(|channel| *channel < 24),
                    "{id} {x},{y} {pixel:?}"
                );
            }
        }
    }
}

#[test]
fn redaction_reaches_fully_transparent_pixels_too() {
    let folder = tempdir().unwrap();
    let source = folder.path().join("hidden.png");
    let mut image = RgbaImage::from_pixel(32, 32, Rgba([255, 255, 255, 255]));
    for x in 8..24 {
        for y in 8..24 {
            image.put_pixel(x, y, Rgba([SECRET[0], SECRET[1], SECRET[2], 0]));
        }
    }
    image.save(&source).unwrap();
    let mut redact = job(&[&source], folder.path(), "clean.png", "png");
    redact.edits.marks = vec![Mark::Redact {
        area: Rect {
            x: 8.0,
            y: 8.0,
            width: 16.0,
            height: 16.0,
        },
    }];
    let output = image::open(run(&redact).unwrap()).unwrap().to_rgba8();
    assert_eq!(output.get_pixel(16, 16).0, [0, 0, 0, 255]);
}

#[test]
fn video_redaction_reaches_every_frame() {
    let folder = tempdir().unwrap();
    let source = fixture("clip.webm");
    let mut redact = job(&[&source], folder.path(), "clean.webm", "webm");
    redact.edits.marks = vec![Mark::Redact {
        area: Rect {
            x: 0.0,
            y: 0.0,
            width: 80.0,
            height: 60.0,
        },
    }];
    let output = run(&redact).unwrap();
    for time in [0.0, 0.5, 0.9] {
        let image = frame::grab(&output, time).unwrap().to_rgb8();
        assert_eq!(image.dimensions(), (160, 120));
        assert!(
            image
                .get_pixel(40, 30)
                .0
                .iter()
                .all(|channel| *channel < 30),
            "frame at {time}"
        );
    }
}
