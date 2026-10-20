use std::path::PathBuf;
use std::process::{Command, Stdio};

use luft_i18n::t;
use serde_json::Value;

use super::helper::ARGUMENT;
use crate::L10N;
use crate::app::Events;
use crate::app::calls::Helper;
use crate::app::job::Failed;
use crate::language;
use crate::protocol::Call;

const DISMISSED: i32 = 126;
const NOT_AUTHORIZED: i32 = 127;

fn program() -> std::io::Result<PathBuf> {
    std::env::var_os("APPIMAGE")
        .map(PathBuf::from)
        .map_or_else(std::env::current_exe, Ok)
}

fn start(events: &Events) -> Result<Helper, Failed> {
    let program = program().map_err(|error| error.to_string())?;
    let mut child = Command::new("pkexec")
        .arg(program)
        .arg(ARGUMENT)
        .arg(language::shown())
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()
        .map_err(|error| t!(L10N, "helper-not-started", error = error.to_string()))?;
    let calls = child.stdin.take().expect("the helper's input is piped");
    let replies = child.stdout.take().expect("the helper's output is piped");
    Ok(Helper::new(calls, replies, events, move || {
        match child.wait().map(|status| status.code()) {
            Ok(Some(DISMISSED | NOT_AUTHORIZED)) => {
                Failed::declined(t!(L10N, "helper-not-allowed"))
            }
            _ => Failed::from(t!(L10N, "helper-stopped")),
        }
    }))
}

pub fn call(events: &Events, call: Call) -> Result<Value, Failed> {
    crate::app::calls::call(events, call, start)
}
