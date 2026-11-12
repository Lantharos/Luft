use serde_json::{Value, json};

use super::channel::{self, Following, STABLE};
use super::{Format, Listing};

const LINUX: &[&str] = &["linux-x86_64"];
const EVERYONE: f64 = 0.99;
const SEASONS: &str = "com.lantharos.seasons";
const TIDE: &str = "io.example.Tide";

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
        .newest(channel, LINUX, EVERYONE, false)
        .map(|offer| offer.release.version.as_str())
}

fn on(id: &str, chosen: Option<&str>, system: Option<&'static str>) -> Following {
    Following::decide(id, chosen.map(str::to_owned), || system)
}

fn followed_version<'a>(listing: &'a Listing, following: &Following) -> Option<&'a str> {
    listing
        .followed(following, LINUX, EVERYONE, false)
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
        .newest(STABLE, LINUX, 0.1, false)
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
    let offer = tide.newest(STABLE, LINUX, EVERYONE, false).unwrap();
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
    let offer = tide.newest(STABLE, LINUX, EVERYONE, false).unwrap();
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
    assert!(tide.newest(STABLE, LINUX, EVERYONE, false).is_none());
    let (_, artifact) = tide
        .download(&on(TIDE, None, None), LINUX, EVERYONE)
        .unwrap();
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
    assert!(tide.newest(STABLE, LINUX, EVERYONE, false).is_none());
    assert!(
        tide.download(&on(TIDE, None, None), LINUX, EVERYONE)
            .is_none()
    );
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
    let offer = tide.newest(STABLE, LINUX, EVERYONE, false).unwrap();
    assert_eq!(offer.release.version, "2.0.0");
    assert_eq!(offer.format, Format::Appimage);
}

#[test]
fn luft_own_apps_go_with_the_system_and_others_stay_on_stable() {
    assert_eq!(on(SEASONS, None, Some("nightly")).channel, "nightly");
    assert_eq!(
        on("COM.Lantharos.Seasons", None, Some("nightly")).channel,
        "nightly"
    );
    assert_eq!(on(SEASONS, None, Some(STABLE)).channel, STABLE);
    assert_eq!(on(SEASONS, None, None).channel, STABLE);
    assert_eq!(on(TIDE, None, Some("nightly")).channel, STABLE);
    assert_eq!(
        on("com.lantharoslike.Tide", None, Some("nightly")).channel,
        STABLE
    );
}

#[test]
fn a_choice_on_the_page_beats_the_system() {
    let stable = on(SEASONS, Some(STABLE), Some("nightly"));
    assert_eq!(stable.channel, STABLE);
    assert_eq!(stable.choice(), STABLE);
    assert_eq!(
        on(SEASONS, Some("nightly"), Some(STABLE)).channel,
        "nightly"
    );
    assert_eq!(on(TIDE, Some("beta"), Some(STABLE)).channel, "beta");
}

#[test]
fn choosing_stable_is_only_remembered_for_luft_own_apps() {
    let mut chosen = std::collections::BTreeMap::new();
    channel::remember(&mut chosen, "COM.Lantharos.Seasons", STABLE);
    channel::remember(&mut chosen, TIDE, "nightly");
    channel::remember(&mut chosen, TIDE, STABLE);
    assert_eq!(chosen.len(), 1);
    assert_eq!(chosen[SEASONS], STABLE);
    channel::remember(&mut chosen, SEASONS, "system");
    assert!(chosen.is_empty());
}

#[test]
fn a_nightly_system_gets_stable_until_a_nightly_release_exists() {
    let nightly = on(SEASONS, None, Some("nightly"));
    let stable_only = listing("sabine", &[release("1.2.0", STABLE, 100, &[archive()])]);
    assert_eq!(followed_version(&stable_only, &nightly), Some("1.2.0"));
    assert_eq!(
        followed_version(&channels_of_tide(), &nightly),
        Some("1.4.0-nightly.20261103")
    );
}

#[test]
fn a_nightly_system_never_gets_less_than_stable_has() {
    let behind = listing(
        "sabine",
        &[
            release("1.2.0", "nightly", 100, &[archive()]),
            release("1.3.0", STABLE, 100, &[archive()]),
        ],
    );
    assert_eq!(
        followed_version(&behind, &on(SEASONS, None, Some("nightly"))),
        Some("1.3.0")
    );
}

#[test]
fn choosing_a_channel_takes_only_its_releases() {
    let stable_only = listing("sabine", &[release("1.2.0", STABLE, 100, &[archive()])]);
    let chosen = on(SEASONS, Some("nightly"), Some("nightly"));
    assert_eq!(followed_version(&stable_only, &chosen), None);
    let tide = channels_of_tide();
    assert_eq!(
        followed_version(&tide, &on(SEASONS, Some(STABLE), Some("nightly"))),
        Some("1.2.0")
    );
}

#[test]
fn moving_to_a_stable_system_keeps_a_newer_install_until_stable_catches_up() {
    let tide = channels_of_tide();
    let installed = "1.4.0-nightly.20261103";
    let stable = on(SEASONS, None, Some(STABLE));
    assert!(!super::newer(
        followed_version(&tide, &stable).unwrap(),
        installed
    ));
    let caught_up = listing("sabine", &[release("1.4.0", STABLE, 100, &[archive()])]);
    assert!(super::newer(
        followed_version(&caught_up, &stable).unwrap(),
        installed
    ));
}

#[test]
fn the_page_leads_with_the_system_for_luft_own_apps() {
    let previews = || vec![STABLE.to_owned(), "nightly".to_owned()];
    let stable_only = || vec![STABLE.to_owned()];
    let nightly = on(SEASONS, None, Some("nightly"));
    assert_eq!(nightly.choice(), "system");
    assert_eq!(nightly.choices(stable_only()), ["system", STABLE]);
    assert_eq!(
        on(SEASONS, None, Some(STABLE)).choices(previews()),
        ["system", STABLE, "nightly"]
    );
    assert_eq!(
        on(SEASONS, None, Some(STABLE)).choices(stable_only()),
        [STABLE]
    );
    let third_party = on(TIDE, None, Some("nightly"));
    assert_eq!(third_party.choice(), STABLE);
    assert_eq!(third_party.choices(previews()), [STABLE, "nightly"]);
    assert_eq!(
        on(TIDE, Some("beta"), None).choices(stable_only()),
        [STABLE, "beta"]
    );
}

fn beta_ended_into_stable(releases: &[Value]) -> Listing {
    let mut tide = listing("sabine", releases);
    tide.ended_channels.insert("beta".into(), STABLE.into());
    tide
}

#[test]
fn choosing_an_ended_channel_follows_where_it_points() {
    let tide = beta_ended_into_stable(&[
        release("2.0.0-beta.3", "beta", 100, &[archive()]),
        release("1.9.0", STABLE, 100, &[archive()]),
    ]);
    let following = tide.resolved(on(TIDE, Some("beta"), None), LINUX);
    assert_eq!(following.channel, STABLE);
    assert_eq!(following.ended.as_deref(), Some("beta"));
    assert_eq!(following.choice(), STABLE);
    assert_eq!(followed_version(&tide, &following), Some("1.9.0"));
}

#[test]
fn a_build_newer_than_the_destination_stays_until_it_catches_up() {
    let installed = "2.0.0-beta.3";
    let tide = beta_ended_into_stable(&[
        release("2.0.0-beta.3", "beta", 100, &[archive()]),
        release("1.9.0", STABLE, 100, &[archive()]),
    ]);
    let following = tide.resolved(on(TIDE, Some("beta"), None), LINUX);
    assert!(!super::newer(
        followed_version(&tide, &following).unwrap(),
        installed
    ));
    let caught_up = beta_ended_into_stable(&[
        release("2.0.0", STABLE, 100, &[archive()]),
        release("2.0.0-beta.3", "beta", 100, &[archive()]),
    ]);
    let following = caught_up.resolved(on(TIDE, Some("beta"), None), LINUX);
    assert!(super::newer(
        followed_version(&caught_up, &following).unwrap(),
        installed
    ));
}

#[test]
fn an_ended_channel_leaves_the_page_but_keeps_its_releases_in_the_listing() {
    let tide = beta_ended_into_stable(&[
        release("2.0.0-beta.3", "beta", 100, &[archive()]),
        release("1.9.0", STABLE, 100, &[archive()]),
    ]);
    assert_eq!(tide.channels(LINUX), [STABLE]);
    assert_eq!(newest_version(&tide, "beta"), Some("2.0.0-beta.3"));
}

#[test]
fn a_luft_system_on_an_ended_channel_moves_and_keeps_stable_as_a_source() {
    let mut tide = channels_of_tide();
    tide.ended_channels.insert("nightly".into(), "beta".into());
    let following = tide.resolved(on(SEASONS, None, Some("nightly")), LINUX);
    assert_eq!(following.channel, "beta");
    assert_eq!(following.sources(), ["beta", STABLE]);
    assert_eq!(following.choice(), "system");
}

#[test]
fn the_ended_channel_stays_until_the_destination_has_something_for_this_device() {
    let tide = beta_ended_into_stable(&[
        release("2.0.0-beta.3", "beta", 100, &[archive()]),
        release(
            "1.9.0",
            STABLE,
            100,
            &[file("windows-x86_64", "sabine", "archive", "tide.zip")],
        ),
    ]);
    let following = tide.resolved(on(TIDE, Some("beta"), None), LINUX);
    assert_eq!(following.channel, "beta");
    assert_eq!(following.ended, None);
    assert_eq!(followed_version(&tide, &following), Some("2.0.0-beta.3"));
}
