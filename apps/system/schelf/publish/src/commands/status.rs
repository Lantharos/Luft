use serde::Serialize;
use serde_json::Value;
use serde_json::value::RawValue;

use super::context::{Context, app_of, find_release, signed_in};
use crate::api::dashboard::{items, text};
use crate::api::pick;
use crate::args::Args;
use crate::error::Result;
use crate::ui::output::{blank, emit, field, field_in, line, note, pad, title};
use crate::ui::style::{bad, good, link, muted, warn};
use crate::ui::{OK, WAITING};

const IN_FLIGHT: [&str; 5] = [
    "uploading",
    "checking",
    "in-review",
    "changes-requested",
    "rolling-out",
];
const WAITING_ON_YOU: [&str; 3] = ["failed", "changes-requested", "uploading"];

pub fn mark(status: &str) -> String {
    match status {
        "passed" => good("✓"),
        "warning" => warn("!"),
        _ => bad("✕"),
    }
}

/// The checks a release went through, all in one line when they all passed.
pub fn print_checks(checks: &[(String, String, String)]) {
    if checks.is_empty() {
        return;
    }
    if checks.iter().all(|(_, status, _)| status == "passed") {
        line(&format!(
            "{} All {} checks passed",
            mark("passed"),
            checks.len()
        ));
        return;
    }
    for (name, status, summary) in checks {
        line(&format!(
            "{} {}{}",
            mark(status),
            pad(name, 15),
            muted(summary)
        ));
    }
}

pub fn checks_of(value: &Value) -> Vec<(String, String, String)> {
    items(value)
        .iter()
        .map(|check| {
            (
                text(check, "name").to_owned(),
                text(check, "status").to_owned(),
                text(check, "summary").to_owned(),
            )
        })
        .collect()
}

/// How long ago an ISO time was, in words.
pub fn ago(iso: &str) -> String {
    let then = chrono::DateTime::parse_from_rfc3339(iso)
        .map(|time| time.timestamp_millis())
        .unwrap_or_default();
    let minutes = ((chrono::Utc::now().timestamp_millis() - then) as f64 / 60_000.0).round() as i64;
    if minutes < 60 {
        let plural = if minutes == 1 { "" } else { "s" };
        return format!("{minutes} minute{plural} ago");
    }
    let hours = (minutes as f64 / 60.0).round() as i64;
    if hours < 48 {
        let plural = if hours == 1 { "" } else { "s" };
        return format!("{hours} hour{plural} ago");
    }
    format!("{} days ago", (hours as f64 / 24.0).round() as i64)
}

fn spaced(status: &str) -> String {
    status.replacen('-', " ", 1)
}

fn place(release: &Value) -> String {
    let status = text(release, "status");
    if status == "rolling-out" || status == "live" {
        let paused = if release["rollout_paused"].as_bool() == Some(true) {
            ", paused"
        } else {
            ""
        };
        return format!(
            "{}, {}%{paused}",
            spaced(status),
            release["rollout_percent"]
        );
    }
    spaced(status)
}

fn print_release(context: &Context, id: &str, release: &Value) {
    title(&format!(
        "{id} {} on {}",
        text(release, "version"),
        text(release, "channel")
    ));
    let origin = if text(release, "origin") == "oidc" {
        "built on GitHub Actions"
    } else {
        "uploaded by the developer"
    };
    line(&format!(
        "{} {}",
        place(release),
        muted(&format!(
            "· {origin} · {}",
            ago(text(release, "created_at"))
        ))
    ));
    blank();
    print_checks(&checks_of(&release["checks"]));
    blank();
    for file in items(&release["artifacts"]) {
        let label = [file["part"].as_str(), file["platform"].as_str()]
            .into_iter()
            .flatten()
            .filter(|part| !part.is_empty())
            .collect::<Vec<_>>()
            .join(" ");
        let sha = text(file, "sha256");
        field_in(
            &label,
            &format!(
                "{} {}",
                text(file, "name"),
                muted(&sha[..sha.len().min(16)])
            ),
            24,
        );
    }
    blank();
    if let Some(next) = release["next"].as_str().filter(|next| !next.is_empty()) {
        field("Next", next);
    }
    if let Some(run) = release["run_url"].as_str().filter(|run| !run.is_empty()) {
        field("Build", &link(run));
    }
    field(
        "Dashboard",
        &link(&format!(
            "{}/dashboard/apps/{id}/releases/{}",
            context.api,
            text(release, "id")
        )),
    );
    blank();
}

#[derive(Serialize)]
struct Overview<'a> {
    app: Box<RawValue>,
    releases: Vec<&'a RawValue>,
    approvals: &'a RawValue,
    config: Box<RawValue>,
}

fn overview(context: &Context, id: &str) -> Result<i32> {
    let settings = context.dashboard.app(id)?;
    let releases = context.dashboard.releases(id)?;
    let approvals = context.dashboard.approvals()?;
    let all = items(&releases.value);
    let flying: Vec<&Value> = all
        .iter()
        .filter(|release| IN_FLIGHT.contains(&text(release, "status")))
        .collect();
    let mut latest: Vec<&Value> = Vec::new();
    for release in all {
        match latest
            .iter_mut()
            .find(|known| text(known, "channel") == text(release, "channel"))
        {
            Some(known) => *known = release,
            None => latest.push(release),
        }
    }
    let attention: Vec<&Value> = latest
        .into_iter()
        .filter(|release| WAITING_ON_YOU.contains(&text(release, "status")))
        .collect();
    let wanted: Vec<&Value> = flying
        .iter()
        .copied()
        .chain(
            attention
                .iter()
                .copied()
                .filter(|release| !flying.contains(release)),
        )
        .collect();
    let details = wanted
        .iter()
        .map(|release| context.dashboard.release(id, text(release, "id")))
        .collect::<Result<Vec<_>>>()?;
    let app = &settings.value["app"];
    emit(&Overview {
        app: pick(&settings.raw, "app"),
        releases: details.iter().map(|detail| detail.raw.as_ref()).collect(),
        approvals: &approvals.raw,
        config: pick(&settings.raw, "config"),
    });
    title(&format!("{} {}", text(app, "name"), muted(text(app, "id"))));
    let visibility = if text(app, "visibility") == "listed" {
        "listed"
    } else if app["listing_requested"].as_bool() == Some(true) {
        "unlisted, waiting for a reviewer to list it"
    } else {
        "unlisted"
    };
    field("Visibility", visibility);
    let applied = settings.value["config"]["applied_at"].as_str().map_or_else(
        || "never applied; run schelf apply".to_owned(),
        |at| format!("applied {}", ago(at)),
    );
    field("Files", &applied);
    blank();
    if details.is_empty() {
        note(if all.is_empty() {
            "No releases yet."
        } else {
            "Nothing in flight."
        });
    }
    for detail in &details {
        let release = &detail.value;
        line(&format!(
            "{} {}  {}",
            text(release, "version"),
            muted(&format!("on {}", text(release, "channel"))),
            place(release)
        ));
        for (name, status, summary) in checks_of(&release["checks"]) {
            if status != "passed" {
                line(&format!("  {} {name}: {}", mark(&status), muted(&summary)));
            }
        }
        if let Some(next) = release["next"].as_str().filter(|next| !next.is_empty()) {
            note(&format!("  {next}"));
        }
    }
    let waiting = items(&approvals.value);
    if !waiting.is_empty() {
        blank();
        line("Waiting for your approval:");
        for approval in waiting {
            let steps = items(&approval["steps"])
                .iter()
                .map(|step| text(step, "summary"))
                .collect::<Vec<_>>()
                .join("; ");
            line(&format!("  {steps} {}", muted(text(approval, "url"))));
        }
    }
    blank();
    Ok(if waiting.is_empty() && attention.is_empty() {
        OK
    } else {
        WAITING
    })
}

pub fn status(args: &mut Args) -> Result<i32> {
    let context = signed_in(args)?;
    let id = app_of(args)?;
    let Some(version) = args.positional(0) else {
        return overview(&context, &id);
    };
    let found = find_release(&context.dashboard, &id, Some(version))?;
    let release = context.dashboard.release(&id, text(&found, "id"))?;
    emit(&release.raw);
    print_release(&context, &id, &release.value);
    Ok(OK)
}

#[derive(Serialize)]
#[serde(tag = "action", rename_all = "lowercase")]
pub enum RolloutRequest {
    Pause,
    Resume,
    All,
    Set { percent: u8 },
}

pub fn rollout_request(change: &str) -> Result<RolloutRequest> {
    match change {
        "pause" => return Ok(RolloutRequest::Pause),
        "resume" => return Ok(RolloutRequest::Resume),
        "all" => return Ok(RolloutRequest::All),
        _ => {}
    }
    let percent = change
        .strip_suffix('%')
        .unwrap_or(change)
        .parse::<u8>()
        .ok();
    match percent {
        Some(100) => Ok(RolloutRequest::All),
        Some(percent @ 1..=99) => Ok(RolloutRequest::Set { percent }),
        _ => Err(crate::error::Error::hinted(
            format!("{change} isn't a rollout change"),
            "Use a percentage from 1 to 100, pause, resume or all.",
            crate::ui::USAGE,
        )),
    }
}

const ROLLOUT_USAGE: &str = "rollout <version> <percent|pause|resume|all>";

pub fn rollout(args: &mut Args) -> Result<i32> {
    let version = args.positional(0).map(str::to_owned);
    let change = super::context::needs(args.positional(1), ROLLOUT_USAGE)?;
    let request = rollout_request(change)?;
    let context = signed_in(args)?;
    let id = app_of(args)?;
    blank();
    let version = super::context::needs(version.as_deref(), ROLLOUT_USAGE)?;
    let label = format!("Changing the rollout of {id} {version}");
    let release = crate::ui::output::step_plain(&label, || {
        let found = find_release(&context.dashboard, &id, Some(version))?;
        context.dashboard.rollout(&id, text(&found, "id"), &request)
    })?;
    emit(&release.raw);
    let paused = if release.value["rollout_paused"].as_bool() == Some(true) {
        ", paused"
    } else {
        ""
    };
    crate::ui::output::done(&format!(
        "{}% of devices{paused}",
        release.value["rollout_percent"]
    ));
    blank();
    Ok(OK)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn shown(change: &str) -> String {
        serde_json::to_string(&rollout_request(change).ok().unwrap()).unwrap()
    }

    #[test]
    fn rollout_changes() {
        assert_eq!(shown("25"), r#"{"action":"set","percent":25}"#);
        assert_eq!(shown("50%"), r#"{"action":"set","percent":50}"#);
        assert_eq!(shown("100"), r#"{"action":"all"}"#);
        assert_eq!(shown("pause"), r#"{"action":"pause"}"#);
        assert!(rollout_request("0").is_err());
        assert!(rollout_request("faster").is_err());
    }
}
