use std::path::Path;

use gio::glib;
use gio::prelude::*;

use super::context::context;
use crate::portal;
use crate::tasks::block_on;

const SANDBOX_MARKER: &str = "/.flatpak-info";

/// Opens `uri` in the person's default app for it. From inside a sandbox the
/// portal starts that app, so it never runs in this app's sandbox.
pub fn open(uri: &str, token: Option<&str>) -> Result<(), glib::Error> {
    if Path::new(SANDBOX_MARKER).exists() {
        return block_on(portal::open_uri(uri, token))
            .map_err(|error| glib::Error::new(gio::IOErrorEnum::Failed, &error));
    }
    let app = gio::File::for_uri(uri).query_default_handler(gio::Cancellable::NONE)?;
    start(&app, &[uri], token)
}

/// Opens `files` in `app`.
pub fn open_files(
    app: &gio::AppInfo,
    files: &[gio::File],
    token: Option<&str>,
) -> Result<(), glib::Error> {
    app.launch(files, Some(&context(token)))
}

/// Starts `app` with `uris`, handing it `token`.
pub fn start(app: &gio::AppInfo, uris: &[&str], token: Option<&str>) -> Result<(), glib::Error> {
    app.launch_uris(uris, Some(&context(token)))
}
