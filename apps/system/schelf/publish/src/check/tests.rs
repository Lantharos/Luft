use std::path::Path;
use std::process::Command;

use super::validate;
use crate::project::config::ConfigPlace;
use crate::project::detect_project;
use crate::project::sabine::follow_schelf_updates;
use crate::schema::listing::{ListingToml, Screenshot};
use crate::setup::tests::RAIN;
use crate::setup::workflow::{
    SCHELF_WORKFLOW, SetupInput, listing_toml_for, schelf_toml_for, workflow_for,
};

const SABINE_TOML: &str =
    "[app]\nid = \"io.github.alice.Notes\"\nname = \"Notes\"\nversion = \"1.2.0\"\n";

fn write(root: &Path, path: &str, contents: impl AsRef<[u8]>) {
    let path = root.join(path);
    std::fs::create_dir_all(path.parent().unwrap()).unwrap();
    std::fs::write(path, contents).unwrap();
}

fn png(width: u32, height: u32) -> Vec<u8> {
    let mut bytes = vec![0u8; 40];
    bytes[..8].copy_from_slice(&[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    bytes[16..20].copy_from_slice(&width.to_be_bytes());
    bytes[20..24].copy_from_slice(&height.to_be_bytes());
    bytes
}

fn setup() -> SetupInput {
    SetupInput {
        id: "io.github.alice.Notes".into(),
        kind: "app".into(),
        format: "sabine".into(),
        sabine_version: Some("v0.68".into()),
        listing: Some("store".into()),
        ..SetupInput::default()
    }
}

fn git(root: &Path, arguments: &[&str]) {
    assert!(
        Command::new("git")
            .args(arguments)
            .current_dir(root)
            .status()
            .unwrap()
            .success()
    );
}

fn notes() -> tempfile::TempDir {
    let folder = tempfile::tempdir().unwrap();
    let root = folder.path();
    git(root, &["init", "-q"]);
    git(
        root,
        &["remote", "add", "origin", "git@github.com:alice/notes.git"],
    );
    write(root, "Sabine.toml", follow_schelf_updates(SABINE_TOML));
    write(
        root,
        "data/io.github.alice.Notes.metainfo.xml",
        include_str!("../../fixtures/notes.metainfo.xml"),
    );
    write(root, "schelf.toml", schelf_toml_for(&setup()));
    write(root, SCHELF_WORKFLOW, workflow_for(&setup()));
    let listing = ListingToml {
        name: "Notes".into(),
        summary: "A quick place for your thoughts".into(),
        description: Some("Write things down.".into()),
        categories: Some(vec!["Office".into()]),
        homepage: Some("https://example.com".into()),
        support: Some("https://example.com/help".into()),
        icon: Some("icon.svg".into()),
        screenshots: Some(vec![
            Screenshot::File("one.png".into()),
            Screenshot::File("two.png".into()),
        ]),
        ..ListingToml::default()
    };
    write(root, "store/listing.toml", listing_toml_for(&listing));
    write(
        root,
        "store/icon.svg",
        "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1 1\"/>",
    );
    write(root, "store/one.png", png(1280, 800));
    write(root, "store/two.png", png(1280, 800));
    folder
}

fn messages_in(root: &Path, folder: &Path) -> Vec<String> {
    let place = ConfigPlace {
        root: root.to_path_buf(),
        config: folder.join("schelf.toml"),
        folder: folder.to_path_buf(),
    };
    validate(&detect_project(folder).unwrap(), &place)
        .unwrap()
        .issues
        .iter()
        .map(|issue| {
            let level = match issue.level {
                super::issues::Level::Error => "error",
                super::issues::Level::Warning => "warning",
            };
            format!("{level}: {}", issue.text())
        })
        .collect()
}

fn messages(root: &Path) -> Vec<String> {
    messages_in(root, root)
}

#[test]
fn a_project_set_up_by_init_is_ready_to_publish() {
    let folder = notes();
    let project = detect_project(folder.path()).unwrap();
    assert_eq!(project.format, "sabine");
    assert_eq!(project.id.as_deref(), Some("io.github.alice.Notes"));
    assert_eq!(
        project.summary.as_deref(),
        Some("A quick place for your thoughts")
    );
    assert_eq!(project.licence.as_deref(), Some("GPL-3.0-or-later"));
    assert_eq!(project.repository.unwrap().full_name(), "alice/notes");
    assert_eq!(
        project.found,
        ["Sabine.toml", "data/io.github.alice.Notes.metainfo.xml"]
    );
    assert_eq!(messages(folder.path()), Vec::<String>::new());
}

#[test]
fn ids_that_disagree_are_an_error() {
    let folder = notes();
    let other = SetupInput {
        id: "io.github.alice.Other".into(),
        ..setup()
    };
    write(folder.path(), "schelf.toml", schelf_toml_for(&other));
    assert!(messages(folder.path()).contains(
        &"error: schelf.toml id: io.github.alice.Other, but Sabine.toml says io.github.alice.Notes".to_owned()
    ));
}

#[test]
fn a_sabine_app_that_doesnt_update_from_schelf_and_a_stale_workflow_are_called_out() {
    let folder = notes();
    write(folder.path(), "Sabine.toml", SABINE_TOML);
    let stale = SetupInput {
        sabine_version: Some("v0.67".into()),
        ..setup()
    };
    write(folder.path(), SCHELF_WORKFLOW, workflow_for(&stale));
    let found = messages(folder.path());
    assert!(found.contains(
        &"warning: Sabine.toml updates.provider: isn't schelf, so copies on Windows and macOS won't get updates".to_owned()
    ));
    assert!(found.contains(&format!(
        "warning: {SCHELF_WORKFLOW}: builds with Sabine 0.67, schelf.toml requires 0.68"
    )));
}

#[test]
fn a_broken_schelf_toml_is_explained() {
    let folder = notes();
    write(
        folder.path(),
        "schelf.toml",
        "id = \"notes\"\nformat = \"sabine\"\n",
    );
    assert!(messages(folder.path()).contains(
        &"error: schelf.toml id: An app id is reverse DNS, like io.github.alice.Notes".to_owned()
    ));
}

#[test]
fn a_permission_declaration_that_asks_for_something_that_doesnt_exist_is_an_error() {
    let folder = notes();
    let declared = SetupInput {
        permissions: Some("Sabine.toml".into()),
        ..setup()
    };
    write(folder.path(), "schelf.toml", schelf_toml_for(&declared));
    write(
        folder.path(),
        "Sabine.toml",
        format!(
            "{}\n[sandbox]\nfilesystems = [\"/etc\"]\n",
            follow_schelf_updates(SABINE_TOML)
        ),
    );
    assert!(
        messages(folder.path()).contains(
            &"error: Sabine.toml sandbox.filesystems.0: /etc isn't a folder an app can ask for."
                .to_owned()
        )
    );
}

#[test]
fn a_screenshot_too_small_for_the_store_page_is_named_with_its_key() {
    let folder = notes();
    write(folder.path(), "store/two.png", png(320, 200));
    assert!(messages(folder.path()).contains(
        &"error: store/listing.toml screenshots.1: two.png is 320×200; screenshots are at least 640 pixels on each side".to_owned()
    ));
}

#[test]
fn a_missing_workflow_is_an_error() {
    let folder = notes();
    std::fs::remove_file(folder.path().join(SCHELF_WORKFLOW)).unwrap();
    assert!(messages(folder.path()).contains(&format!("error: {SCHELF_WORKFLOW}: doesn't exist")));
}

#[test]
fn an_app_in_a_folder_of_a_bigger_repository_is_checked_from_its_own_folder() {
    let folder = notes();
    let root = folder.path();
    let app = root.join("apps").join("notes");
    std::fs::create_dir_all(&app).unwrap();
    for file in ["Sabine.toml", "schelf.toml", "store", "data"] {
        let status = Command::new("cp")
            .arg("-r")
            .arg(root.join(file))
            .arg(&app)
            .status()
            .unwrap();
        assert!(status.success());
    }
    std::fs::remove_file(root.join("schelf.toml")).unwrap();
    assert_eq!(
        messages_in(root, &app),
        ["warning: apps/notes/schelf.toml: isn't named by any workflow in .github/workflows"]
    );
    write(
        root,
        ".github/workflows/apps.yml",
        "uses: Lantharos/Store/publish@v1\nwith:\n  schelf-toml: apps/notes/schelf.toml\n",
    );
    assert_eq!(messages_in(root, &app), Vec::<String>::new());
}

#[test]
fn schelf_check_asks_for_the_oldest_luft_the_extension_runs_on() {
    let folder = tempfile::tempdir().unwrap();
    let root = folder.path();
    git(root, &["init", "-q"]);
    write(root, "extension.toml", RAIN);
    let rain = SetupInput {
        id: "com.lantharos.Rain".into(),
        kind: "extension".into(),
        format: "luft-extension".into(),
        extension_api: Some(1),
        ..SetupInput::default()
    };
    write(root, "schelf.toml", schelf_toml_for(&rain));
    write(root, SCHELF_WORKFLOW, workflow_for(&rain));
    let luft = || -> Vec<String> {
        messages(root)
            .into_iter()
            .filter(|message| message.contains("Luft"))
            .collect()
    };
    assert_eq!(
        luft(),
        ["error: extension.toml luft.minimum: doesn't say the oldest Luft it runs on"]
    );
    write(
        root,
        "extension.toml",
        format!("{RAIN}\n[luft]\nminimum = \"1.2.0\"\n"),
    );
    assert_eq!(
        luft(),
        ["error: extension.toml luft.minimum: A Luft version looks like 1.2 or 1.2-nightly.21"]
    );
    write(
        root,
        "extension.toml",
        format!("{RAIN}\n[luft]\nminimum = \"1.0-nightly.27\"\n"),
    );
    assert_eq!(luft(), Vec::<String>::new());
}
