use serde_json::{Value, json};

use super::channel::{self, STABLE};
use super::{Format, Listing};

const LINUX: &[&str] = &["linux-x86_64"];
const EVERYONE: f64 = 0.99;

fn file(platform: &str, format: &str, kind: &str, name: &str) -> Value {
    json!({
        "platform": platform,
        "format": format,
        "kind": kind,
        "url": format!("https://dl.schelf.store/apps/io.example.Tide/1/{platform}/{name}"),
        "size": 1024,
        "sha256": "0".repeat(64),
        "attestation": null,
        "executable": null,
        "deltas": []
    })
}

fn release(version: &str, channel: &str, rollout: u8, artifacts: &[Value]) -> Value {
    json!({
        "version": version,
        "channel": channel,
        "published": "2026-11-03T10:00:00.000Z",
        "notes": "",
        "rollout": { "percent": rollout, "paused": false },
        "permissions": null,
        "extension": null,
        "access": "full",
        "requires": {},
        "provenance": {
            "origin": "github-actions",
            "repository": "https://github.com/example/tide",
            "workflow": null,
            "tag": null,
            "commit": null,
            "run": null
        },
        "artifacts": artifacts
    })
}

fn listing(format: &str, releases: &[Value]) -> Listing {
    serde_json::from_value(json!({
        "version": 1,
        "generated": "2026-11-03T10:00:00.000Z",
        "id": "io.example.Tide",
        "kind": "app",
        "format": format,
        "publisher": { "name": "Example", "slug": "example", "verified": false },
        "listing": { "en": { "name": "Tide", "summary": "Tides", "description": "", "keywords": [] } },
        "icon": null,
        "screenshots": [],
        "categories": [],
        "homepage": null,
        "support": null,
        "privacy_url": null,
        "content_rating": null,
        "brand_color": null,
        "licence": null,
        "repository": null,
        "distribution": "open",
        "releases": releases
    }))
    .expect("the listing parses")
}

fn archive() -> Value {
    file("linux-x86_64", "sabine", "archive", "tide.tar.zst")
}

fn channels_of_tide() -> Listing {
    listing(
        "sabine",
        &[
            release("1.4.0-nightly.20261103", "nightly", 100, &[archive()]),
            release("1.3.0-beta.2", "beta", 100, &[archive()]),
            release("1.3.0-beta.1", "beta", 100, &[archive()]),
            release("1.2.0", STABLE, 100, &[archive()]),
            release("1.1.0", STABLE, 100, &[archive()]),
        ],
    )
}

fn newest_version<'a>(listing: &'a Listing, channel: &str) -> Option<&'a str> {
    listing
        .newest(channel, LINUX, EVERYONE)
        .map(|offer| offer.release.version.as_str())
}

#[test]
fn each_channel_offers_only_its_own_releases() {
    let tide = channels_of_tide();
    assert_eq!(newest_version(&tide, STABLE), Some("1.2.0"));
    assert_eq!(newest_version(&tide, "beta"), Some("1.3.0-beta.2"));
    assert_eq!(
        newest_version(&tide, "nightly"),
        Some("1.4.0-nightly.20261103")
    );
    assert_eq!(newest_version(&tide, "canary"), None);
}

#[test]
fn a_rollout_that_has_not_reached_the_device_is_skipped() {
    let tide = listing(
        "sabine",
        &[
            release("1.3.0", STABLE, 25, &[archive()]),
            release("1.2.0", STABLE, 100, &[archive()]),
        ],
    );
    assert_eq!(newest_version(&tide, STABLE), Some("1.2.0"));
    let early = tide
        .newest(STABLE, LINUX, 0.1)
        .map(|offer| offer.release.version.as_str());
    assert_eq!(early, Some("1.3.0"));
}

#[test]
fn going_back_to_stable_waits_for_a_newer_stable_release() {
    let tide = channels_of_tide();
    let installed_from_beta = "1.3.0-beta.2";
    let stable = newest_version(&tide, STABLE).unwrap();
    assert!(!super::newer(stable, installed_from_beta));
    let next = listing("sabine", &[release("1.3.0", STABLE, 100, &[archive()])]);
    assert!(super::newer(
        newest_version(&next, STABLE).unwrap(),
        installed_from_beta
    ));
}

#[test]
fn the_page_offers_stable_and_the_preview_channels_an_app_ships_on() {
    let tide = channels_of_tide();
    assert_eq!(tide.channels(LINUX), [STABLE, "beta", "nightly"]);
    let custom = listing(
        "sabine",
        &[
            release("2.0.0-alpha.1", "alpha", 100, &[archive()]),
            release("1.0.0", STABLE, 100, &[archive()]),
        ],
    );
    assert_eq!(custom.channels(LINUX), [STABLE]);
    assert!(channel::follow("io.example.Tide", "alpha").is_err());
}

#[test]
fn a_sabine_app_installs_from_its_archive_not_its_other_packages() {
    let tide = listing(
        "sabine",
        &[release(
            "1.0.0",
            STABLE,
            100,
            &[
                file("linux-x86_64", "sabine", "app-image", "Tide.AppImage"),
                file("linux-x86_64", "sabine", "deb", "tide.deb"),
                archive(),
            ],
        )],
    );
    let offer = tide.newest(STABLE, LINUX, EVERYONE).unwrap();
    assert_eq!(offer.format, Format::Sabine);
    assert_eq!(offer.artifact.name(), "tide.tar.zst");
}

#[test]
fn an_appimage_among_files_installs_like_a_store_appimage() {
    let tide = listing(
        "files",
        &[release(
            "1.0.0",
            STABLE,
            100,
            &[
                file("windows-x86_64", "files", "exe", "Tide-Setup.exe"),
                file("linux-x86_64", "files", "deb", "tide_amd64.deb"),
                file("linux-x86_64", "files", "appimage", "Tide-x86_64.AppImage"),
            ],
        )],
    );
    let offer = tide.newest(STABLE, LINUX, EVERYONE).unwrap();
    assert_eq!(offer.format, Format::Appimage);
}

#[test]
fn linux_files_luft_cannot_install_are_offered_to_download() {
    let tide = listing(
        "files",
        &[release(
            "1.0.0",
            STABLE,
            100,
            &[
                file("linux-x86_64", "files", "rpm", "tide.rpm"),
                file("linux-x86_64", "files", "deb", "tide_amd64.deb"),
                file("any", "files", "zip", "tide-docs.zip"),
            ],
        )],
    );
    assert!(tide.newest(STABLE, LINUX, EVERYONE).is_none());
    let (_, artifact) = tide.download(STABLE, LINUX, EVERYONE).unwrap();
    assert_eq!(artifact.name(), "tide_amd64.deb");
    assert_eq!(tide.channels(LINUX), [STABLE]);
}

#[test]
fn files_for_other_systems_are_not_offered_at_all() {
    let tide = listing(
        "files",
        &[release(
            "1.0.0",
            STABLE,
            100,
            &[
                file("windows-x86_64", "files", "msi", "Tide.msi"),
                file("macos-universal", "files", "dmg", "Tide.dmg"),
                file("android", "files", "apk", "tide.apk"),
                file(
                    "linux-aarch64",
                    "files",
                    "appimage",
                    "Tide-aarch64.AppImage",
                ),
            ],
        )],
    );
    assert!(tide.newest(STABLE, LINUX, EVERYONE).is_none());
    assert!(tide.download(STABLE, LINUX, EVERYONE).is_none());
}

#[test]
fn a_move_to_a_new_framework_installs_the_new_packaging() {
    let tide = listing(
        "files",
        &[
            release(
                "2.0.0",
                STABLE,
                100,
                &[file("linux-x86_64", "files", "appimage", "Tide.AppImage")],
            ),
            release("1.9.0", STABLE, 100, &[archive()]),
        ],
    );
    let offer = tide.newest(STABLE, LINUX, EVERYONE).unwrap();
    assert_eq!(offer.release.version, "2.0.0");
    assert_eq!(offer.format, Format::Appimage);
}
