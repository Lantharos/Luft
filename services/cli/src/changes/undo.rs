use serde_json::Value as Json;

use super::history::{self, Changed, Entry};
use super::{Request, direct, make, requester};
use crate::bus;
use crate::failure::{Failure, Outcome};
use crate::output::{Output, table};
use crate::settings::catalogue;

/// The change that puts `entry` back. One that needed a review asks for one
/// again: putting back a system setting is as much a change as making it.
async fn reverse(entry: &Entry) -> Outcome<Vec<Changed>> {
    if entry.reviewed {
        let pairs: serde_json::Map<String, Json> = entry
            .changes
            .iter()
            .map(|change| (change.setting.clone(), change.from.clone()))
            .collect();
        let applied = make(Request::from_object(&Json::Object(pairs))?).await?;
        return Ok(applied.changes);
    }
    direct::restore(&entry.restore).await?;
    let reversed: Vec<Changed> = entry
        .changes
        .iter()
        .map(|change| Changed {
            from: change.to.clone(),
            to: change.from.clone(),
            from_words: change.to_words.clone(),
            to_words: change.from_words.clone(),
            ..change.clone()
        })
        .collect();
    let mut undoing = Entry::new(requester::name(), false, reversed.clone(), Vec::new());
    undoing.undoes = Some(entry.time);
    history::record(undoing)?;
    Ok(reversed)
}

/// Puts back the newest change not put back yet, and says what changed.
pub async fn undo_last() -> Outcome<Vec<Changed>> {
    let entries = history::load()?;
    let index = history::last_to_undo(&entries)
        .ok_or_else(|| Failure::invalid("There's nothing to put back."))?;
    let entry = entries[index].clone();
    let missing: Vec<&str> = entry
        .changes
        .iter()
        .map(|change| change.setting.as_str())
        .filter(|id| catalogue::find(id).is_none())
        .collect();
    if !missing.is_empty() {
        return Err(Failure::invalid(format!(
            "This version of luft no longer knows {}.",
            missing.join(", ")
        )));
    }
    let reversed = reverse(&entry).await?;
    let mut entries = history::load()?;
    if let Some(original) = entries
        .iter_mut()
        .find(|kept| kept.time == entry.time && kept.undoes.is_none())
    {
        original.undone = true;
    }
    if entry.reviewed
        && !reversed.is_empty()
        && let Some(last) = entries.last_mut()
    {
        last.undoes = Some(entry.time);
    }
    history::save(&entries)?;
    Ok(reversed)
}

pub fn undo(output: Output) -> Outcome {
    let reversed = bus::block_on(undo_last())??;
    output.show(&reversed, || {
        format!(
            "Put back:\n{}",
            table(reversed.iter().map(|change| (
                change.name.as_str(),
                format!("{} → {}", change.from_words, change.to_words)
            )))
        )
    })
}

pub fn history(limit: usize, output: Output) -> Outcome {
    let entries = history::load()?;
    let newest: Vec<&Entry> = entries.iter().rev().take(limit).collect();
    output.show(&newest, || {
        if newest.is_empty() {
            return "Nothing was changed through luft yet.".to_owned();
        }
        newest
            .iter()
            .map(|entry| {
                let when = format_time(entry.time);
                let how = match (entry.undoes, entry.reviewed, entry.undone) {
                    (Some(_), _, _) => "put back",
                    (None, true, _) => "after review",
                    (None, false, _) => "directly",
                };
                let undone = if entry.undone { ", since put back" } else { "" };
                let rows = entry.changes.iter().map(|change| {
                    (
                        change.name.as_str(),
                        format!("{} → {}", change.from_words, change.to_words),
                    )
                });
                format!(
                    "{when}, for {}, {how}{undone}\n{}",
                    entry.requester,
                    indent(&table(rows))
                )
            })
            .collect::<Vec<_>>()
            .join("\n")
    })
}

fn indent(text: &str) -> String {
    text.lines().map(|line| format!("  {line}\n")).collect()
}

fn format_time(seconds: u64) -> String {
    let local = glib::DateTime::from_unix_local(i64::try_from(seconds).unwrap_or_default());
    local
        .ok()
        .and_then(|time| time.format("%Y-%m-%d %H:%M").ok())
        .map_or_else(|| seconds.to_string(), |text| text.to_string())
}
