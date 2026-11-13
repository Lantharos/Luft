use std::path::Path;

use super::files::{helper_build, replaced_workflows, sabine_inputs, sabine_version};
use super::identity::Identity;
use super::listing::listing_files;
use super::workflow::{SCHELF_WORKFLOW, SetupInput, workflow_for};
use crate::project::detect_project;
use crate::schema::listing::{Screenshot, parse};

pub const RAIN: &str = "id = \"com.lantharos.Rain\"\nname = \"Rain\"\ndescription = \"Rain falls over the wallpaper.\"\nversion = \"1.0.0\"\napi = 1\npermissions = [\"wallpaper\"]\n\n[helper]\npath = \"rain-sound\"\n";

const CALLS_SABINE: &str = "jobs:\n  release:\n    uses: Lantharos/Sabine/.github/workflows/release-app.yml@9bf0e62d32c8c0d136137c7a7fce21b898961006\n    with:\n      sabine_version: v0.62\n      rust_toolchain: \"1.99\"\n      upgrade_from_sabine_version: v0.22\n";

fn write(root: &Path, path: &str, contents: &str) {
    let path = root.join(path);
    std::fs::create_dir_all(path.parent().unwrap()).unwrap();
    std::fs::write(path, contents).unwrap();
}

fn sabine_repository() -> tempfile::TempDir {
    let folder = tempfile::tempdir().unwrap();
    write(folder.path(), ".github/workflows/release.yml", CALLS_SABINE);
    folder
}

fn extension(helper: Option<(&str, &str)>) -> SetupInput {
    SetupInput {
        id: "com.lantharos.Rain".into(),
        kind: "extension".into(),
        format: "luft-extension".into(),
        extension_api: Some(1),
        helper: helper.map(|(path, build)| (path.into(), build.into())),
        ..SetupInput::default()
    }
}

#[test]
fn an_extension_with_a_helper_builds_and_packs_it_on_both_architectures() {
    let folder = tempfile::tempdir().unwrap();
    let build = helper_build(folder.path(), "rain-sound").unwrap();
    let workflow = workflow_for(&extension(Some(("rain-sound", &build))));
    assert!(workflow.contains("runner: [ubuntu-24.04, ubuntu-24.04-arm]"));
    assert!(workflow.contains("run: make rain-sound"));
    assert!(workflow.contains("tar --append --file=extension.tar rain-sound"));
    assert!(workflow.contains("\"dist/com.lantharos.Rain-$(uname -m).tar.zst\""));
    assert!(workflow.contains("runs-on: ${{ matrix.runner }}"));
}

#[test]
fn the_helper_builds_the_way_the_project_does() {
    let folder = tempfile::tempdir().unwrap();
    write(folder.path(), "Cargo.toml", "[package]\nname = \"rain\"\n");
    assert_eq!(
        helper_build(folder.path(), "bin/rain-sound").unwrap(),
        "cargo build --release --bin rain-sound && cp target/release/rain-sound bin/rain-sound"
    );
}

#[test]
fn an_extension_without_a_helper_stays_one_file() {
    assert!(workflow_for(&extension(None)).contains("zstd -19 -o dist/com.lantharos.Rain.tar.zst"));
}

#[test]
fn the_sabine_version_comes_from_the_project_even_when_its_workflow_pins_a_commit() {
    let folder = sabine_repository();
    write(
        folder.path(),
        "desktop/Cargo.toml",
        "[dependencies]\nsabine = { git = \"https://github.com/Lantharos/Sabine.git\", tag = \"v0.78\" }\n",
    );
    assert_eq!(sabine_version(folder.path()).unwrap(), "v0.78");
}

#[test]
fn the_workflow_keeps_the_build_settings_of_the_one_it_replaces() {
    let folder = sabine_repository();
    let inputs = sabine_inputs(folder.path()).unwrap();
    assert_eq!(
        inputs,
        [
            ("rust_toolchain".to_owned(), "\"1.99\"".to_owned()),
            ("upgrade_from_sabine_version".to_owned(), "v0.22".to_owned())
        ]
    );
    let workflow = workflow_for(&SetupInput {
        id: "al.kaleid.notes".into(),
        kind: "app".into(),
        format: "sabine".into(),
        sabine_version: Some("v0.78".into()),
        sabine_inputs: Some(inputs),
        ..SetupInput::default()
    });
    assert!(workflow.contains("rust_toolchain: \"1.99\""));
    assert!(workflow.contains("upgrade_from_sabine_version: v0.22"));
}

#[test]
fn the_old_release_workflow_is_found_and_the_new_one_isnt() {
    let folder = sabine_repository();
    let input = SetupInput {
        id: "al.kaleid.notes".into(),
        kind: "app".into(),
        format: "sabine".into(),
        sabine_version: Some("v0.78".into()),
        ..SetupInput::default()
    };
    write(folder.path(), SCHELF_WORKFLOW, &workflow_for(&input));
    assert_eq!(
        replaced_workflows(folder.path()),
        [".github/workflows/release.yml"]
    );
}

#[test]
fn the_listing_init_writes_keeps_screenshots_already_in_the_listing_folder_where_they_are() {
    let folder = sabine_repository();
    write(
        folder.path(),
        "Sabine.toml",
        "[app]\nid = \"al.kaleid.notes\"\nname = \"Notes\"\n",
    );
    write(
        folder.path(),
        "store/al.kaleid.notes.metainfo.xml",
        "<component type=\"desktop-application\">\n  <id>al.kaleid.notes</id>\n  <name>Notes</name>\n  <summary>Notes</summary>\n  <screenshots>\n    <screenshot><image>store/screenshots/one.png</image></screenshot>\n    <screenshot><image>store/screenshots/two.png</image></screenshot>\n  </screenshots>\n</component>\n",
    );
    let project = detect_project(folder.path()).unwrap();
    let identity = Identity {
        id: "al.kaleid.notes".into(),
        name: "Notes".into(),
        summary: "Notes".into(),
    };
    let files = listing_files(&project, &identity).unwrap();
    assert_eq!(
        files
            .iter()
            .map(|file| file.path.as_str())
            .collect::<Vec<_>>(),
        ["store/listing.toml"]
    );
    let listing = parse(
        "listing.toml",
        std::str::from_utf8(&files[0].contents).unwrap(),
    )
    .unwrap();
    assert_eq!(
        listing.screenshots.unwrap(),
        [
            Screenshot::File("screenshots/one.png".into()),
            Screenshot::File("screenshots/two.png".into())
        ]
    );
}
