use std::hash::{DefaultHasher, Hash, Hasher};
use std::path::PathBuf;

use gio::prelude::*;
use luft_app::Commands;
use luft_app::portal::FileChooser;
use sabine::SabineWindow;
use serde::Serialize;

use super::params::*;
use crate::events::IMAGES;
use crate::mail::envelope::{self, Address};
use crate::mail::{images, render};
use crate::services::actions;
use crate::state::{MailmanState, cache_folder};
use crate::store::View;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Opened {
    subject: String,
    from: Address,
    to: Vec<Address>,
    cc: Vec<Address>,
    date: Option<i64>,
    rendered: render::Rendered,
}

fn parts_folder(id: i64) -> PathBuf {
    cache_folder().join("parts").join(id.to_string())
}

fn body(state: &MailmanState, Id { id }: Id) -> Result<Option<render::Rendered>, String> {
    let Some(raw) = state.store.body(id)? else {
        let message = state.store.message(id)?.ok_or("That message is gone")?;
        state.engine.request_body(message.account, id);
        return Ok(None);
    };
    render::render(&raw, &parts_folder(id))
        .map(Some)
        .ok_or_else(|| "This message can't be read".into())
}

fn raw_attachment(state: &MailmanState, part: &Part) -> Result<(String, Vec<u8>), String> {
    let raw = match (&part.file, part.id) {
        (Some(file), _) => std::fs::read(file).map_err(|error| error.to_string())?,
        (None, Some(id)) => state
            .store
            .body(id)?
            .ok_or("This message hasn't arrived yet")?,
        (None, None) => return Err("That attachment is gone".into()),
    };
    render::attachment(&raw, part.index).ok_or_else(|| "That attachment is gone".into())
}

fn remote_images(state: &MailmanState, Urls { urls }: Urls) -> Result<(), String> {
    let events = state.events.clone();
    std::thread::spawn(move || {
        events.emit(IMAGES, images::fetch(urls, &cache_folder().join("remote")));
    });
    Ok(())
}

fn safe_name(name: &str) -> String {
    let cleaned: String = name
        .chars()
        .map(|character| {
            if matches!(character, '/' | '\\' | '\0') {
                '_'
            } else {
                character
            }
        })
        .collect();
    if cleaned.trim_matches('.').is_empty() {
        "attachment".into()
    } else {
        cleaned
    }
}

fn open_attachment(state: &MailmanState, part: Part) -> Result<(), String> {
    let (name, bytes) = raw_attachment(state, &part)?;
    let source = part
        .file
        .clone()
        .unwrap_or_else(|| part.id.unwrap_or_default().to_string());
    let folder = cache_folder()
        .join("attachments")
        .join(format!("{:x}", digest(&source)));
    std::fs::create_dir_all(&folder).map_err(|error| error.to_string())?;
    let path = folder.join(safe_name(&name));
    std::fs::write(&path, bytes).map_err(|error| error.to_string())?;
    let uri = gio::File::for_path(&path).uri();
    gio::AppInfo::launch_default_for_uri(&uri, None::<&gio::AppLaunchContext>)
        .map_err(|error| error.to_string())
}

fn save_attachment(state: &MailmanState, part: Part) -> Result<Option<String>, String> {
    let (name, bytes) = raw_attachment(state, &part)?;
    let name = safe_name(&name);
    let downloads = dirs::download_dir();
    let chooser = FileChooser {
        title: "Save Attachment",
        current_name: Some(&name),
        current_folder: downloads.as_deref(),
        ..FileChooser::default()
    };
    let Some(path) = chooser
        .save()?
        .and_then(|uri| luft_app::portal::uri_path(&uri))
    else {
        return Ok(None);
    };
    std::fs::write(&path, bytes).map_err(|error| error.to_string())?;
    Ok(Some(path.to_string_lossy().into_owned()))
}

fn open_file(Path { path }: Path) -> Result<Opened, String> {
    let raw = std::fs::read(&path).map_err(|error| error.to_string())?;
    let parsed = render::parse(&raw).ok_or("This file isn't an email")?;
    let envelope = envelope::from_message(&parsed);
    let folder = cache_folder()
        .join("files")
        .join(format!("{:x}", digest(&path)));
    Ok(Opened {
        subject: envelope.subject,
        from: envelope.from,
        to: envelope.recipients.to,
        cc: envelope.recipients.cc,
        date: envelope.date,
        rendered: render::render(&raw, &folder).ok_or("This file isn't an email")?,
    })
}

fn digest(text: &str) -> u64 {
    let mut hasher = DefaultHasher::new();
    text.hash(&mut hasher);
    hasher.finish()
}

pub fn register(window: SabineWindow, state: &MailmanState) -> SabineWindow {
    window
        .with(
            "threads",
            state,
            |state,
             Page {
                 view,
                 query,
                 after,
                 limit,
             }| {
                let view = View::parse(&view, query).ok_or("Unknown view")?;
                state
                    .store
                    .threads(&view, &state.store.settings(), after, limit)
            },
        )
        .with("counts", state, |state, Empty {}| {
            state.store.counts(&state.store.settings())
        })
        .with("conversation", state, |state, Thread { thread }| {
            state.store.conversation(thread)
        })
        .with("message_body", state, body)
        .with("remote_images", state, remote_images)
        .with(
            "allow_images",
            state,
            |state, Images { address, allowed }| state.store.set_images(&address, allowed),
        )
        .with("images_allowed", state, |state, Email { email }| {
            state.store.images_allowed(&email)
        })
        .with("act", state, |state, request: actions::Request| {
            actions::act(state, request)
        })
        .with("screen", state, |state, Verdict { address, verdict }| {
            state.store.set_verdict(&address, &verdict)
        })
        .with("open_attachment", state, open_attachment)
        .with("save_attachment", state, save_attachment)
        .with("contacts", state, |state, Query { query }| {
            state.store.contacts(&query, 8)
        })
        .command("open_message_file", open_file)
        .command("open_uri", |Uri { uri }| {
            gio::AppInfo::launch_default_for_uri(&uri, None::<&gio::AppLaunchContext>)
                .map_err(|error| error.to_string())
        })
}
