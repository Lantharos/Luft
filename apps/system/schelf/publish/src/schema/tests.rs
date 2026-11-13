use super::schelf::{parse, read};
use super::{ConfigIssue, SCHELF_TOML};

const SABINE: &str = "project = \"lantharos/sabine\"\nformat = \"files\"\n\n[parts.cli]\nfiles = [\"sabine-cli-*\"]\nplatforms = [\"linux-x86_64\", \"macos-aarch64\"]\n\n[parts.runtime]\nfiles = [\"sabine-runtime-*\"]\nplatforms = [\"linux-x86_64\"]\n";

fn keys(text: &str) -> Vec<Option<String>> {
    parse(SCHELF_TOML, text)
        .unwrap_err()
        .into_iter()
        .map(|issue| issue.key)
        .collect()
}

#[test]
fn a_project_can_be_only_named_parts_with_no_store_page() {
    let parsed = parse(SCHELF_TOML, SABINE).unwrap();
    assert_eq!(parsed.parts.keys().collect::<Vec<_>>(), ["cli", "runtime"]);
    let listed = SABINE.replace(
        "format = \"files\"",
        "format = \"files\"\nlisting = \"store\"",
    );
    assert_eq!(keys(&listed), [Some("listing".to_owned())]);
}

#[test]
fn a_part_isnt_named_like_a_system_and_the_apps_systems_fit_its_format() {
    assert_eq!(
        keys(&SABINE.replace("[parts.cli]", "[parts.linux]"))[0].as_deref(),
        Some("parts.linux")
    );
    let android =
        "id = \"io.github.alice.Notes\"\nformat = \"sabine\"\nplatforms = [\"android\"]\n";
    assert_eq!(keys(android)[0].as_deref(), Some("platforms.0"));
}

#[test]
fn a_sabine_part_has_its_own_app_id_and_a_part_of_files_its_updater() {
    let sabine = SABINE.replace(
        "platforms = [\"linux-x86_64\"]\n",
        "platforms = [\"linux-x86_64\"]\nformat = \"sabine\"\nupdater = \"tauri\"\n",
    );
    assert_eq!(
        keys(&sabine),
        [
            Some("parts.runtime.id".to_owned()),
            Some("parts.runtime.updater".to_owned())
        ]
    );
}

#[test]
fn extensions_name_the_extension_api_they_target() {
    assert!(
        read("id = \"com.lantharos.Rain\"\nkind = \"extension\"\nformat = \"luft-extension\"\n")
            .is_err()
    );
    assert!(read("id = \"com.lantharos.Rain\"\nformat = \"luft-extension\"\n").is_err());
    let rain = read(
        "id = \"com.lantharos.Rain\"\nkind = \"extension\"\nformat = \"luft-extension\"\n[requires]\nextension_api = 1\n",
    )
    .unwrap();
    assert_eq!(rain.extension_api, Some(1));
}

#[test]
fn unknown_keys_and_values_name_what_is_allowed() {
    let issues = parse(
        SCHELF_TOML,
        "id = \"io.github.alice.Notes\"\nformat = \"deb\"\ncolour = 1\n",
    )
    .unwrap_err();
    assert_eq!(
        issues.iter().map(describe).collect::<Vec<_>>(),
        [
            "schelf.toml format: isn't one of the allowed values (allowed: sabine, appimage, luft-extension, files)",
            "schelf.toml colour: colour isn't something schelf.toml sets (allowed: id, project, kind, format, updater, permissions, listing, distribution, licence, repository, requires, links, channels, platforms, domain, privacy, tool, parts)",
        ]
    );
}

fn describe(issue: &ConfigIssue) -> String {
    crate::schema::describe_issue(issue)
}

#[test]
fn a_part_or_a_whole_project_can_be_a_tool() {
    let part = "project = \"lantharos/sabine\"\nformat = \"files\"\n\n[parts.cli]\nfiles = [\"sabine-cli-*\"]\nplatforms = [\"linux-x86_64\", \"macos-aarch64\"]\ntool = \"sabine\"\n";
    assert_eq!(
        parse(SCHELF_TOML, part).unwrap().parts["cli"]
            .tool
            .as_deref(),
        Some("sabine")
    );
    let whole = "project = \"lantharos/schelf\"\nformat = \"files\"\ntool = \"schelf\"\nplatforms = [\"linux-x86_64\"]\n";
    assert_eq!(
        parse(SCHELF_TOML, whole).unwrap().tool.as_deref(),
        Some("schelf")
    );
}

#[test]
fn a_tool_is_one_program_for_a_computer_with_no_store_page_and_no_updater_of_its_own() {
    let text = "project = \"lantharos/schelf\"\nformat = \"files\"\ntool = \"schelf\"\nlisting = \"store\"\nupdater = \"electron\"\nplatforms = [\"linux-x86_64\", \"android\"]\n\n[parts.helper]\nfiles = [\"helper-*\"]\nplatforms = [\"linux-x86_64\"]\nformat = \"sabine\"\nid = \"com.lantharos.Helper\"\ntool = \"schelf\"\n";
    let mut found = keys(text);
    found.sort();
    assert_eq!(
        found,
        [
            "listing",
            "parts.helper.tool",
            "parts.helper.tool",
            "platforms.1",
            "updater"
        ]
        .map(|key| Some(key.to_owned()))
    );
}

#[test]
fn a_tool_is_named_like_the_program_it_installs() {
    let text = "project = \"lantharos/schelf\"\nformat = \"files\"\ntool = \"Schelf\"\nplatforms = [\"linux-x86_64\"]\n";
    let issues = parse(SCHELF_TOML, text).unwrap_err();
    assert_eq!(issues[0].message, crate::tools::NAME_MESSAGE);
}
