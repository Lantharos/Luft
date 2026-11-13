use serde_json::{Value, json};

use crate::approvals;
use crate::dates::at;
use crate::fixtures;
use crate::http::{Request, Response};
use crate::state::State;

const NOT_FOUND: &str = "There's nothing here";

fn found(value: Option<Value>) -> Response {
    value.map_or_else(|| Response::refused(404, NOT_FOUND), Response::ok)
}

fn stats(state: &State, app: &str, query: &str) -> Response {
    let days = query
        .split('&')
        .find_map(|pair| pair.strip_prefix("days="))
        .and_then(|days| days.parse().ok())
        .unwrap_or(30);
    let mut stats = fixtures::stats(app, days);
    let versions: Vec<Value> = state.releases[app]
        .iter()
        .filter(|release| release["status"] == "live" || release["status"] == "rolling-out")
        .map(|release| release["version"].clone())
        .collect();
    for (row, version) in stats["versions"]
        .as_array_mut()
        .expect("versions are a list")
        .iter_mut()
        .zip(versions)
    {
        row["version"] = version;
    }
    Response::ok(stats)
}

fn rollout(state: &mut State, app: &str, id: &str, body: &Value) -> Response {
    if body["action"] == "rollback" {
        return Response::refused(
            403,
            "This needs your approval in the browser; ask for it with schelf, which opens the page",
        );
    }
    let Some(release) = state.release_mut(app, id) else {
        return Response::refused(404, NOT_FOUND);
    };
    match body["action"].as_str() {
        Some("pause") => release["rollout_paused"] = json!(true),
        Some("resume") => release["rollout_paused"] = json!(false),
        Some("all") => {
            release["rollout_percent"] = json!(100);
            release["status"] = json!("live");
            release["next"] = Value::Null;
        }
        Some("set") => release["rollout_percent"] = body["percent"].clone(),
        _ => return Response::refused(422, "That isn't something a rollout does"),
    }
    let percent = release["rollout_percent"].clone();
    let paused = release["rollout_paused"].clone();
    if let Some(timeline) = release["timeline"].as_array_mut() {
        timeline.push(
            json!({ "kind": "rollout", "at": at(0, 12), "percent": percent, "paused": paused }),
        );
    }
    Response::ok(release.clone())
}

fn promote(state: &mut State, app: &str, id: &str, body: &Value) -> Response {
    let Some(release) = state.release_mut(app, id) else {
        return Response::refused(404, NOT_FOUND);
    };
    let mut promoted = release.clone();
    promoted["id"] = json!(format!(
        "{id}_{}",
        body["channel"].as_str().unwrap_or_default()
    ));
    promoted["channel"] = body["channel"].clone();
    promoted["promoted_from"] = json!(id);
    state
        .releases
        .get_mut(app)
        .expect("the release's project")
        .insert(0, promoted.clone());
    Response {
        status: 201,
        body: json!({ "release": promoted }),
    }
}

fn remove_from(list: &mut Value, id: &str, key: &str) {
    if let Some(entries) = list[key].as_array_mut() {
        entries.retain(|entry| entry["id"] != id);
    }
}

fn app_route(state: &mut State, request: &Request, path: &[&str]) -> Response {
    let body = &request.body;
    match (request.method.as_str(), path) {
        ("GET", [app]) => found(state.project(app)),
        ("POST", [app, "domain", "check"]) => found(state.project(app)),
        ("GET", [app, "releases"]) => found(state.releases.get(*app).cloned().map(Value::Array)),
        ("GET", [app, "releases", id]) => {
            found(state.release_mut(app, id).map(|release| release.clone()))
        }
        ("POST", [app, "releases", id, "rollout"]) => rollout(state, app, id, body),
        ("POST", [app, "releases", id, "promote"]) => promote(state, app, id, body),
        ("GET", [app, "stats"]) if state.releases.contains_key(*app) => {
            stats(state, app, &request.query)
        }
        ("GET", [app, "channels", channel, "access"]) => found(
            state
                .access
                .get(&((*app).to_owned(), (*channel).to_owned()))
                .cloned(),
        ),
        ("DELETE", [app, "channels", channel, kind @ ("invites" | "tokens"), id]) => {
            let key = ((*app).to_owned(), (*channel).to_owned());
            let Some(access) = state.access.get_mut(&key) else {
                return Response::refused(404, NOT_FOUND);
            };
            if *kind == "invites" {
                remove_from(access, id, "invites");
            } else if let Some(token) = access["tokens"]
                .as_array_mut()
                .and_then(|tokens| tokens.iter_mut().find(|token| token["id"] == *id))
            {
                token["revoked_at"] = json!(at(0, 12));
            }
            Response::ok(access.clone())
        }
        _ => Response::refused(404, NOT_FOUND),
    }
}

fn publisher_route(state: &mut State, request: &Request, path: &[&str]) -> Response {
    match (request.method.as_str(), path) {
        ("GET", [publisher, "apps"]) => Response::ok(state.projects_of(publisher)),
        ("GET", [publisher, "tools"]) => Response::ok(state.tools_of(publisher)),
        ("GET", [publisher, "members"]) => found(state.members.get(*publisher).cloned()),
        ("GET", [publisher, "verification"]) => Response::ok(fixtures::verification(publisher)),
        ("GET", [publisher, "namespaces"]) => Response::ok(fixtures::namespaces(publisher)),
        ("GET", [publisher, "domain"]) => found(state.domains.get(*publisher).cloned()),
        ("POST", [publisher, "domain", "check"]) => match state.domains.get_mut(*publisher) {
            Some(domain) if !domain.is_null() => {
                domain["checked_at"] = json!(at(0, 12));
                Response::ok(domain.clone())
            }
            _ => Response::refused(404, "Connect a domain first"),
        },
        ("DELETE", [publisher, "invites", id]) => {
            if let Some(members) = state.members.get_mut(*publisher) {
                remove_from(members, id, "invites");
            }
            Response {
                status: 204,
                body: Value::Null,
            }
        }
        _ => Response::refused(404, NOT_FOUND),
    }
}

pub fn handle(state: &mut State, request: &Request) -> Response {
    let path: Vec<&str> = request.path.iter().map(String::as_str).collect();
    match path.as_slice() {
        ["api", "v1", "dev", "account"] => Response::ok(fixtures::account()),
        ["api", "v1", "dev", "apps", rest @ ..] => app_route(state, request, rest),
        ["api", "v1", "dev", "publishers", rest @ ..] => publisher_route(state, request, rest),
        ["api", "v1", "dev", "requests", rest @ ..] => approvals::route(state, request, rest),
        _ => Response::refused(404, NOT_FOUND),
    }
}
