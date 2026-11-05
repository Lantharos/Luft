#![cfg_attr(target_os = "windows", windows_subsystem = "windows")]
mod app;
mod boot;
mod check;
mod language;
#[cfg(target_os = "linux")]
mod linux;
mod live;
#[cfg(any(windows, test))]
mod plan;
mod protocol;
mod serving;
mod stick;
#[cfg(windows)]
mod windows;

use luft_i18n::Localizer;

static L10N: Localizer = luft_i18n::localizer!("locales", ["desktop"]);

fn main() {
    #[cfg(windows)]
    if let Some(link) = windows::helper::requested() {
        if windows::libraries::only_from_system32() {
            L10N.use_locale(&link.locale);
            windows::helper::serve(link);
        }
        return;
    }
    #[cfg(target_os = "linux")]
    if let Some(locale) = linux::helper::requested() {
        L10N.use_locale(&locale);
        linux::helper::serve();
        return;
    }
    app::run();
}
