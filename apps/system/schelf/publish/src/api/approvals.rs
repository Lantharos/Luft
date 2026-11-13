use std::time::Duration;

use serde::Serialize;
use serde_json::Value;

use super::dashboard::{Json, items, text};
use super::http::{Body, request};
use super::{API_BASE, encode};
use crate::args::Args;
use crate::error::{Error, Result};
use crate::ui::output::{blank, done, emit, line, note, problem, step};
use crate::ui::style::{bold, dim, interactive, link};
use crate::ui::system::{hostname, open_browser};
use crate::ui::{DECLINED, FAILED, OK, WAITING};

const POLL: Duration = Duration::from_secs(2);

fn base(api: &str) -> String {
    format!("{api}{API_BASE}/dev/requests")
}

pub fn approval_of(api: &str, token: &str, id: &str) -> Result<Json> {
    request(
        "GET",
        &format!("{}/{}", base(api), encode(id)),
        Some(token),
        Body::Empty,
    )
}

pub fn print_approval(approval: &Value) {
    for (index, entry) in items(&approval["steps"]).iter().enumerate() {
        let mark = match entry["outcome"].as_str() {
            Some("done") => "✓".to_owned(),
            Some("failed") => "✕".to_owned(),
            _ => format!("{}.", index + 1),
        };
        line(&format!("{} {}", dim(&mark), text(entry, "summary")));
        if let Some(detail) = entry["detail"].as_str().filter(|detail| !detail.is_empty()) {
            problem(&format!("  {detail}"));
        }
    }
}

pub fn waits(args: &Args) -> bool {
    args.has("wait") || (interactive() && !args.has("no-wait") && !args.has("json"))
}

pub fn wait_for_approval(api: &str, token: &str, id: &str) -> Result<Json> {
    loop {
        let approval = approval_of(api, token, id)?;
        if text(&approval.value, "status") != "pending" {
            return Ok(approval);
        }
        std::thread::sleep(POLL);
    }
}

/// Says how a request for approval ended, and gives its exit code.
pub fn settled(approval: &Json) -> Result<i32> {
    emit(&approval.raw);
    let value = &approval.value;
    let status = text(value, "status");
    if status == "pending" {
        note(&format!(
            "Waiting for you to approve it. schelf request status {} --wait waits for it.",
            text(value, "id")
        ));
        return Ok(WAITING);
    }
    blank();
    print_approval(value);
    blank();
    match status {
        "done" => {
            done("Approved and done");
            Ok(OK)
        }
        "failed" => Err(Error::coded(
            "Approved, but not everything happened",
            FAILED,
        )),
        "expired" => Err(Error::coded("The request expired", DECLINED)),
        _ => Err(Error::coded("The request was cancelled", DECLINED)),
    }
}

pub struct Decided {
    pub code: i32,
    pub approval: Json,
}

pub fn present_approval(
    api: &str,
    token: &str,
    id: &str,
    url: &str,
    args: &Args,
) -> Result<Decided> {
    line(&format!(
        "{} {}",
        bold("Approve it in your browser:"),
        link(url)
    ));
    open_browser(url);
    let approval = if waits(args) {
        step(
            "Waiting for your approval",
            || wait_for_approval(api, token, id),
            |_| "Waiting for your approval".to_owned(),
        )?
    } else {
        approval_of(api, token, id)?
    };
    Ok(Decided {
        code: settled(&approval)?,
        approval,
    })
}

#[derive(Serialize)]
struct Ask<'a> {
    actions: &'a [Value],
    host: String,
}

/// Asks for `actions` to be approved in the browser and waits for it when
/// someone is there to.
pub fn ask_approval(api: &str, token: &str, actions: &[Value], args: &Args) -> Result<Decided> {
    let body = serde_json::to_string(&Ask {
        actions,
        host: hostname(),
    })
    .expect("the request serialises");
    let approval: Json = request("POST", &base(api), Some(token), Body::Json(body))?;
    blank();
    line("This needs you to approve it:");
    print_approval(&approval.value);
    blank();
    present_approval(
        api,
        token,
        text(&approval.value, "id"),
        text(&approval.value, "url"),
        args,
    )
}
