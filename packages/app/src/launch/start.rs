use gio::glib;
use gio::prelude::*;

use super::context::context;

/// Opens `uri` in the person's default app for it.
pub fn open(uri: &str, token: Option<&str>) -> Result<(), glib::Error> {
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
