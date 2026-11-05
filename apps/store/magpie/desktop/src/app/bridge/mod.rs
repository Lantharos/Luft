mod params;

use std::path::Path as FilePath;

use gio::prelude::*;
use luft_app::portal::{self, FileChooser, Filter};
use luft_app::{Activation, Commands, Empty, file_manager};
use sabine::SabineWindow;

use crate::app::state::MagpieState;
use crate::folder::{self, kinds};
use crate::media::{tags, video};
use crate::mpris::Playback;
use crate::{apps, font, launch, photo};
use params::*;

pub fn register(window: SabineWindow, state: &MagpieState) -> SabineWindow {
    let window = register_app(crate::app::events::declare(window), state);
    let window = register_media(window, state);
    let window = register_fonts(window);
    register_files(window, state)
}

fn register_app(window: SabineWindow, state: &MagpieState) -> SabineWindow {
    window
        .with_async("app_state", state, |state, Empty {}| async move {
            Ok(state.app_state().await)
        })
        .command("resolve_arguments", |activation: Activation| {
            Ok(launch::resolve(&activation))
        })
        .command_async("choose_file", |Empty {}| async {
            let filter = Filter {
                name: "Photos, videos, music, documents and fonts",
                patterns: kinds::patterns(),
            };
            let chosen = portal::open_file("Open", filter).await?;
            Ok(chosen.and_then(|uri| gio::File::for_uri(&uri).path()))
        })
        .command_async("choose_folder", |Empty {}| async {
            let chooser = FileChooser {
                title: "Open Folder",
                directory: true,
                ..FileChooser::default()
            };
            let chosen = chooser.open().await?.into_iter().next();
            Ok(chosen.and_then(|uri| gio::File::for_uri(&uri).path()))
        })
        .command("places", |Empty {}| Ok(folder::places()))
}

fn register_files(window: SabineWindow, state: &MagpieState) -> SabineWindow {
    window
        .with("open_folder", state, |state, Path { path }| {
            let folder = FilePath::new(&path);
            let listing = folder::list(folder)?;
            state.folders.watch(folder.to_path_buf());
            Ok(listing)
        })
        .with(
            "request_thumbnails",
            state,
            |state, ThumbnailRequest { paths, size }| {
                state.thumbnails.request(paths, size);
                Ok(())
            },
        )
        .command("image_details", |Path { path }| {
            Ok(photo::details(FilePath::new(&path)))
        })
        .command("decode_image", |Path { path }| {
            photo::decode(FilePath::new(&path))
        })
        .command("set_wallpaper", |Path { path }| {
            photo::set_wallpaper(FilePath::new(&path))
        })
        .command("other_apps", |Path { path }| {
            Ok(apps::others(FilePath::new(&path)))
        })
        .command("open_with", |OpenWith { path, app, token }| {
            apps::open_with(FilePath::new(&path), &app, token.as_deref())
        })
        .command_async("show_in_folder", |Handoff { path, token }| async move {
            file_manager::show_in_folder(FilePath::new(&path), token.as_deref()).await
        })
        .command("open_uri", |Uri { uri, token }| {
            apps::open_uri(&uri, token.as_deref())
        })
}

fn register_media(window: SabineWindow, state: &MagpieState) -> SabineWindow {
    window
        .command("audio_tags", |Paths { paths }| Ok(tags::read_all(paths)))
        .command("video_info", |Path { path }| {
            Ok(video::info(FilePath::new(&path)))
        })
        .command("subtitle_cues", |Subtitles { path, id }| {
            video::cues(FilePath::new(&path), &id)
        })
        .with_async(
            "media_update",
            state,
            |state, playback: Playback| async move { state.mpris.update(playback).await },
        )
        .with_async("media_clear", state, |state, Empty {}| async move {
            state.mpris.clear().await
        })
}

fn register_fonts(window: SabineWindow) -> SabineWindow {
    window
        .command("font_info", |Path { path }| {
            font::info(FilePath::new(&path))
        })
        .command("font_source", |FontSource { path, index }| {
            font::source(FilePath::new(&path), index)
        })
        .command("font_status", |Path { path }| {
            font::status(FilePath::new(&path))
        })
        .command("font_install", |Path { path }| {
            font::install(FilePath::new(&path))
        })
        .command("font_remove", |Path { path }| {
            font::remove(FilePath::new(&path))
        })
        .command("font_use", |FontUse { path, role }| {
            font::use_as(FilePath::new(&path), role)
        })
}
