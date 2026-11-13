use std::collections::BTreeMap;
use std::io::Write;
use std::path::Path;

use base64::Engine;

use super::collect::collect_artifacts;
use super::{Shape, infer_artifact};
use crate::schema::parts::PartSettings;

fn elf(machine: u16) -> Vec<u8> {
    let mut header = vec![0u8; 64];
    header[..4].copy_from_slice(&[0x7f, b'E', b'L', b'F']);
    header[18..20].copy_from_slice(&machine.to_le_bytes());
    header
}

fn embedded_blockmap() -> Vec<u8> {
    let mut encoder =
        flate2::write::DeflateEncoder::new(Vec::new(), flate2::Compression::default());
    encoder.write_all(br#"{"version":"2","files":[]}"#).unwrap();
    encoder.finish().unwrap()
}

fn write(root: &Path, path: &str, contents: impl AsRef<[u8]>) {
    let path = root.join(path);
    std::fs::create_dir_all(path.parent().unwrap()).unwrap();
    std::fs::write(path, contents).unwrap();
}

fn shape<'a>(format: &'a str, parts: &'a BTreeMap<String, PartSettings>) -> Shape<'a> {
    Shape { format, parts }
}

fn pattern(root: &Path, glob: &str) -> Vec<String> {
    vec![root.join(glob).to_string_lossy().into_owned()]
}

#[test]
fn electron_files_carry_the_blockmap_beside_them_and_its_not_a_file_of_its_own() {
    let folder = tempfile::tempdir().unwrap();
    let root = folder.path();
    write(root, "electron/Notes-Setup-1.0.0.exe", "installer");
    write(root, "electron/Notes-Setup-1.0.0.exe.blockmap", "block map");
    write(root, "electron/Notes-1.0.0.msi", "msi");
    let none = BTreeMap::new();
    let artifacts =
        collect_artifacts(&pattern(root, "electron/*"), &shape("files", &none)).unwrap();
    let found: Vec<(&str, Option<&str>)> = artifacts
        .iter()
        .map(|artifact| (artifact.name.as_str(), artifact.blockmap.as_deref()))
        .collect();
    let encoded = base64::engine::general_purpose::STANDARD.encode("block map");
    assert_eq!(
        found,
        [
            ("Notes-1.0.0.msi", None),
            ("Notes-Setup-1.0.0.exe", Some(encoded.as_str()))
        ]
    );
}

#[test]
fn appimages_from_electron_builder_report_the_size_of_their_embedded_blockmap() {
    let folder = tempfile::tempdir().unwrap();
    let root = folder.path();
    let blockmap = embedded_blockmap();
    let mut appimage = elf(0x3e);
    appimage.extend(&blockmap);
    appimage.extend((blockmap.len() as u32).to_be_bytes());
    write(root, "appimages/Notes-1.0.0-x86_64.AppImage", appimage);
    write(root, "appimages/Plain-1.0.0-x86_64.AppImage", elf(0x3e));
    let none = BTreeMap::new();
    let artifacts =
        collect_artifacts(&pattern(root, "appimages/*"), &shape("files", &none)).unwrap();
    let sizes: Vec<Option<u64>> = artifacts
        .iter()
        .map(|artifact| artifact.blockmap_size)
        .collect();
    assert_eq!(sizes, [Some(blockmap.len() as u64), None]);
}

#[test]
fn sabine_bundles_read_the_platform_and_kind_from_the_names_sabines_workflow_gives() {
    let folder = tempfile::tempdir().unwrap();
    let root = folder.path();
    write(
        root,
        "dist/linux-x86_64/notes-1.0.0-linux-x86_64.tar.gz",
        "archive",
    );
    write(
        root,
        "dist/linux-x86_64/linux-x86_64.executable",
        "bin/notes\n",
    );
    write(
        root,
        "dist/windows-aarch64-msi/Notes-windows-aarch64-msi.msi",
        "msi",
    );
    let none = BTreeMap::new();
    let artifacts = collect_artifacts(&pattern(root, "dist/**"), &shape("sabine", &none)).unwrap();
    let found: Vec<(&str, &str, &str, Option<&str>)> = artifacts
        .iter()
        .map(|artifact| {
            (
                artifact.name.as_str(),
                artifact.platform.as_str(),
                artifact.kind.as_str(),
                artifact.executable.as_deref(),
            )
        })
        .collect();
    assert_eq!(
        found,
        [
            (
                "notes-1.0.0-linux-x86_64.tar.gz",
                "linux-x86_64",
                "archive",
                Some("bin/notes")
            ),
            (
                "Notes-windows-aarch64-msi.msi",
                "windows-aarch64",
                "msi",
                None
            ),
        ]
    );
}

#[test]
fn sabines_appimage_target_has_its_own_kind_and_named_parts_read_like_any_file() {
    let none = BTreeMap::new();
    let appimage = infer_artifact(
        "/x/Notes-0.1.0-linux-aarch64-appimage.AppImage",
        &shape("sabine", &none),
    )
    .unwrap();
    assert_eq!(
        (appimage.platform.as_str(), appimage.kind.as_str()),
        ("linux-aarch64", "app-image")
    );
    let cli = BTreeMap::from([(
        "cli".to_owned(),
        PartSettings {
            files: vec!["notes-cli-*".into()],
            platforms: vec!["linux-x86_64".into()],
            ..PartSettings::default()
        },
    )]);
    let file = infer_artifact("/x/notes-cli-linux-x86_64.tar.gz", &shape("sabine", &cli)).unwrap();
    assert_eq!(
        (
            file.part.as_deref(),
            file.platform.as_str(),
            file.kind.as_str()
        ),
        (Some("cli"), "linux-x86_64", "tarball")
    );
    let helper = BTreeMap::from([(
        "helper".to_owned(),
        PartSettings {
            files: vec!["notes-helper-*".into()],
            platforms: vec!["linux-x86_64".into()],
            format: Some("sabine".into()),
            ..PartSettings::default()
        },
    )]);
    let deb = infer_artifact(
        "/x/notes-helper-linux-x86_64-deb.deb",
        &shape("sabine", &helper),
    )
    .unwrap();
    assert_eq!(
        (deb.part.as_deref(), deb.kind.as_str()),
        (Some("helper"), "deb")
    );
    let app = infer_artifact(
        "/x/Notes-0.1.0-linux-x86_64-deb.deb",
        &shape("sabine", &cli),
    )
    .unwrap();
    assert_eq!((app.part, app.kind.as_str()), (None, "deb"));
}

#[test]
fn files_that_arent_sabine_bundles_are_refused() {
    let none = BTreeMap::new();
    let sabine = shape("sabine", &none);
    assert!(
        infer_artifact("/x/notes.zip", &sabine)
            .unwrap_err()
            .contains("isn't named like a Sabine bundle")
    );
    assert!(
        infer_artifact("/x/notes-linux-x86_64.deb", &sabine)
            .unwrap_err()
            .contains("no package kind")
    );
}

#[test]
fn appimages_take_their_architecture_from_the_elf_header_not_the_name() {
    let folder = tempfile::tempdir().unwrap();
    let root = folder.path();
    write(root, "Tool-arm.AppImage", elf(0xb7));
    write(root, "Tool.AppImage", elf(0x3e));
    write(root, "script.AppImage", "#!/bin/sh\n");
    let none = BTreeMap::new();
    let appimage = shape("appimage", &none);
    let path = |name: &str| root.join(name).to_string_lossy().into_owned();
    assert_eq!(
        infer_artifact(&path("Tool-arm.AppImage"), &appimage)
            .unwrap()
            .platform,
        "linux-aarch64"
    );
    assert_eq!(
        infer_artifact(&path("Tool.AppImage"), &appimage)
            .unwrap()
            .platform,
        "linux-x86_64"
    );
    assert!(
        infer_artifact(&path("script.AppImage"), &appimage)
            .unwrap_err()
            .contains("x86_64 or aarch64")
    );
}

#[test]
fn extensions_are_for_every_luft_unless_the_name_carries_an_architecture() {
    let none = BTreeMap::new();
    let extension = shape("luft-extension", &none);
    let platform = |name: &str| infer_artifact(name, &extension).unwrap().platform;
    assert_eq!(platform("/x/com.example.Rain.tar.zst"), "luft");
    assert_eq!(
        platform("/x/com.example.Rain-aarch64.tar.zst"),
        "luft-aarch64"
    );
    assert_eq!(
        platform("/x/com.example.Rain-x86_64.tar.zst"),
        "luft-x86_64"
    );
}

#[test]
fn an_empty_match_is_an_error() {
    let folder = tempfile::tempdir().unwrap();
    let none = BTreeMap::new();
    let error = collect_artifacts(
        &pattern(folder.path(), "nothing/*"),
        &shape("appimage", &none),
    )
    .unwrap_err();
    assert!(error.contains("No files match"));
}
