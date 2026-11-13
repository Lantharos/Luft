use std::path::Path;

use gio::glib;
use gio::prelude::*;

use super::context::context;
use crate::portal;
use crate::tasks::block_on;

const SANDBOX_MARKER: &str = "/.flatpak-info";

fn not_opened(error: String) -> glib::Error {
    glib::Error::new(gio::IOErrorEnum::Failed, &error)
}

fn open_here(uri: &str, token: Option<&str>) -> Result<(), glib::Error> {
    let app = gio::File::for_uri(uri).query_default_handler(gio::Cancellable::NONE)?;
    start(&app, &[uri], token)
}

/// Opens `uri` in the person's default app for it. From inside a sandbox the
/// portal starts that app, so it never runs in this app's sandbox. For code
/// that can't be async; async code awaits [`open_async`].
pub fn open(uri: &str, token: Option<&str>) -> Result<(), glib::Error> {
    if Path::new(SANDBOX_MARKER).exists() {
        return block_on(portal::open_uri(uri, token)).map_err(not_opened);
    }
    open_here(uri, token)
}

/// [`open`] for async code.
pub async fn open_async(uri: &str, token: Option<&str>) -> Result<(), glib::Error> {
    if Path::new(SANDBOX_MARKER).exists() {
        return portal::open_uri(uri, token).await.map_err(not_opened);
    }
    let (uri, token) = (uri.to_owned(), token.map(str::to_owned));
    tokio::task::spawn_blocking(move || open_here(&uri, token.as_deref()))
        .await
        .map_err(|error| not_opened(error.to_string()))?
}

/// Opens `files` in `app`.
pub fn open_files(
    app: &gio::AppInfo,
    files: &[gio::File],
    token: Option<&str>,
) -> Result<(), glib::Error> {
    app.launch(files, Some(&context(app, token)))
}

/// Starts `app` with `uris`, handing it `token`.
pub fn start(app: &gio::AppInfo, uris: &[&str], token: Option<&str>) -> Result<(), glib::Error> {
    app.launch_uris(uris, Some(&context(app, token)))
}
