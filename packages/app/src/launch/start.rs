use std::ptr;

use gio::glib::{self, translate::*};
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
    let uris: Vec<glib::GString> = files.iter().map(|file| file.uri()).collect();
    let uris: Vec<&str> = uris.iter().map(glib::GString::as_str).collect();
    start(app, &uris, token)
}

/// Starts `app` with `uris`, handing it `token`. The app starts outside the
/// memory sharing this app may take part in, so a browser never joins it.
pub fn start(app: &gio::AppInfo, uris: &[&str], token: Option<&str>) -> Result<(), glib::Error> {
    let context = context(token);
    let Some(desktop) = app.downcast_ref::<gio_unix::DesktopAppInfo>() else {
        return app.launch_uris(uris, Some(&context));
    };
    let mut error = ptr::null_mut();
    unsafe {
        gio_unix::ffi::g_desktop_app_info_launch_uris_as_manager(
            desktop.to_glib_none().0,
            uris.to_glib_none().0,
            context.to_glib_none().0,
            glib::ffi::G_SPAWN_SEARCH_PATH,
            Some(leave_shared_memory),
            ptr::null_mut(),
            None,
            ptr::null_mut(),
            &mut error,
        );
        if error.is_null() {
            Ok(())
        } else {
            Err(from_glib_full(error))
        }
    }
}

unsafe extern "C" fn leave_shared_memory(_: glib::ffi::gpointer) {
    unsafe { libc::prctl(libc::PR_SET_MEMORY_MERGE, 0, 0, 0, 0) };
}
