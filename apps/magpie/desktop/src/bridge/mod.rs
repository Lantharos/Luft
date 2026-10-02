mod params;

use std::path::Path as FilePath;

use gio::prelude::*;
use luft_app::Commands;
use luft_app::portal::{self, FileChooser, Filter};
use sabine::SabineWindow;

use crate::folder::{self, kinds};
use crate::media::{tags, video};
use crate::mpris::Playback;
use crate::state::MagpieState;
use crate::{apps, font, launch, photo};
use params::*;

pub fn register(window: SabineWindow, state: &MagpieState) -> SabineWindow {
    let window = register_app(window, state);
    let window = register_media(window, state);
    let window = register_fonts(window);
    register_files(window, state)
}

fn register_app(window: SabineWindow, state: &MagpieState) -> SabineWindow {
    window
        .with("app_state", state, |state, Empty {}| Ok(state.app_state()))
        .command(
            "resolve_arguments",
            |Arguments {
                 arguments,
                 working_directory,
             }| {
                let cwd = working_directory.unwrap_or_else(|| "/".to_string());
                Ok(launch::resolve(
                    arguments.get(1..).unwrap_or_default(),
                    FilePath::new(&cwd),
                ))
            },
        )
        .command("choose_file", |Empty {}| {
            let filter = Filter {
                name: "Photos, videos, music, documents and fonts",
                patterns: kinds::patterns(),
            };
            let chosen = portal::open_file("Open", filter)?;
            Ok(chosen.and_then(|uri| gio::File::for_uri(&uri).path()))
        })
        .command("choose_folder", |Empty {}| {
            let chooser = FileChooser {
                title: "Open Folder",
                directory: true,
                ..FileChooser::default()
            };
            let chosen = chooser.open()?.into_iter().next();
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
        .command("open_with", |OpenWith { path, app }| {
            apps::open_with(FilePath::new(&path), &app)
        })
        .command("show_in_folder", |Path { path }| {
            apps::show_in_folder(FilePath::new(&path))
        })
        .command("open_uri", |Uri { uri }| apps::open_uri(&uri))
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
        .with("media_update", state, |state, playback: Playback| {
            state.mpris.update(playback)
        })
        .with("media_clear", state, |state, Empty {}| state.mpris.clear())
}

fn register_fonts(window: SabineWindow) -> SabineWindow {
    window
        .command("font_info", |Path { path }| {
            font::info(FilePath::new(&path))
        })
        .command("font_source", |FontFace { path, index }| {
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
}
