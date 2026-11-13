use std::time::{Duration, Instant};

use serde_json::{Value, json};

use crate::dates::at;
use crate::fixtures::USER_NAME;
use crate::http::{Request, Response};
use crate::state::{Pending, State};

const APPROVED_AFTER: Duration = Duration::from_secs(6);

fn text<'a>(action: &'a Value, key: &str) -> &'a str {
    action[key].as_str().unwrap_or_default()
}

fn summary(state: &State, action: &Value) -> String {
    let app = state
        .project(text(action, "app"))
        .map(|project| {
            project["app"]["name"]
                .as_str()
                .unwrap_or_default()
                .to_owned()
        })
        .unwrap_or_default();
    let release = || {
        state
            .releases
            .get(text(action, "app"))
            .and_then(|releases| {
                releases
                    .iter()
                    .find(|release| release["id"] == action["release"])
                    .map(|release| {
                        format!(
                            "{} {} on {}",
                            app,
                            text(release, "version"),
                            text(release, "channel")
                        )
                    })
            })
    };
    let member = || {
        state
            .members
            .get(text(action, "publisher"))
            .and_then(|members| {
                members["members"]
                    .as_array()?
                    .iter()
                    .find(|member| member["user_id"] == action["user"])
                    .map(|member| text(member, "name").to_owned())
            })
    };
    match text(action, "type") {
        "release.rollback" => format!(
            "Stop {} for everyone and offer the release before it again",
            release().unwrap_or_default()
        ),
        "release.inside-luft" => format!(
            "Ask a reviewer to let {} run inside Luft",
            release().unwrap_or_default()
        ),
        "channel.invite" => format!(
            "Let {} download {app} from its invite-only {} channel, and email them",
            text(action, "email"),
            text(action, "channel")
        ),
        "member.invite" => format!(
            "Invite {} to Drita Studio as {}",
            action["to"]["email"]
                .as_str()
                .map_or_else(|| format!("@{}", text(&action["to"], "github")), str::to_owned),
            text(action, "role")
        ),
        "member.role" => format!(
            "Make {} {} of Drita Studio",
            member().unwrap_or_default(),
            text(action, "role")
        ),
        "member.remove" => format!("Remove {} from Drita Studio", member().unwrap_or_default()),
        "publisher.domain" => action["domain"].as_str().map_or_else(
            || "Stop serving Drita Studio's download links on its own domain".to_owned(),
            |domain| format!("Serve the download links of every project of Drita Studio on {domain}, once its DNS records are in"),
        ),
        other => other.to_owned(),
    }
}

fn apply(state: &mut State, action: &Value) {
    match text(action, "type") {
        "release.rollback" => {
            if let Some(release) = state.release_mut(text(action, "app"), text(action, "release")) {
                release["status"] = json!("withdrawn");
                release["next"] = Value::Null;
            }
        }
        "channel.invite" => {
            let key = (
                text(action, "app").to_owned(),
                text(action, "channel").to_owned(),
            );
            if let Some(invites) = state
                .access
                .get_mut(&key)
                .and_then(|access| access["invites"].as_array_mut())
            {
                invites.push(json!({
                    "id": format!("ci_{}", invites.len() + 1), "email": action["email"],
                    "invited_by": USER_NAME, "created_at": at(0, 12)
                }));
            }
        }
        "member.invite" => {
            if let Some(invites) = state
                .members
                .get_mut(text(action, "publisher"))
                .and_then(|members| members["invites"].as_array_mut())
            {
                invites.push(json!({
                    "id": format!("invite_{}", invites.len() + 1), "email": action["to"]["email"],
                    "github": action["to"]["github"], "avatar": null, "role": action["role"],
                    "invited_by": USER_NAME, "expires_at": at(-14, 12)
                }));
            }
        }
        "member.role" | "member.remove" => {
            if let Some(members) = state
                .members
                .get_mut(text(action, "publisher"))
                .and_then(|members| members["members"].as_array_mut())
            {
                let user = text(action, "user");
                if text(action, "type") == "member.remove" {
                    members.retain(|member| member["user_id"] != user);
                } else if let Some(member) =
                    members.iter_mut().find(|member| member["user_id"] == user)
                {
                    member["role"] = action["role"].clone();
                }
            }
        }
        "publisher.domain" => {
            let domain = action["domain"].as_str().map_or(Value::Null, |domain| {
                json!({
                    "domain": domain, "status": "proving",
                    "records": [{ "type": "TXT", "name": format!("_schelf.{domain}"), "value": "schelf-domain=0c41d7" }],
                    "waiting": format!("Waiting for the TXT record on _schelf.{domain}"), "checked_at": null
                })
            });
            state
                .domains
                .insert(text(action, "publisher").to_owned(), domain);
        }
        _ => {}
    }
}

fn create(state: &mut State, body: &Value) -> Response {
    let actions = body["actions"].as_array().cloned().unwrap_or_default();
    let id = format!("request_{}", state.approvals.len() + 1);
    let steps: Vec<Value> = actions
        .iter()
        .map(|action| json!({ "type": action["type"], "summary": summary(state, action), "outcome": null, "detail": null }))
        .collect();
    let approval = json!({
        "id": id, "url": format!("https://schelf.store/dashboard/requests/{id}"), "status": "pending",
        "steps": steps, "passkey": false, "requested_by": USER_NAME, "host": body["host"], "place": null,
        "created_at": at(0, 12), "expires_at": at(0, 13), "decided_at": null, "secrets": {}
    });
    state.approvals.push(Pending {
        approval: approval.clone(),
        actions,
        since: Instant::now(),
    });
    Response {
        status: 201,
        body: approval,
    }
}

fn settle(state: &mut State, index: usize) -> Value {
    let pending = &state.approvals[index];
    if pending.approval["status"] != "pending" || pending.since.elapsed() < APPROVED_AFTER {
        return pending.approval.clone();
    }
    let actions = pending.actions.clone();
    for action in &actions {
        apply(state, action);
    }
    let approval = &mut state.approvals[index].approval;
    approval["status"] = json!("done");
    approval["decided_at"] = json!(at(0, 12));
    for step in approval["steps"].as_array_mut().into_iter().flatten() {
        step["outcome"] = json!("done");
    }
    approval.clone()
}

pub fn route(state: &mut State, request: &Request, path: &[&str]) -> Response {
    let index = |id: &str| {
        state
            .approvals
            .iter()
            .position(|pending| pending.approval["id"] == id)
    };
    match (request.method.as_str(), path) {
        ("POST", []) => create(state, &request.body),
        ("GET", [id]) => match index(id) {
            Some(index) => Response::ok(settle(state, index)),
            None => Response::refused(404, "There's no such request"),
        },
        ("POST", [id, "cancel"]) => match index(id) {
            Some(index) => {
                let approval = &mut state.approvals[index].approval;
                approval["status"] = json!("cancelled");
                Response::ok(approval.clone())
            }
            None => Response::refused(404, "There's no such request"),
        },
        _ => Response::refused(404, "There's nothing here"),
    }
}
