use luft_app::Commands;
use sabine::SabineWindow;
use schelf_core::files::inspect;
use serde::Deserialize;
use specta::Type;

#[derive(Deserialize, Type)]
struct File {
    path: String,
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window.command("files_inspect", |File { path }| inspect(&path))
}
