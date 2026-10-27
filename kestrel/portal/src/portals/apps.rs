use gio::prelude::*;

use crate::gio_thread::GioThread;

pub async fn app_name(gio: &GioThread, app_id: &str) -> Option<String> {
    if app_id.is_empty() {
        return None;
    }
    let desktop_id = format!("{app_id}.desktop");
    let name = gio
        .run(move || gio_unix::DesktopAppInfo::new(&desktop_id).map(|info| info.name().to_string()))
        .await;
    Some(name.unwrap_or_else(|| app_id.to_owned()))
}

pub async fn handler_for_scheme(gio: &GioThread, scheme: &'static str) -> Option<String> {
    gio.run(move || {
        gio::AppInfo::default_for_uri_scheme(scheme)
            .and_then(|info| info.id())
            .map(String::from)
    })
    .await
}
