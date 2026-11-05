use std::path::Path;

use luft_app::portal::FileChooser;
use luft_app::{Activation, Appearance, Commands, Empty, Events, file_manager, portal};
use luft_i18n::t;
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use specta::Type;

use super::capabilities;
use super::files::{self, FileEntry, Target};
use super::presets::{self, Preferences, Preset};
use super::previews::{self, Preview, Previews};
use crate::engine::inspect::Details;
use crate::l10n::L10N;
use crate::queue::items::{self, NewItem};
use crate::queue::{self, Queue};

#[derive(Clone)]
pub struct AppContext {
    pub queue: Queue,
    pub previews: Previews,
}

impl AppContext {
    pub fn new(events: &Events) -> Self {
        previews::prune_cache();
        Self {
            queue: Queue::new(events.clone()),
            previews: Previews::default(),
        }
    }
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct AppState {
    #[serde(flatten)]
    appearance: Appearance,
    launch_paths: Vec<String>,
    preferences: Preferences,
    presets: Vec<Preset>,
    archive_targets: Vec<Target>,
    pdf_target: Vec<Target>,
}

#[derive(Deserialize, Type)]
struct Id {
    id: u32,
}

#[derive(Deserialize, Type)]
struct Path_ {
    path: String,
}

#[derive(Deserialize, Type)]
struct Paths {
    paths: Vec<String>,
}

#[derive(Deserialize, Type)]
#[serde(rename_all = "camelCase")]
struct ProxyRequest {
    path: String,
    edge: u32,
    time: f64,
}

#[derive(Deserialize, Type)]
#[serde(rename_all = "camelCase")]
struct PeaksRequest {
    path: String,
    duration: f64,
    buckets: u32,
}

#[derive(Deserialize, Type)]
struct Items {
    items: Vec<NewItem>,
}

#[derive(Deserialize, Type)]
struct Held {
    held: bool,
}

#[derive(Deserialize, Type)]
struct PresetList {
    presets: Vec<Preset>,
}

#[derive(Deserialize, Type)]
#[serde(rename_all = "camelCase")]
struct Handoff {
    path: String,
    token: Option<String>,
}

fn activation_paths(activation: &Activation) -> Vec<String> {
    activation
        .paths()
        .map(|path| path.to_string_lossy().into_owned())
        .collect()
}

async fn off_thread<T: Send + 'static>(
    work: impl FnOnce() -> Result<T, String> + Send + 'static,
) -> Result<T, String> {
    sabine::async_runtime()
        .spawn_blocking(work)
        .await
        .map_err(|error| error.to_string())?
}

async fn chosen_paths(chooser: FileChooser<'_>) -> Result<Vec<String>, String> {
    let chosen = chooser.open().await?;
    Ok(chosen
        .iter()
        .filter_map(|uri| portal::uri_path(uri))
        .map(|path| path.to_string_lossy().into_owned())
        .collect())
}

fn register_files(window: SabineWindow, context: &AppContext) -> SabineWindow {
    window
        .command("resolve_arguments", |activation: Activation| {
            Ok(activation_paths(&activation))
        })
        .command_async("describe_files", |Paths { paths }| {
            off_thread(move || Ok::<Vec<FileEntry>, String>(files::describe(paths)))
        })
        .command_async("capabilities", |Empty {}| off_thread(capabilities::current))
        .with_async(
            "file_details",
            context,
            |context, Path_ { path }| async move {
                off_thread(move || -> Result<Details, String> { context.previews.details(&path) })
                    .await
            },
        )
        .with_async(
            "proxy",
            context,
            |context, ProxyRequest { path, edge, time }| async move {
                off_thread(move || -> Result<Preview, String> {
                    context.previews.proxy(&path, edge, time)
                })
                .await
            },
        )
        .with_async(
            "peaks",
            context,
            |context,
             PeaksRequest {
                 path,
                 duration,
                 buckets,
             }| async move {
                off_thread(move || context.previews.peaks(&path, duration, buckets as usize)).await
            },
        )
        .command_async("choose_files", |Empty {}| async {
            let title = t!(L10N, "dialog-open");
            chosen_paths(FileChooser {
                title: &title,
                multiple: true,
                ..FileChooser::default()
            })
            .await
        })
        .command_async("choose_folder", |Empty {}| async {
            let title = t!(L10N, "dialog-choose-folder");
            chosen_paths(FileChooser {
                title: &title,
                directory: true,
                ..FileChooser::default()
            })
            .await
        })
        .command_async("show_in_folder", |Handoff { path, token }| async move {
            file_manager::show_in_folder(Path::new(&path), token.as_deref()).await
        })
}

fn register_queue(window: SabineWindow, context: &AppContext) -> SabineWindow {
    window
        .bridge_event(&queue::UPDATED)
        .command("output_conflicts", |Items { items }| {
            Ok(items::conflicts(&items))
        })
        .with("queue_add", context, |context, Items { items }| {
            context.queue.add(items)
        })
        .with("queue_pause", context, |context, Id { id }| {
            context.queue.pause(id);
            Ok(())
        })
        .with("queue_resume", context, |context, Id { id }| {
            context.queue.resume(id);
            Ok(())
        })
        .with("queue_cancel", context, |context, Id { id }| {
            context.queue.cancel(id);
            Ok(())
        })
        .with("queue_retry", context, |context, Id { id }| {
            context.queue.retry(id);
            Ok(())
        })
        .with("queue_hold", context, |context, Held { held }| {
            context.queue.hold_all(held);
            Ok(())
        })
        .with("queue_clear", context, |context, Empty {}| {
            context.queue.clear_finished();
            Ok(())
        })
}

pub fn register(window: SabineWindow, context: &AppContext) -> SabineWindow {
    let window = register_files(window, context);
    register_queue(window, context)
        .command_async("app_state", |Empty {}| async {
            Ok(AppState {
                appearance: Appearance::current().await,
                launch_paths: activation_paths(&Activation::current_process()),
                preferences: presets::preferences(),
                presets: presets::presets(),
                archive_targets: files::archive_targets(),
                pdf_target: files::pdf_target(),
            })
        })
        .command("save_presets", |PresetList { presets }| {
            presets::save_presets(presets)
        })
        .command("save_preferences", presets::save_preferences)
}
