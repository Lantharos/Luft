mod common;

use std::fs;

use common::{difference, job, run, scene, write_scene};
use convertible_lib::engine::capabilities;
use convertible_lib::engine::formats;
use convertible_lib::engine::image::decode;
use convertible_lib::engine::job::{Mark, Rect};
use image::{GenericImageView, ImageFormat, ImageReader};
use tempfile::tempdir;

fn decoded(path: &std::path::Path, id: &str) -> image::DynamicImage {
    decode::decode(path, formats::by_id(id).unwrap())
        .unwrap()
        .image
}

#[test]
fn converts_to_every_lossless_and_lossy_format_and_keeps_the_picture() {
    let folder = tempdir().unwrap();
    let source = write_scene(folder.path(), 96, 64);
    let reference = scene(96, 64);
    let cases = [
        ("png", "png", 0.0),
        ("jpeg", "jpg", 6.0),
        ("webp", "webp", 6.0),
        ("gif", "gif", 8.0),
        ("tiff", "tiff", 0.0),
        ("bmp", "bmp", 0.0),
        ("tga", "tga", 0.0),
        ("qoi", "qoi", 0.0),
        ("pnm", "pnm", 0.0),
    ];
    for (id, extension, tolerance) in cases {
        let output = run(&job(
            &[&source],
            folder.path(),
            &format!("out.{extension}"),
            id,
        ))
        .unwrap();
        let image = decoded(&output, id).to_rgba8();
        assert!(
            difference(&reference, &image) <= tolerance,
            "{id} differs by {}",
            difference(&reference, &image)
        );
    }
}

#[test]
fn the_system_encoders_write_files_that_decode() {
    let found = capabilities::detect();
    let folder = tempdir().unwrap();
    let source = write_scene(folder.path(), 96, 64);
    let reference = scene(96, 64);
    for (id, extension) in [("avif", "avif"), ("heic", "heic"), ("jxl", "jxl")] {
        if found.missing.iter().any(|missing| missing == id) {
            continue;
        }
        let output = run(&job(
            &[&source],
            folder.path(),
            &format!("out.{extension}"),
            id,
        ))
        .unwrap();
        let image = decoded(&output, id).to_rgba8();
        assert!(difference(&reference, &image) < 8.0, "{id}");
    }
}

#[test]
fn icons_hold_every_size_up_to_the_picture() {
    let folder = tempdir().unwrap();
    let source = write_scene(folder.path(), 64, 64);
    let output = run(&job(&[&source], folder.path(), "out.ico", "ico")).unwrap();
    let image = ImageReader::open(&output)
        .unwrap()
        .with_guessed_format()
        .unwrap();
    assert_eq!(image.format(), Some(ImageFormat::Ico));
    assert_eq!(image.decode().unwrap().dimensions(), (64, 64));
}

#[test]
fn svg_rasterizes_at_a_useful_size() {
    let folder = tempdir().unwrap();
    let source = folder.path().join("shape.svg");
    fs::write(&source, r##"<svg xmlns="http://www.w3.org/2000/svg" width="24" height="12"><rect width="12" height="12" fill="#ff0000"/></svg>"##).unwrap();
    let output = run(&job(&[&source], folder.path(), "out.png", "png")).unwrap();
    let image = decoded(&output, "png").to_rgba8();
    assert_eq!(image.dimensions(), (1024, 512));
    assert_eq!(image.get_pixel(100, 100).0, [255, 0, 0, 255]);
    assert_eq!(image.get_pixel(900, 100).0[3], 0);
}

#[test]
fn geometry_edits_apply_in_order() {
    let folder = tempdir().unwrap();
    let source = write_scene(folder.path(), 100, 60);
    let mut edit = job(&[&source], folder.path(), "out.png", "png");
    edit.edits.rotate = 90;
    edit.edits.crop = Some(Rect {
        x: 10.0,
        y: 20.0,
        width: 40.0,
        height: 30.0,
    });
    edit.options.width = Some(20);
    let image = decoded(&run(&edit).unwrap(), "png").to_rgba8();
    assert_eq!(image.dimensions(), (20, 15));
    let rotated = image::imageops::rotate90(&scene(100, 60));
    assert!(image.get_pixel(10, 7).0[0].abs_diff(rotated.get_pixel(30, 35).0[0]) < 12);
}

#[test]
fn colour_edits_match_the_preview_formula() {
    let folder = tempdir().unwrap();
    let source = folder.path().join("grey.png");
    image::RgbaImage::from_pixel(8, 8, image::Rgba([100, 150, 200, 255]))
        .save(&source)
        .unwrap();
    let mut edit = job(&[&source], folder.path(), "out.png", "png");
    edit.edits.brightness = 0.2;
    edit.edits.contrast = -0.5;
    let image = decoded(&run(&edit).unwrap(), "png").to_rgba8();
    let expected = |value: f64| (((value / 255.0 * 1.2).min(1.0) - 0.5) * 0.5 + 0.5) * 255.0;
    assert!((f64::from(image.get_pixel(0, 0).0[0]) - expected(100.0)).abs() < 1.5);
    assert!((f64::from(image.get_pixel(0, 0).0[2]) - expected(200.0)).abs() < 1.5);
}

#[test]
fn compresses_to_the_requested_size() {
    let folder = tempdir().unwrap();
    let source = write_scene(folder.path(), 800, 600);
    for (id, extension) in [("jpeg", "jpg"), ("webp", "webp"), ("png", "png")] {
        let mut compress = job(&[&source], folder.path(), &format!("small.{extension}"), id);
        compress.options.target_bytes = Some(12_000);
        let output = run(&compress).unwrap();
        assert!(fs::metadata(&output).unwrap().len() <= 12_000, "{id}");
    }
}

fn jpeg_with_exif(folder: &std::path::Path) -> std::path::PathBuf {
    let exif = [
        b"MM\0*\0\0\0\x08\0\x01\x01\x12\0\x03\0\0\0\x01\0\x06\0\0\0\0\0\0".as_slice(),
        b"camera-serial-12345",
    ]
    .concat();
    let picture = folder.join("photo.jpg");
    let pixels = image::RgbImage::from_fn(40, 20, |x, _| image::Rgb([(x * 6) as u8, 10, 10]));
    let mut bytes = Vec::new();
    let mut encoder = jpeg_encoder::Encoder::new(&mut bytes, 90);
    encoder.add_exif_metadata(&exif).unwrap();
    encoder
        .encode(pixels.as_raw(), 40, 20, jpeg_encoder::ColorType::Rgb)
        .unwrap();
    fs::write(&picture, bytes).unwrap();
    picture
}

#[test]
fn metadata_follows_the_choice_and_orientation_is_baked_in() {
    let folder = tempdir().unwrap();
    let source = jpeg_with_exif(folder.path());

    let kept = run(&job(&[&source], folder.path(), "kept.jpg", "jpeg")).unwrap();
    let bytes = fs::read(&kept).unwrap();
    assert!(
        bytes
            .windows(19)
            .any(|window| window == b"camera-serial-12345")
    );
    let image = ImageReader::open(&kept).unwrap().decode().unwrap();
    assert_eq!(
        image.dimensions(),
        (20, 40),
        "orientation 6 is rotated into the pixels"
    );

    let mut strip = job(&[&source], folder.path(), "stripped.jpg", "jpeg");
    strip.options.keep_metadata = false;
    let stripped = fs::read(run(&strip).unwrap()).unwrap();
    assert!(
        !stripped
            .windows(19)
            .any(|window| window == b"camera-serial-12345")
    );

    let mut mark = job(&[&source], folder.path(), "marked.jpg", "jpeg");
    mark.edits.marks = vec![Mark::Redact {
        area: Rect {
            x: 0.0,
            y: 0.0,
            width: 4.0,
            height: 4.0,
        },
    }];
    let marked = fs::read(run(&mark).unwrap()).unwrap();
    assert!(
        !marked
            .windows(19)
            .any(|window| window == b"camera-serial-12345"),
        "camera details can hold what the marks hide"
    );
}

#[test]
fn animated_gifs_keep_their_frames() {
    let folder = tempdir().unwrap();
    let source = folder.path().join("moving.gif");
    {
        let file = fs::File::create(&source).unwrap();
        let mut encoder = image::codecs::gif::GifEncoder::new(file);
        let frames = (0..4).map(|shade| {
            image::Frame::new(image::RgbaImage::from_pixel(
                12,
                12,
                image::Rgba([shade * 60, 0, 0, 255]),
            ))
        });
        encoder.encode_frames(frames).unwrap();
    }
    assert!(decode::is_animated(&source, formats::by_id("gif").unwrap()));
    let mut resize = job(&[&source], folder.path(), "smaller.gif", "gif");
    resize.options.width = Some(6);
    let output = run(&resize).unwrap();
    let frames: Vec<_> = decode::gif_frames(&output)
        .unwrap()
        .map(Result::unwrap)
        .collect();
    assert_eq!(frames.len(), 4);
    assert_eq!(frames[0].buffer().dimensions(), (6, 6));
}
