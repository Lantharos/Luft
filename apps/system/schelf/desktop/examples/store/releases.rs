use serde_json::{Value, json};

use crate::dates::at;

const PASSED: [(&str, &str); 7] = [
    ("namespace", "com.drita is proven yours"),
    ("version", "Higher than every release before it"),
    ("platforms", "Every file is named for its system"),
    ("files", "Every file matches the hash it was uploaded with"),
    (
        "attestation",
        "Built by drita-studio's workflow on GitHub Actions",
    ),
    ("listing", "The listing has everything it needs"),
    ("malware", "Nothing known turned up"),
];

fn check(name: &str, status: &str, summary: &str) -> Value {
    json!({ "name": name, "status": status, "summary": summary })
}

fn passed() -> Vec<Value> {
    PASSED
        .iter()
        .map(|(name, summary)| check(name, "passed", summary))
        .collect()
}

struct Shape {
    id: &'static str,
    version: &'static str,
    channel: &'static str,
    status: &'static str,
    percent: u32,
    ago: i64,
    checks: Vec<Value>,
    review: Option<(&'static str, &'static str)>,
    next: Option<&'static str>,
    notes: &'static str,
    widened: bool,
    files: Vec<(&'static str, Option<&'static str>, &'static str)>,
}

fn release(shape: Shape) -> Value {
    let created = at(shape.ago, 9);
    let mut timeline = vec![
        json!({ "kind": "uploaded", "at": created, "origin": "oidc", "run_url": "https://github.com/drita-studio/actions/runs/1" }),
    ];
    timeline.extend(
        shape
            .checks
            .iter()
            .map(|check| json!({ "kind": "check", "at": at(shape.ago, 9), "check": check })),
    );
    if let Some((decision, reason)) = shape.review {
        timeline.push(json!({ "kind": "review", "at": at(shape.ago, 10), "decision": decision, "reason": reason }));
    }
    let shipped = ["live", "rolling-out"].contains(&shape.status);
    if shape.status == "rolling-out" {
        timeline.push(
            json!({ "kind": "rollout", "at": at(1, 8), "percent": shape.percent, "paused": false }),
        );
    }
    let artifacts: Vec<Value> = shape
        .files
        .iter()
        .map(|(platform, part, name)| {
            json!({
                "part": part, "platform": platform, "kind": "appimage", "name": name, "size": 48_213_771,
                "sha256": "9f2c4b1d7e8a06c3b5d4e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1",
                "url": format!("https://dl.schelf.store/files/{name}"), "attestation": null
            })
        })
        .collect();
    let platforms: Vec<&str> = shape
        .files
        .iter()
        .map(|(platform, _, _)| *platform)
        .collect();
    json!({
        "id": shape.id, "version": shape.version, "channel": shape.channel, "ref": format!("refs/tags/v{}", shape.version),
        "origin": "oidc", "format": "sabine", "updater": null, "bridge": false, "promoted_from": null,
        "status": shape.status, "rollout_percent": shape.percent, "rollout_paused": false,
        "platforms": platforms, "created_at": created,
        "approved_at": shipped.then(|| at(shape.ago, 10)), "approved_by": shipped.then_some("Schelf's checks"),
        "notes": shape.notes, "commit": "4be1c0d", "run_url": "https://github.com/drita-studio/actions/runs/1",
        "permissions": null, "permissions_widened": shape.widened, "luft": null, "shell": null,
        "artifacts": artifacts, "checks": shape.checks, "timeline": timeline, "next": shape.next
    })
}

const DESKTOP: [(&str, Option<&str>, &str); 4] = [
    ("linux-x86_64", None, "Fletore-linux-x86_64.tar.zst"),
    ("linux-aarch64", None, "Fletore-linux-aarch64.tar.zst"),
    ("windows-x86_64", None, "Fletore-windows-x86_64.msi"),
    ("macos-aarch64", None, "Fletore-macos-aarch64.dmg"),
];

fn live(id: &'static str, version: &'static str, channel: &'static str, ago: i64) -> Shape {
    Shape {
        id,
        version,
        channel,
        status: "live",
        percent: 100,
        ago,
        checks: passed(),
        review: None,
        next: None,
        notes: "Smaller fixes and faster start-up.",
        widened: false,
        files: DESKTOP.to_vec(),
    }
}

fn fletore() -> Vec<Value> {
    let mut checks = passed();
    checks.push(json!({
        "name": "permissions", "status": "warning",
        "summary": "Asks for the camera, which 2.3.2 didn't",
        "detail": { "added": ["camera"], "since": "2.3.2", "declared_in": "Sabine.toml" }
    }));
    checks.push(check(
        "impersonation",
        "passed",
        "The name and icon don't look like another app's",
    ));
    vec![
        release(Shape {
            id: "rel_f4",
            version: "2.4.0",
            channel: "stable",
            status: "in-review",
            percent: 0,
            ago: 0,
            checks,
            review: None,
            next: Some("A person is reviewing the release. You'll get an email when they decide."),
            notes: "Scan pages straight into a notebook with the camera.",
            widened: true,
            files: DESKTOP.to_vec(),
        }),
        release(live("rel_f3", "2.4.0-beta.3", "beta", 5)),
        release(live("rel_f2", "2.3.2", "stable", 16)),
        release(live("rel_f1", "2.3.1", "stable", 34)),
    ]
}

fn wetter() -> Vec<Value> {
    let files = vec![
        ("linux-x86_64", None, "Wetter-1.8.0-x86_64.AppImage"),
        ("linux-aarch64", None, "Wetter-1.8.0-aarch64.AppImage"),
    ];
    vec![
        release(Shape {
            status: "rolling-out",
            percent: 25,
            next: Some(
                "It reaches more devices every day. You can pause it or release it to everyone.",
            ),
            files: files.clone(),
            ..live("rel_w3", "1.8.0", "stable", 2)
        }),
        release(Shape {
            files: files.clone(),
            ..live(
                "rel_w2",
                "1.9.0-nightly.202611130412.g4be1c0d",
                "nightly",
                0,
            )
        }),
        release(Shape {
            files,
            ..live("rel_w1", "1.7.4", "stable", 22)
        }),
    ]
}

fn kalendar() -> Vec<Value> {
    vec![
        release(live("rel_k2", "1.0.0-rc.2", "testers", 3)),
        release(live("rel_k1", "0.9.1", "stable", 30)),
    ]
}

fn paleta() -> Vec<Value> {
    vec![release(Shape {
        files: vec![
            ("any", Some("fonts"), "paleta-fonts-3.1.0.zip"),
            ("any", Some("icons"), "paleta-icons-3.1.0.tar.gz"),
        ],
        ..live("rel_p1", "3.1.0", "stable", 12)
    })]
}

fn lumi() -> Vec<Value> {
    vec![release(Shape {
        files: vec![
            ("linux-x86_64", Some("cli"), "lumi-linux-x86_64"),
            ("linux-aarch64", Some("cli"), "lumi-linux-aarch64"),
            ("macos-aarch64", Some("cli"), "lumi-macos-aarch64"),
        ],
        ..live("rel_l1", "0.6.2", "stable", 8)
    })]
}

fn shenime() -> Vec<Value> {
    let mut checks = passed();
    checks[0] = json!({
        "name": "namespace", "status": "failed",
        "summary": "al.arber isn't proven yours yet",
        "detail": { "prefix": "al.arber", "methods": ["dns", "well-known"], "record": "schelf-verify=3b9e…" }
    });
    vec![release(Shape {
        status: "failed",
        percent: 0,
        checks,
        next: Some("Fix what the failed check says and publish a new release."),
        files: vec![("linux-x86_64", None, "Shenime-0.1.0-x86_64.AppImage")],
        ..live("rel_s1", "0.1.0", "stable", 1)
    })]
}

pub fn of(app: &str) -> Vec<Value> {
    match app {
        "com.drita.Fletore" => fletore(),
        "com.drita.Wetter" => wetter(),
        "com.drita.Kalendar" => kalendar(),
        "com.drita.Paleta" => paleta(),
        "com.drita.lumi" => lumi(),
        "al.arber.Shenime" => shenime(),
        _ => Vec::new(),
    }
}
