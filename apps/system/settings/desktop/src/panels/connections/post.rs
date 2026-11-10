use std::path::PathBuf;

use luft_app::dbus::{self, failed};
use luft_app::portal::{self, FileChooser};
use luft_app::{Commands, Empty};
use luft_i18n::t;
use sabine::SabineWindow;
use serde::Serialize;
use specta::Type;
use zbus::Proxy;

use crate::L10N;

const NAME: &str = "com.lantharos.Kestrel.Post";
const LOCALSEND: &str = "https://localsend.org";
const PATH: &str = "/com/lantharos/Kestrel/Post";

#[derive(Serialize, Type)]
pub struct PostState {
    alias: String,
    folder: String,
}

async fn post() -> Result<Proxy<'static>, String> {
    Proxy::new(dbus::session().await?, NAME, PATH, NAME)
        .await
        .map_err(failed)
}

async fn state(Empty {}: Empty) -> Result<PostState, String> {
    let post = post().await?;
    Ok(PostState {
        alias: post.get_property("Alias").await.map_err(failed)?,
        folder: post.get_property("Folder").await.map_err(failed)?,
    })
}

async fn choose_folder(Empty {}: Empty) -> Result<Option<String>, String> {
    let title = t!(L10N, "desktop-post-choose-folder");
    let chosen = FileChooser {
        title: &title,
        directory: true,
        ..FileChooser::default()
    }
    .open()
    .await?;
    Ok(chosen
        .first()
        .and_then(|uri| portal::uri_path(uri))
        .map(|path: PathBuf| path.to_string_lossy().into_owned()))
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command_async("post_state", state)
        .command_async("post_choose_folder", choose_folder)
        .command_async("post_start_pairing", |Empty {}| async move {
            post()
                .await?
                .call::<_, _, String>("StartPairing", &())
                .await
                .map_err(failed)
        })
        .command_async("post_stop_pairing", |Empty {}| async move {
            post()
                .await?
                .call::<_, _, ()>("StopPairing", &())
                .await
                .map_err(failed)
        })
        .command("post_get_localsend", |Empty {}| {
            gio::AppInfo::launch_default_for_uri(LOCALSEND, None::<&gio::AppLaunchContext>)
                .map_err(failed)
        })
}
