use super::*;

fn index(releases: serde_json::Value) -> ToolIndex {
    serde_json::from_value(serde_json::json!({
        "path": "index/v1/tools/alice/notes.json",
        "serial": 7,
        "expires": "2026-11-27T10:00:00.000Z",
        "version": 1,
        "generated": "2026-11-13T10:00:00.000Z",
        "name": "notes",
        "address": "alice/notes",
        "short": true,
        "project": { "id": "alice.notes", "address": "alice/notes", "part": "cli" },
        "publisher": { "name": "Alice", "slug": "alice", "verified": true },
        "distribution": "open",
        "repository": "alice/notes",
        "ended_channels": { "beta": "stable" },
        "releases": releases,
    }))
    .unwrap()
}

fn release(
    version: &str,
    channel: &str,
    percent: u8,
    platforms: &[(&str, &str)],
) -> serde_json::Value {
    serde_json::json!({
        "version": version,
        "channel": channel,
        "published": "2026-11-13T10:00:00.000Z",
        "rollout": { "percent": percent, "paused": false },
        "files": platforms.iter().map(|(platform, kind)| serde_json::json!({
            "platform": platform,
            "kind": kind,
            "url": format!("https://dl.schelf.store/{version}/{platform}.{kind}"),
            "size": 1,
            "sha256": "a".repeat(64),
            "attestation": null,
        })).collect::<Vec<_>>(),
    })
}

#[test]
fn a_device_gets_the_newest_release_its_rollout_reaches_on_the_channel_people_moved_to() {
    let notes = index(serde_json::json!([
        release("1.2.0", "stable", 10, &[("linux-x86_64", "binary")]),
        release("1.1.0", "stable", 100, &[("linux-x86_64", "binary")]),
        release(
            "2.0.0-beta.1",
            "nightly",
            100,
            &[("linux-x86_64", "binary")]
        ),
    ]));
    assert_eq!(notes.release_on("stable", 0.05).unwrap().version, "1.2.0");
    assert_eq!(notes.release_on("stable", 0.5).unwrap().version, "1.1.0");
    assert_eq!(notes.release_on("beta", 0.5).unwrap().version, "1.1.0");
    assert!(notes.release_on("alpha", 0.5).is_none());
}

#[test]
fn a_channel_with_only_a_release_still_rolling_out_offers_it() {
    let notes = index(serde_json::json!([release("1.2.0", "stable", 10, &[])]));
    assert_eq!(notes.release_on("stable", 0.9).unwrap().version, "1.2.0");
}

#[test]
fn a_computer_takes_its_own_build_then_a_universal_one_then_one_for_any_system() {
    let notes = index(serde_json::json!([release(
        "1.0.0",
        "stable",
        100,
        &[
            ("linux-x86_64", "binary"),
            ("linux-x86_64", "tarball"),
            ("macos-universal", "zip"),
            ("windows-x86_64", "exe"),
            ("any", "zip")
        ],
    )]));
    let release = &notes.releases[0];
    let pick = |target: &str| {
        pick_file(release, target).map(|file| (file.platform.as_str(), file.kind.as_str()))
    };
    assert_eq!(pick("linux-x86_64"), Some(("linux-x86_64", "tarball")));
    assert_eq!(pick("macos-aarch64"), Some(("macos-universal", "zip")));
    assert_eq!(pick("windows-aarch64"), Some(("windows-x86_64", "exe")));
    assert_eq!(pick("linux-aarch64"), Some(("any", "zip")));
}

#[test]
fn a_tool_is_asked_for_by_its_address_or_its_bare_name() {
    assert_eq!(
        handle("alice/notes"),
        Some(Handle::Address(Address {
            publisher: "alice",
            name: "notes"
        }))
    );
    assert_eq!(handle("notes"), Some(Handle::Bare("notes")));
    assert_eq!(handle("Notes"), None);
    assert_eq!(handle("alice/notes/extra"), None);
    assert_eq!(
        index_path(handle("alice/notes").unwrap()),
        "index/v1/tools/alice/notes.json"
    );
    assert_eq!(
        index_path(Handle::Bare("notes")),
        "index/v1/tools/notes.json"
    );
}

#[test]
fn the_names_of_the_system_and_well_known_programs_are_kept() {
    assert!(reserved("sudo") && reserved("Git") && reserved("sch"));
    assert!(!reserved("notes"));
    assert_eq!(
        install_line(Some("notes")),
        "curl -fsSL https://schelf.store/install/notes | sh"
    );
    assert_eq!(add_line("alice/notes"), "sch add alice/notes");
}
