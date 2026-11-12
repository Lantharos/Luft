//! What luft offers an agent, each tool doing exactly what the command of the
//! same name does: reads are free, and every change goes through the same
//! path and the same review on the screen as `luft apply`.

use std::path::PathBuf;

use clap::ValueEnum;

use serde_json::{Map, Value as Json, json};

use crate::changes::{self, Request};
use crate::extension;
use crate::failure::{Failure, Outcome};
use crate::logs::{self, Part};
use crate::settings::{self, catalogue};
use crate::{report, status};

pub struct Tool {
    pub name: &'static str,
    pub description: &'static str,
    pub schema: fn() -> Json,
    pub writes: bool,
}

fn nothing() -> Json {
    json!({ "type": "object", "properties": {} })
}

fn settings_schema() -> Json {
    json!({ "type": "object", "properties": {
        "settings": { "type": "array", "items": { "type": "string" }, "description": "Setting ids from describe_settings. Leave out for every setting." },
        "page": { "type": "string", "description": "Only the settings on this page of Settings, such as appearance, taskbar, input, power, privacy, language, security or system." }
    } })
}

fn changes_schema() -> Json {
    json!({ "type": "object", "required": ["changes"], "properties": {
        "changes": {
            "type": "object",
            "description": "Every change the person asked for, as setting id and new value, such as {\"appearance.style\": \"dark\", \"taskbar.size\": \"large\", \"security.developer-tools\": true}. Values are what describe_settings lists: true or false for switches, a choice's value, a number in range, or text.",
            "additionalProperties": { "type": ["string", "number", "boolean"] }
        }
    } })
}

fn logs_schema() -> Json {
    let parts: Vec<String> = Part::value_variants()
        .iter()
        .filter_map(|part| part.to_possible_value())
        .map(|value| value.get_name().to_owned())
        .collect();
    json!({ "type": "object", "required": ["part"], "properties": {
        "part": { "type": "string", "enum": parts },
        "lines": { "type": "integer", "minimum": 1, "maximum": 2000, "default": 200 },
        "since": { "type": "string", "description": "Such as \"10 min ago\" or \"today\"." }
    } })
}

fn folder_schema() -> Json {
    json!({ "type": "object", "required": ["folder"], "properties": { "folder": { "type": "string", "description": "The extension's folder, named after its id." } } })
}

fn id_schema() -> Json {
    json!({ "type": "object", "required": ["id"], "properties": { "id": { "type": "string", "description": "The extension's id, such as com.example.Weather." } } })
}

fn new_schema() -> Json {
    json!({ "type": "object", "required": ["id", "parent"], "properties": {
        "id": { "type": "string", "description": "The new extension's id, in reverse DNS with three parts or more." },
        "parent": { "type": "string", "description": "The folder to make the extension's folder in." }
    } })
}

fn pack_schema() -> Json {
    json!({ "type": "object", "required": ["folder", "output"], "properties": {
        "folder": { "type": "string" },
        "output": { "type": "string", "description": "The folder to put the package in." }
    } })
}

pub const TOOLS: [Tool; 14] = [
    Tool {
        name: "status",
        description: "The version of Luft, its release channel and build, a downloaded update, the older version kept, Secure Boot, the TPM, disk encryption and whether Developer tools is on.",
        schema: nothing,
        writes: false,
    },
    Tool {
        name: "describe_settings",
        description: "Every setting luft can change, by the id to use and the name and page Settings shows it on: what values it takes, what it is now, and whether changing it waits for the person to approve it on the screen. Read this before proposing changes.",
        schema: settings_schema,
        writes: false,
    },
    Tool {
        name: "get_settings",
        description: "The current values of settings, by id.",
        schema: settings_schema,
        writes: false,
    },
    Tool {
        name: "propose_changes",
        description: "Changes settings. Put every change the person asked for into ONE call, never one call per setting: the changes are checked together and nothing changes if one is wrong. Settings any program may change apply at once; when the set holds a system setting (needsReview in describe_settings), the person sees all of it in one review on the screen and nothing changes unless they approve it, usually with an administrator's password. A declined review is the person's answer: don't ask again unless they tell you to. The result lists what changed, which undo_last_change can put back.",
        schema: changes_schema,
        writes: true,
    },
    Tool {
        name: "undo_last_change",
        description: "Puts back the last change made through luft. Putting back a system setting asks the person on the screen again.",
        schema: nothing,
        writes: true,
    },
    Tool {
        name: "change_history",
        description: "What was changed through luft, when, for which program, and whether it was reviewed or put back.",
        schema: nothing,
        writes: false,
    },
    Tool {
        name: "check_for_updates",
        description: "Looks for an update of Luft and says what it brings and how much it downloads. Installing one is the person's choice, in Settings.",
        schema: nothing,
        writes: false,
    },
    Tool {
        name: "read_logs",
        description: "The newest lines a part of Luft logged.",
        schema: logs_schema,
        writes: false,
    },
    Tool {
        name: "make_report",
        description: "Saves a bug report bundle to the person's home folder: versions, hardware by kind, recent crashes and logs, with names, the computer's name, email addresses and home folder paths taken out. Nothing is sent anywhere; tell the person where it is.",
        schema: nothing,
        writes: true,
    },
    Tool {
        name: "new_extension",
        description: "Makes a new extension in a folder named after its id, which runs as it is.",
        schema: new_schema,
        writes: true,
    },
    Tool {
        name: "check_extension",
        description: "Checks an extension's manifest and files the way Luft reads them, with the same words for what's wrong.",
        schema: folder_schema,
        writes: false,
    },
    Tool {
        name: "reload_extension",
        description: "Has the desktop load an extension again after a change.",
        schema: id_schema,
        writes: true,
    },
    Tool {
        name: "extension_logs",
        description: "What an extension and the desktop logged about it.",
        schema: id_schema,
        writes: false,
    },
    Tool {
        name: "pack_extension",
        description: "Packs an extension the way the store takes it.",
        schema: pack_schema,
        writes: true,
    },
];

fn text<'a>(arguments: &'a Map<String, Json>, key: &str) -> Outcome<&'a str> {
    arguments
        .get(key)
        .and_then(Json::as_str)
        .ok_or_else(|| Failure::invalid(format!("{key} is missing.")))
}

fn named_settings(arguments: &Map<String, Json>) -> Outcome<Vec<&'static catalogue::Setting>> {
    let page = arguments.get("page").and_then(Json::as_str);
    match arguments.get("settings").and_then(Json::as_array) {
        Some(names) => names
            .iter()
            .map(|name| settings::resolve(name.as_str().unwrap_or_default(), false))
            .collect(),
        None => Ok(catalogue::all()
            .iter()
            .filter(|setting| {
                !setting.developer && page.is_none_or(|page| setting.page.as_deref() == Some(page))
            })
            .collect()),
    }
}

fn to_json<T: serde::Serialize>(value: &T) -> Outcome<Json> {
    serde_json::to_value(value).map_err(|error| Failure::failed(error.to_string()))
}

async fn blocking<T: Send + 'static>(
    work: impl FnOnce() -> Outcome<T> + Send + 'static,
) -> Outcome<T> {
    tokio::task::spawn_blocking(work)
        .await
        .map_err(|error| Failure::failed(error.to_string()))?
}

pub async fn call(name: &str, arguments: Map<String, Json>) -> Outcome<Json> {
    match name {
        "status" => to_json(&status::gather().await),
        "describe_settings" => to_json(&settings::describe(&named_settings(&arguments)?).await?),
        "get_settings" => {
            let described = settings::describe(&named_settings(&arguments)?).await?;
            Ok(Json::Object(
                described
                    .into_iter()
                    .map(|entry| (entry.id.to_owned(), entry.value))
                    .collect(),
            ))
        }
        "propose_changes" => {
            let changes = arguments.get("changes").cloned().unwrap_or(Json::Null);
            to_json(&changes::make(Request::from_object(&changes)?).await?)
        }
        "undo_last_change" => to_json(&changes::undo_last().await?),
        "change_history" => to_json(&changes::history::load()?),
        "check_for_updates" => to_json(&crate::update::found().await?),
        "read_logs" => {
            let part = Part::from_str(text(&arguments, "part")?, true).map_err(Failure::invalid)?;
            let lines = arguments
                .get("lines")
                .and_then(Json::as_u64)
                .unwrap_or(200)
                .clamp(1, 2000) as u32;
            let since = arguments
                .get("since")
                .and_then(Json::as_str)
                .map(str::to_owned);
            blocking(move || {
                let mut found = Vec::new();
                logs::read(
                    logs::journalctl(&part.units(), since.as_deref(), lines, false, true),
                    |_| true,
                    |line| found.push(line),
                )?;
                to_json(&found)
            })
            .await
        }
        "make_report" => {
            let status = status::gather().await;
            blocking(move || Ok(json!({ "report": report::save(None, &status)? }))).await
        }
        "new_extension" => {
            let (id, parent) = (
                text(&arguments, "id")?.to_owned(),
                PathBuf::from(text(&arguments, "parent")?),
            );
            let minimum = extension::running_version().await;
            blocking(move || Ok(json!({ "folder": extension::make(&id, &parent, minimum)? }))).await
        }
        "check_extension" => to_json(&extension::check(&PathBuf::from(text(
            &arguments, "folder",
        )?))?),
        "reload_extension" => {
            let id = text(&arguments, "id")?;
            extension::reload(id).await?;
            Ok(json!({ "reloaded": id }))
        }
        "extension_logs" => {
            let id = text(&arguments, "id")?.to_owned();
            blocking(move || to_json(&extension::logs_of(&id)?)).await
        }
        "pack_extension" => {
            let (folder, output) = (
                PathBuf::from(text(&arguments, "folder")?),
                PathBuf::from(text(&arguments, "output")?),
            );
            blocking(move || Ok(json!({ "package": extension::packed(&folder, &output)? }))).await
        }
        other => Err(Failure::invalid(format!(
            "luft has no tool called {other}."
        ))),
    }
}
