use std::path::Path;

use super::detect_project;

fn write(root: &Path, path: &str, contents: &str) {
    let path = root.join(path);
    std::fs::create_dir_all(path.parent().unwrap()).unwrap();
    std::fs::write(path, contents).unwrap();
}

#[test]
fn a_short_description_in_sabine_toml_serves_as_the_summary() {
    let folder = tempfile::tempdir().unwrap();
    write(
        folder.path(),
        "Sabine.toml",
        "[app]\nid = \"al.kaleid.notes\"\nname = \"Notes\"\ndescription = \"Quick notes\"\n",
    );
    assert_eq!(
        detect_project(folder.path()).unwrap().summary.as_deref(),
        Some("Quick notes")
    );
}

#[test]
fn a_description_too_long_for_a_summary_isnt_used_as_one() {
    let folder = tempfile::tempdir().unwrap();
    let long = "long ".repeat(30);
    write(
        folder.path(),
        "Sabine.toml",
        &format!("[app]\nid = \"al.kaleid.notes\"\nname = \"Notes\"\ndescription = \"{long}\"\n"),
    );
    assert_eq!(detect_project(folder.path()).unwrap().summary, None);
}

#[test]
fn an_electron_apps_id_comes_from_electron_builders_app_id() {
    let folder = tempfile::tempdir().unwrap();
    write(
        folder.path(),
        "package.json",
        r#"{"devDependencies":{"electron":"45.0.0"},"build":{"appId":"al.kaleid.raffi"}}"#,
    );
    let project = detect_project(folder.path()).unwrap();
    assert_eq!(project.id.as_deref(), Some("al.kaleid.raffi"));
    assert_eq!(project.format, "files");
}

#[test]
fn an_extension_with_a_helper_is_read_from_its_manifest() {
    let folder = tempfile::tempdir().unwrap();
    write(folder.path(), "extension.toml", crate::setup::tests::RAIN);
    let project = detect_project(folder.path()).unwrap();
    assert_eq!(
        (project.kind, project.format),
        ("extension", "luft-extension")
    );
    let extension = project.extension.unwrap();
    assert_eq!(extension.id, "com.lantharos.Rain");
    assert_eq!(extension.api, 1);
    assert_eq!(extension.helper.as_deref(), Some("rain-sound"));
}
