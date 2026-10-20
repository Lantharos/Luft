#![cfg_attr(target_os = "windows", windows_subsystem = "windows")]
#![cfg_attr(all(test, not(windows)), allow(dead_code))]
mod app;
mod boot;
mod check;
#[cfg(windows)]
mod folders;
#[cfg(windows)]
mod helper;
mod language;
#[cfg(windows)]
mod libraries;
#[cfg(target_os = "linux")]
mod linux;
mod live;
#[cfg(any(windows, test))]
mod plan;
mod protocol;
mod serving;
mod stick;

use luft_i18n::Localizer;

static L10N: Localizer = luft_i18n::localizer!("locales", ["desktop"]);

fn main() {
    #[cfg(windows)]
    if let Some(link) = helper::requested() {
        if libraries::only_from_system32() {
            L10N.use_locale(&link.locale);
            helper::serve(link);
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
