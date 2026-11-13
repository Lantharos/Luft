use serde_json::{Value, json};

use crate::dates::{at, day};

pub const SESSION: &str = "stand-in-session";
pub const USER_NAME: &str = "Arbër Krasniqi";
pub const USER_EMAIL: &str = "arber@example.com";
pub const STUDIO: &str = "pub_drita";
pub const PERSONAL: &str = "pub_arber";
const DOWNLOADS: &str = "https://dl.schelf.store";

pub fn account() -> Value {
    json!({
        "user": { "id": "user_arber", "name": USER_NAME, "email": USER_EMAIL, "image": null },
        "github": "arberk",
        "avatars": { "using": "github", "github": null, "upload": null },
        "passkeys": 1,
        "agreement": "2026-11",
        "publishers": [
            {
                "id": STUDIO, "kind": "organisation", "name": "Drita Studio", "slug": "drita",
                "description": "Calm apps for every day", "website": "https://drita.al", "logo": null,
                "verified": true, "status": "active", "agreement_version": "2026-11", "role": "owner"
            },
            {
                "id": PERSONAL, "kind": "person", "name": USER_NAME, "slug": "arber",
                "description": "", "website": null, "logo": null,
                "verified": false, "status": "active", "agreement_version": "2026-11", "role": "owner"
            }
        ],
        "invites": []
    })
}

struct Plan {
    id: &'static str,
    slug: &'static str,
    publisher: &'static str,
    name: &'static str,
    format: &'static str,
    visibility: &'static str,
    status: &'static str,
    platforms: Value,
    parts: Value,
    tool: Option<&'static str>,
    channels: Value,
}

fn publisher_slug(publisher: &str) -> &'static str {
    if publisher == STUDIO {
        "drita"
    } else {
        "arber"
    }
}

fn project(plan: Plan) -> Value {
    let slug = publisher_slug(plan.publisher);
    let root = format!("{DOWNLOADS}/{slug}/{}", plan.slug);
    let tools: Vec<Value> = plan
        .tool
        .map(|name| {
            json!({
                "name": name, "part": "cli", "address": format!("{slug}/{name}"), "short": "resolves",
                "install": format!("curl -fsSL https://schelf.store/install/{name} | sh"),
                "add": format!("sch add {name}")
            })
        })
        .into_iter()
        .collect();
    let feeds: Vec<Value> = (plan.format == "sabine")
        .then(|| json!({ "updater": "sabine", "part": null, "url": format!("{root}/sabine/update.json") }))
        .into_iter()
        .collect();
    json!({
        "app": {
            "id": plan.id, "slug": plan.slug, "publisher": plan.publisher, "publisher_slug": slug,
            "visibility": plan.visibility, "listing_requested": false,
            "updater": if plan.format == "sabine" { json!("sabine") } else { Value::Null },
            "kind": "app", "format": plan.format, "name": plan.name, "icon": null, "art": null,
            "status": plan.status, "version": null, "release_status": null, "installs_7d": 0,
            "repository": format!("{slug}-studio/{}", plan.slug), "licence": "MPL-2.0",
            "distribution": "open", "page_indexed": true, "latest_follows_rollout": true,
            "platforms": plan.platforms, "parts": plan.parts, "tool": null,
            "privacy": { "telemetry": "none", "ads": false, "ai": "none" },
            "domain": null, "created_at": at(240, 10)
        },
        "tools": tools,
        "links": {
            "page": if plan.visibility == "listed" {
                format!("https://schelf.store/apps/{}", plan.id)
            } else {
                format!("https://schelf.store/{slug}/{}", plan.slug)
            },
            "latest": format!("{root}/latest"),
            "json": format!("{root}/latest.json"),
            "embed": "",
            "feeds": feeds
        },
        "channels": plan.channels,
        "trusted_publishers": [{
            "id": format!("trust_{}", plan.slug), "owner_id": "1", "repository_id": "2",
            "repository": format!("{slug}-studio/{}", plan.slug), "workflow": ".github/workflows/schelf.yml",
            "environment": null, "ref": null, "created_at": at(200, 9)
        }]
    })
}

fn channel(name: &str, gradual: bool, releases: u32, invite_only: bool) -> Value {
    json!({ "name": name, "keep": null, "gradual": gradual, "releases": releases, "ended_into": null, "invite_only": invite_only })
}

const DESKTOP: [&str; 4] = [
    "linux-x86_64",
    "linux-aarch64",
    "windows-x86_64",
    "macos-aarch64",
];

pub fn projects() -> Vec<Value> {
    vec![
        project(Plan {
            id: "com.drita.Fletore",
            slug: "fletore",
            publisher: STUDIO,
            name: "Fletore",
            format: "sabine",
            visibility: "listed",
            status: "published",
            platforms: json!(DESKTOP),
            parts: json!({}),
            tool: None,
            channels: json!([
                channel("stable", true, 3, false),
                channel("beta", false, 1, false)
            ]),
        }),
        project(Plan {
            id: "com.drita.Wetter",
            slug: "wetter",
            publisher: STUDIO,
            name: "Wetter",
            format: "appimage",
            visibility: "listed",
            status: "published",
            platforms: json!(["linux-x86_64", "linux-aarch64"]),
            parts: json!({}),
            tool: None,
            channels: json!([
                channel("stable", true, 2, false),
                channel("nightly", false, 1, false)
            ]),
        }),
        project(Plan {
            id: "com.drita.Kalendar",
            slug: "kalendar",
            publisher: STUDIO,
            name: "Kalendar",
            format: "sabine",
            visibility: "unlisted",
            status: "published",
            platforms: json!(DESKTOP),
            parts: json!({}),
            tool: None,
            channels: json!([
                channel("stable", true, 1, false),
                channel("testers", false, 1, true)
            ]),
        }),
        project(Plan {
            id: "com.drita.Paleta",
            slug: "paleta",
            publisher: STUDIO,
            name: "Paleta",
            format: "files",
            visibility: "unlisted",
            status: "published",
            platforms: Value::Null,
            parts: json!({
                "fonts": { "files": ["paleta-fonts-*.zip"], "platforms": ["any"] },
                "icons": { "files": ["paleta-icons-*.tar.gz"], "platforms": ["any"] }
            }),
            tool: None,
            channels: json!([channel("stable", false, 1, false)]),
        }),
        project(Plan {
            id: "com.drita.lumi",
            slug: "lumi",
            publisher: STUDIO,
            name: "lumi",
            format: "files",
            visibility: "unlisted",
            status: "published",
            platforms: Value::Null,
            parts: json!({
                "cli": { "files": ["lumi-*"], "platforms": ["linux-x86_64", "linux-aarch64", "macos-aarch64"], "tool": "lumi" }
            }),
            tool: Some("lumi"),
            channels: json!([channel("stable", false, 1, false)]),
        }),
        project(Plan {
            id: "al.arber.Shenime",
            slug: "shenime",
            publisher: PERSONAL,
            name: "Shënime",
            format: "appimage",
            visibility: "listed",
            status: "draft",
            platforms: json!(["linux-x86_64"]),
            parts: json!({}),
            tool: None,
            channels: json!([channel("stable", true, 1, false)]),
        }),
    ]
}

pub fn members(publisher: &str) -> Value {
    let you = json!({ "user_id": "user_arber", "name": USER_NAME, "email": USER_EMAIL, "image": null, "role": "owner", "joined_at": at(300, 11) });
    if publisher != STUDIO {
        return json!({ "members": [you], "invites": [] });
    }
    json!({
        "members": [
            you,
            { "user_id": "user_lena", "name": "Lena Hoffmann", "email": "lena@drita.al", "image": null, "role": "admin", "joined_at": at(210, 14) },
            { "user_id": "user_ivana", "name": "Ivana Horvat", "email": "ivana@drita.al", "image": null, "role": "developer", "joined_at": at(64, 9) }
        ],
        "invites": [
            { "id": "invite_mateo", "email": null, "github": "mateo-babic", "avatar": null, "role": "developer", "invited_by": "Lena Hoffmann", "expires_at": at(-11, 9) }
        ]
    })
}

pub fn verification(publisher: &str) -> Value {
    if publisher != STUDIO {
        return json!({ "verified": false, "current": null });
    }
    json!({
        "verified": true,
        "current": {
            "id": "verification_1", "status": "approved", "legal_name": "Drita Studio SH.P.K.",
            "website": "https://drita.al", "domains": [{ "name": "drita.al", "proof": "dns", "checked_at": at(90, 10) }],
            "proof_token": "", "contact_email": "hello@drita.al", "contact_confirmed": true,
            "github_org": "drita-studio", "github_org_proven": true, "note": "", "documents": [], "history": [],
            "reason": null, "submitted_at": at(96, 10), "decided_at": at(90, 15)
        }
    })
}

pub fn namespaces(publisher: &str) -> Value {
    let namespace = |prefix: &str, proof: &str, verified: bool| json!({ "prefix": prefix, "proof": proof, "token": "", "verified": verified, "verified_at": verified.then(|| at(150, 10)), "checked_at": at(1, 4), "instructions": null });
    if publisher == STUDIO {
        json!([
            namespace("com.drita", "dns", true),
            namespace("io.github.drita-studio", "github", true)
        ])
    } else {
        json!([namespace("al.arber", "dns", false)])
    }
}

pub fn domain(publisher: &str) -> Value {
    if publisher != STUDIO {
        return Value::Null;
    }
    json!({
        "domain": "get.drita.al",
        "status": "connecting",
        "records": [
            { "type": "TXT", "name": "_schelf.get.drita.al", "value": "schelf-domain=6f1c0a9e2b" },
            { "type": "CNAME", "name": "get.drita.al", "value": "domains.schelf.store" }
        ],
        "waiting": "Waiting for get.drita.al to point at domains.schelf.store",
        "checked_at": at(1, 22)
    })
}

pub fn channel_access(app: &str, channel: &str) -> Option<Value> {
    (app == "com.drita.Kalendar" && channel == "testers").then(|| {
        json!({
            "channel": "testers",
            "invites": [
                { "id": "ci_1", "email": "ivana.horvat@example.com", "invited_by": "Lena Hoffmann", "created_at": at(40, 10) },
                { "id": "ci_2", "email": "jonas.weber@example.com", "invited_by": USER_NAME, "created_at": at(21, 16) },
                { "id": "ci_3", "email": "elira.berisha@example.com", "invited_by": USER_NAME, "created_at": at(3, 12) }
            ],
            "tokens": [
                { "id": "ct_1", "name": "Smoke tests on CI", "created_at": at(30, 9), "last_used_at": at(0, 5), "revoked_at": null }
            ]
        })
    })
}

/// Downloads and updates of `app` for each of the last `days`, drawn the same
/// way every time.
pub fn stats(app: &str, days: i64) -> Value {
    let weight = app.bytes().map(u64::from).sum::<u64>() % 7 + 3;
    let age = if app == "com.drita.lumi" { 24 } else { 365 };
    let rows: Vec<Value> = (0..days.min(age))
        .rev()
        .map(|ago| {
            let wave = ((ago as f64) / 3.5).sin() * 0.25 + 1.0;
            let weekend = if (ago + 2) % 7 < 2 { 0.7 } else { 1.0 };
            let growth = 1.0 + (days - ago) as f64 / days as f64 * 0.4;
            let installs = (weight as f64 * 11.0 * wave * weekend * growth).round();
            let updates = (installs * 2.6 + ((ago * 37) % 23) as f64).round();
            json!({ "day": day(ago), "installs": installs, "updates": updates })
        })
        .collect();
    let total = |key: &str| {
        rows.iter()
            .map(|row| row[key].as_f64().unwrap_or(0.0))
            .sum::<f64>()
    };
    let (installs, updates) = (total("installs"), total("updates"));
    json!({
        "days": rows,
        "versions": [
            { "version": "latest", "installs": (installs * 0.72).round(), "updates": (updates * 0.8).round() },
            { "version": "previous", "installs": (installs * 0.28).round(), "updates": (updates * 0.2).round() }
        ],
        "platforms": [
            { "platform": "linux-x86_64", "installs": (installs * 0.61).round(), "updates": (updates * 0.64).round() },
            { "platform": "linux-aarch64", "installs": (installs * 0.14).round(), "updates": (updates * 0.12).round() },
            { "platform": "windows-x86_64", "installs": (installs * 0.17).round(), "updates": (updates * 0.16).round() },
            { "platform": "macos-aarch64", "installs": (installs * 0.08).round(), "updates": (updates * 0.08).round() }
        ],
        "total": { "installs": installs, "updates": updates }
    })
}
