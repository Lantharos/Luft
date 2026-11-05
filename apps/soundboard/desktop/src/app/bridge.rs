use std::path::PathBuf;

use luft_app::portal::{FileChooser, Filter, uri_path};
use luft_app::{Appearance, Commands, Empty};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use specta::Type;

use super::events;
use super::settings::Settings;
use super::state::SoundboardState;
use crate::audio::SoundId;
use crate::audio::engine::{Mix, Status};
use crate::hotkeys::Hotkey;
use crate::library::{self, BoardId, Library, Sound};

const AUDIO_FILTER: [&str; 15] = [
    "*.mp3", "*.wav", "*.flac", "*.ogg", "*.oga", "*.opus", "*.m4a", "*.aac", "*.wma", "*.aiff",
    "*.aif", "*.webm", "*.mp4", "*.mka", "*.mkv",
];
const PICTURE_FILTER: [&str; 6] = ["*.png", "*.jpg", "*.jpeg", "*.webp", "*.gif", "*.svg"];
const BOARD_EXTENSION: &str = "soundboard";

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct AppState {
    #[serde(flatten)]
    appearance: Appearance,
    library: Library,
    settings: Settings,
    status: Status,
    triggers: Vec<Hotkey>,
    hotkeys_available: bool,
    sounds_folder: String,
}

async fn app_state(state: SoundboardState, _: Empty) -> Result<AppState, String> {
    state.open_hotkeys_once().await;
    let (library, sounds_folder) = {
        let store = state.store().lock();
        (
            store.library.clone(),
            store.sounds_folder().to_string_lossy().into_owned(),
        )
    };
    Ok(AppState {
        appearance: Appearance::current().await,
        library,
        settings: state.settings(),
        status: state.status(),
        triggers: state.triggers(),
        hotkeys_available: state.hotkeys_available(),
        sounds_folder,
    })
}

fn paths(uris: Vec<String>) -> Vec<PathBuf> {
    uris.iter().filter_map(|uri| uri_path(uri)).collect()
}

fn strings(patterns: &[&str]) -> Vec<String> {
    patterns.iter().map(|&pattern| pattern.to_owned()).collect()
}

#[derive(Deserialize, Type)]
pub struct Titled {
    title: String,
    filter: String,
}

async fn choose_sounds(
    _: SoundboardState,
    Titled { title, filter }: Titled,
) -> Result<Vec<PathBuf>, String> {
    let chooser = FileChooser {
        title: &title,
        multiple: true,
        filters: vec![Filter {
            name: &filter,
            patterns: strings(&AUDIO_FILTER),
        }],
        ..FileChooser::default()
    };
    chooser.open().await.map(paths)
}

#[derive(Deserialize, Type)]
pub struct Added {
    board: BoardId,
    paths: Vec<PathBuf>,
}

#[derive(Serialize, Type)]
pub struct AddResult {
    library: Library,
    failed: Vec<String>,
}

async fn add_sounds(
    state: SoundboardState,
    Added { board, paths }: Added,
) -> Result<AddResult, String> {
    let folder = state.store().lock().sounds_folder();
    let mut failed = Vec::new();
    for path in paths {
        let name = path
            .file_name()
            .map(|name| name.to_string_lossy().into_owned())
            .unwrap_or_default();
        let target = folder.clone();
        let prepared = tokio::task::spawn_blocking(move || library::prepare(&target, &path))
            .await
            .map_err(|error| error.to_string())?;
        match prepared {
            Ok(prepared) => drop(state.store().lock().add_prepared(board, prepared)?),
            Err(_) => failed.push(name),
        }
    }
    state.refresh_playable();
    state.bind_hotkeys().await?;
    let library = state.store().lock().library.clone();
    Ok(AddResult { library, failed })
}

#[derive(Deserialize, Type)]
pub struct Named {
    name: String,
}

#[derive(Deserialize, Type)]
pub struct BoardRef {
    board: BoardId,
}

#[derive(Deserialize, Type)]
pub struct Rename {
    board: BoardId,
    name: String,
}

#[derive(Deserialize, Type)]
pub struct Order {
    board: BoardId,
    sounds: Vec<SoundId>,
}

#[derive(Deserialize, Type)]
pub struct SoundRef {
    sound: SoundId,
}

#[derive(Deserialize, Type)]
pub struct Press {
    sound: SoundId,
    preview: bool,
}

#[derive(Deserialize, Type)]
pub struct Waveform {
    sound: SoundId,
    buckets: u32,
}

fn library(state: &SoundboardState) -> Library {
    state.store().lock().library.clone()
}

fn add_board(state: &SoundboardState, Named { name }: Named) -> Result<Library, String> {
    state.store().lock().add_board(name)?;
    Ok(library(state))
}

fn rename_board(
    state: &SoundboardState,
    Rename { board, name }: Rename,
) -> Result<Library, String> {
    state.store().lock().rename_board(board, name)?;
    Ok(library(state))
}

async fn remove_board(
    state: SoundboardState,
    BoardRef { board }: BoardRef,
) -> Result<Library, String> {
    state.store().lock().remove_board(board)?;
    state.refresh_playable();
    state.bind_hotkeys().await?;
    Ok(library(&state))
}

async fn update_sound(state: SoundboardState, sound: Sound) -> Result<Library, String> {
    state.store().lock().update(sound)?;
    state.refresh_playable();
    state.bind_hotkeys().await?;
    Ok(library(&state))
}

async fn remove_sound(
    state: SoundboardState,
    SoundRef { sound }: SoundRef,
) -> Result<Library, String> {
    state.stop(sound);
    state.store().lock().remove(sound)?;
    state.refresh_playable();
    state.bind_hotkeys().await?;
    Ok(library(&state))
}

fn reorder(state: &SoundboardState, Order { board, sounds }: Order) -> Result<Library, String> {
    state.store().lock().reorder(board, &sounds)?;
    Ok(library(state))
}

async fn choose_picture(state: SoundboardState, request: SoundTitled) -> Result<Library, String> {
    let chooser = FileChooser {
        title: &request.title,
        filters: vec![Filter {
            name: &request.filter,
            patterns: strings(&PICTURE_FILTER),
        }],
        ..FileChooser::default()
    };
    if let Some(path) = paths(chooser.open().await?).first() {
        state.store().lock().set_picture(request.sound, path)?;
    }
    Ok(library(&state))
}

#[derive(Deserialize, Type)]
pub struct SoundTitled {
    sound: SoundId,
    title: String,
    filter: String,
}

fn peaks(
    state: &SoundboardState,
    Waveform { sound, buckets }: Waveform,
) -> Result<Vec<f32>, String> {
    let pcm = state
        .store()
        .lock()
        .pcm(sound)
        .ok_or_else(library::sound_gone)?;
    Ok(library::peaks(&pcm, buckets as usize))
}

#[derive(Deserialize, Type)]
pub struct Export {
    board: BoardId,
    name: String,
    title: String,
}

async fn export_board(
    state: SoundboardState,
    Export { board, name, title }: Export,
) -> Result<(), String> {
    let file = format!("{name}.{BOARD_EXTENSION}");
    let chooser = FileChooser {
        title: &title,
        current_name: Some(&file),
        ..FileChooser::default()
    };
    let Some(path) = chooser.save().await?.and_then(|uri| uri_path(&uri)) else {
        return Ok(());
    };
    tokio::task::spawn_blocking(move || state.store().lock().export(board, &path))
        .await
        .map_err(|error| error.to_string())?
}

async fn import_board(
    state: SoundboardState,
    Titled { title, filter }: Titled,
) -> Result<Library, String> {
    let chooser = FileChooser {
        title: &title,
        filters: vec![Filter {
            name: &filter,
            patterns: vec![format!("*.{BOARD_EXTENSION}")],
        }],
        ..FileChooser::default()
    };
    if let Some(path) = paths(chooser.open().await?).first().cloned() {
        let store = state.clone();
        tokio::task::spawn_blocking(move || store.store().lock().import(&path))
            .await
            .map_err(|error| error.to_string())??;
        state.refresh_playable();
        state.bind_hotkeys().await?;
    }
    Ok(library(&state))
}

#[derive(Deserialize, Type)]
pub struct Toggle {
    enabled: bool,
}

pub fn register(window: SabineWindow, state: &SoundboardState) -> SabineWindow {
    events::declare(window)
        .with_async("app_state", state, app_state)
        .with_async("choose_sounds", state, choose_sounds)
        .with_async("add_sounds", state, add_sounds)
        .with("add_board", state, add_board)
        .with("rename_board", state, rename_board)
        .with_async("remove_board", state, remove_board)
        .with_async("update_sound", state, update_sound)
        .with_async("remove_sound", state, remove_sound)
        .with("reorder_sounds", state, reorder)
        .with_async("choose_picture", state, choose_picture)
        .with("sound_peaks", state, peaks)
        .with_async("export_board", state, export_board)
        .with_async("import_board", state, import_board)
        .with("press", state, |state, Press { sound, preview }| {
            state.play(sound, preview);
            Ok(())
        })
        .with("release", state, |state, SoundRef { sound }| {
            state.stop(sound);
            Ok(())
        })
        .with("stop_all", state, |state, Empty {}| {
            state.stop_all();
            Ok(())
        })
        .with("set_mix", state, |state, mix: Mix| state.set_mix(mix))
        .with("set_keep_running", state, |state, Toggle { enabled }| {
            state.set_keep_running(enabled)
        })
        .with("set_use_as_default", state, |state, Toggle { enabled }| {
            state.set_use_as_default(enabled)
        })
        .with_async("configure_hotkeys", state, |state, Empty {}| async move {
            state.configure_hotkeys().await
        })
}
