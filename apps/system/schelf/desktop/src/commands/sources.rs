use luft_app::{Commands, Empty, block_on};
use luft_software::system::repositories::{self, Draft};
use luft_software::system::system_packages;
use sabine::SabineWindow;
use schelf_core::library::sources::{CheckedSource, list};
use serde::Deserialize;
use specta::Type;

#[derive(Deserialize, Type)]
struct Fetch {
    source: String,
}

#[derive(Deserialize, Type)]
struct Add {
    draft: Draft,
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command("sources_list", |Empty {}| list())
        .command("sources_fetch", |Fetch { source }| {
            CheckedSource::check(repositories::fetch(source.trim())?)
        })
        .command("sources_add", |Add { draft }| {
            block_on(system_packages::add_repository(&draft))
        })
}
