use luft_i18n::t;
pub mod events;
mod params;

use std::path::Path as FilePath;

use luft_app::{Commands, Empty};
use sabine::{BridgeError, SabineWindow, WithBody};

use crate::ai;
use crate::files::{self, blocking, dialogs, failed, store};
use crate::format::{open, save};
use crate::l10n::L10N;
use crate::picture::{decode, export, layered, pdf, raw};
use crate::state::{self, EaselState};
use params::*;

fn body(body: Option<Vec<u8>>) -> Result<Vec<u8>, BridgeError> {
    body.ok_or_else(|| BridgeError::new(t!(L10N, "easel-error-no-bytes")))
}

pub fn register(window: SabineWindow, state: &EaselState) -> SabineWindow {
    let window = events::declare(window)
        .command_async("app_state", |Empty {}| state::app_state())
        .command("store_read", store::read)
        .command("store_write", store::write)
        .command_async("choose_open", dialogs::choose_open)
        .command_async("choose_save", dialogs::choose_save)
        .command("release_files", |Paths { paths }| files::release(&paths))
        .with(
            "request_thumbnails",
            &state.thumbnails,
            |thumbnails, ThumbnailRequest { paths, size }| {
                thumbnails.request(paths, size);
                Ok(())
            },
        )
        .command_async("document_preview", |Path { path }| {
            blocking(move || open::preview(FilePath::new(&path)))
        })
        .command_async("open_document", |Path { path }| {
            blocking(move || open::open(FilePath::new(&path)))
        })
        .command_async("decode_picture", |Path { path }| {
            blocking(move || decode::decode(FilePath::new(&path)))
        })
        .command_async("decode_raw", |Path { path }| {
            blocking(move || raw::decode_raw(FilePath::new(&path)))
        })
        .command_async("open_layered", |Path { path }| {
            blocking(move || layered::open_psd(FilePath::new(&path)))
        })
        .command_async("pdf_pages", |Path { path }| {
            blocking(move || pdf::page_count(FilePath::new(&path)))
        })
        .command_async(
            "render_pdf_page",
            |PdfPage {
                 path,
                 page,
                 longest,
             }| {
                blocking(move || pdf::render_page(FilePath::new(&path), page, longest))
            },
        );
    let window = register_saving(window, state);
    register_ai(window, state)
}

fn register_ai(window: SabineWindow, state: &EaselState) -> SabineWindow {
    let chunks = state.ai.clone();
    let finishing = (state.ai.clone(), state.models.clone(), state.events.clone());
    window
        .with("ai_models", &state.models, |models, Empty {}| models.list())
        .with(
            "ai_install",
            &state.models,
            |models, ai::Install { engine }| models.install(engine),
        )
        .with(
            "ai_cancel",
            &state.models,
            |models, ai::Install { engine }| models.cancel(engine),
        )
        .with("ai_begin", &state.ai, |jobs, begin: ai::Begin| {
            Ok(jobs.start(ai::Job::new(begin)))
        })
        .bridge_typed("ai_chunk", move |request: WithBody<ai::Chunk>| {
            let data = body(request.body)?;
            let job = chunks.get(request.params.id).map_err(BridgeError::new)?;
            let mut job = job.lock();
            if request.params.mask {
                job.mask.extend_from_slice(&data)
            } else {
                job.pixels.extend_from_slice(&data)
            }
            Ok(())
        })
        .bridge_typed_async("ai_commit", move |request: WithBody<Job>| {
            let (jobs, models, events) = finishing.clone();
            async move {
                let job = jobs.finish(request.params.id).map_err(BridgeError::new)?;
                blocking(move || job.finish(&models, &events))
                    .await
                    .map_err(BridgeError::new)
            }
        })
}

fn register_saving(window: SabineWindow, state: &EaselState) -> SabineWindow {
    let saves = state.saves.clone();
    let exports = state.exports.clone();
    let window = window
        .with("save_begin", &state.saves, |saves, begin: save::Begin| {
            Ok(saves.start(save::Save::new(begin)))
        })
        .with_async(
            "save_commit",
            &state.saves,
            |saves, Job { id }| async move {
                let job = saves.finish(id)?;
                blocking(move || job.write()).await
            },
        )
        .with(
            "export_begin",
            &state.exports,
            |exports, begin: export::Begin| Ok(exports.start(export::Export::new(begin))),
        )
        .with_async(
            "export_commit",
            &state.exports,
            |exports, Job { id }| async move {
                let job = exports.finish(id)?;
                blocking(move || job.write()).await
            },
        );
    let tile_saves = saves.clone();
    window
        .bridge_typed_async("save_tiles", move |request: WithBody<save::Tiles>| {
            let saves = tile_saves.clone();
            async move {
                let raw = body(request.body)?;
                let job = saves.get(request.params.id).map_err(BridgeError::new)?;
                blocking(move || {
                    job.lock().add_tiles(
                        &request.params.layer,
                        &request.params.indices,
                        &raw,
                        request.params.mask,
                    )
                })
                .await
                .map_err(BridgeError::new)
            }
        })
        .bridge_typed("save_asset", move |request: WithBody<save::Asset>| {
            let data = body(request.body)?;
            saves
                .get(request.params.id)
                .and_then(|job| job.lock().add_asset(&request.params.name, data))
                .map_err(BridgeError::new)
        })
        .bridge_typed("save_preview", {
            let saves = state.saves.clone();
            move |request: WithBody<save::Preview>| {
                let data = body(request.body)?;
                let save::Preview { id, width, height } = request.params;
                saves
                    .get(id)
                    .map(|job| job.lock().set_preview(width, height, data))
                    .map_err(BridgeError::new)
            }
        })
        .bridge_typed_async("export_tiles", move |request: WithBody<export::Tiles>| {
            let exports = exports.clone();
            async move {
                let raw = body(request.body)?;
                let job = exports.get(request.params.id).map_err(BridgeError::new)?;
                blocking(move || job.lock().add_tiles(&request.params.indices, &raw))
                    .await
                    .map_err(BridgeError::new)
            }
        })
        .bridge_typed_async("export_file", |request: WithBody<Path>| async move {
            let data = body(request.body)?;
            blocking(move || {
                files::write_atomically(FilePath::new(&request.params.path), |file| {
                    std::io::Write::write_all(file, &data).map_err(failed)
                })
            })
            .await
            .map_err(BridgeError::new)
        })
        .bridge_typed_async("export_pdf", |request: WithBody<Path>| async move {
            let svg = body(request.body)?;
            blocking(move || pdf::write(FilePath::new(&request.params.path), &svg))
                .await
                .map_err(BridgeError::new)
        })
}
