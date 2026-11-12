//! A set of changes: checked as a whole before anything changes, made right
//! away when every one is something your programs may change anyway, and
//! otherwise shown in one review on the screen, where all of it is made only
//! once someone approves it.

mod direct;
pub mod history;
mod requester;
mod review;
mod undo;

pub use undo::{history, undo, undo_last};

use std::io::Read;
use std::path::Path;

use serde::Serialize;
use serde_json::Value as Json;

use crate::bus;
use crate::failure::{Exit, Failure, Outcome};
use crate::output::{Output, table};
use crate::settings::catalogue::Setting;
use crate::settings::{self, values};
use history::{Changed, Entry, Restore};

pub struct Change {
    pub setting: &'static Setting,
    pub value: Json,
}

pub struct Request {
    pub changes: Vec<Change>,
}

fn parsed(pairs: impl IntoIterator<Item = (String, Json)>, developer: bool) -> Outcome<Request> {
    let mut changes: Vec<Change> = Vec::new();
    for (name, given) in pairs {
        let setting = settings::resolve(&name, developer)?;
        if changes.iter().any(|change| change.setting.id == setting.id) {
            return Err(Failure::invalid(format!(
                "{} is changed twice.",
                setting.id
            )));
        }
        let value = values::kind(setting)?
            .parse(&given)
            .map_err(|reason| Failure::invalid(format!("{}: {reason}", setting.id)))?;
        changes.push(Change { setting, value });
    }
    if changes.is_empty() {
        return Err(Failure::invalid("There's nothing to change."));
    }
    Ok(Request { changes })
}

impl Request {
    /// `SETTING=VALUE` as typed on the command line.
    pub fn from_arguments(arguments: &[String], developer: bool) -> Outcome<Self> {
        let pairs = arguments
            .iter()
            .map(|argument| {
                argument
                    .split_once('=')
                    .map(|(name, value)| (name.trim().to_owned(), Json::String(value.to_owned())))
                    .ok_or_else(|| Failure::invalid(format!("“{argument}” isn't SETTING=VALUE.")))
            })
            .collect::<Outcome<Vec<_>>>()?;
        parsed(pairs, developer)
    }

    pub fn from_pairs<'a>(pairs: impl IntoIterator<Item = (&'a str, &'a str)>) -> Outcome<Self> {
        parsed(
            pairs
                .into_iter()
                .map(|(name, value)| (name.to_owned(), Json::String(value.to_owned()))),
            false,
        )
    }

    /// An object of setting and value, as `luft apply` and agents send it.
    pub fn from_object(object: &Json) -> Outcome<Self> {
        let object = object
            .as_object()
            .ok_or_else(|| Failure::invalid("Changes are an object of setting and value, such as {\"appearance.style\": \"dark\"}."))?;
        parsed(
            object
                .iter()
                .map(|(name, value)| (name.clone(), value.clone())),
            false,
        )
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Applied {
    pub applied: bool,
    pub reviewed: bool,
    pub changes: Vec<Changed>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub unchanged: Vec<&'static str>,
}

impl Applied {
    fn words(&self) -> String {
        if self.changes.is_empty() {
            return "Nothing needed changing.".to_owned();
        }
        let rows = self.changes.iter().map(|change| {
            (
                change.name.as_str(),
                format!("{} → {}", change.from_words, change.to_words),
            )
        });
        let heading = if self.reviewed {
            "Changed after review:\n"
        } else {
            "Changed:\n"
        };
        format!("{heading}{}", table(rows))
    }
}

/// Makes a set of changes, after the review on the screen when it has to have one.
pub async fn make(request: Request) -> Outcome<Applied> {
    let settings: Vec<&Setting> = request
        .changes
        .iter()
        .map(|change| change.setting)
        .collect();
    let before = values::current(&settings).await?;
    let mut unchanged = Vec::new();
    let mut changing = Vec::new();
    for (change, from) in request.changes.into_iter().zip(before) {
        if change.value == from {
            unchanged.push(change.setting.id.as_str());
        } else {
            changing.push((change, from));
        }
    }
    let reviewed = changing.iter().any(|(change, _)| change.setting.reviewed());
    if changing.is_empty() {
        return Ok(Applied {
            applied: true,
            reviewed,
            changes: Vec::new(),
            unchanged,
        });
    }
    let changed: Vec<Changed> = changing
        .iter()
        .map(|(change, from)| Changed::new(change.setting, from, &change.value))
        .collect();
    let (restore, requester, stopped): (Vec<Restore>, String, Option<String>) = if reviewed {
        let answer = review::ask(&changing).await?;
        if !answer.approved {
            let reason = answer
                .error
                .unwrap_or_else(|| "The changes weren't approved".to_owned());
            return Err(Failure::new(
                Exit::Declined,
                format!("{reason}, so nothing changed."),
            ));
        }
        (answer.restore, answer.requester, answer.error)
    } else {
        let (restore, stopped) = direct::make(&changing).await;
        (restore, requester::name(), stopped)
    };
    let made = changed
        .iter()
        .filter(|change| restore.iter().any(|kept| kept.setting() == change.setting))
        .cloned()
        .collect();
    history::record(Entry::new(requester, reviewed, made, restore))?;
    if let Some(error) = stopped {
        return Err(Failure::failed(format!("Not everything changed: {error}")));
    }
    Ok(Applied {
        applied: true,
        reviewed,
        changes: changed,
        unchanged,
    })
}

pub fn apply(request: Request, output: Output) -> Outcome {
    let applied = bus::block_on(make(request))??;
    output.show(&applied, || applied.words())
}

pub fn set(arguments: &[String], developer: bool, output: Output) -> Outcome {
    if developer {
        bus::block_on(bus::require_developer_tools())??;
    }
    apply(Request::from_arguments(arguments, developer)?, output)
}

pub fn apply_file(path: &Path, output: Output) -> Outcome {
    let text = if path == Path::new("-") {
        let mut text = String::new();
        std::io::stdin().read_to_string(&mut text)?;
        text
    } else {
        std::fs::read_to_string(path)
            .map_err(|error| Failure::invalid(format!("{}: {error}", path.display())))?
    };
    let object: Json = serde_json::from_str(&text)
        .map_err(|error| Failure::invalid(format!("That isn't JSON: {error}")))?;
    apply(Request::from_object(&object)?, output)
}

#[cfg(test)]
mod tests;
