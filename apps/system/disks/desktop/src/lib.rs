mod actions;
mod bridge;
mod events;
mod images;
mod l10n;
mod launch;
mod space;
mod trust;
mod udisks;

use l10n::L10N;
use luft_app::{Backdrop, GlassWindow};
use luft_i18n::t;

pub fn run() -> ! {
    let state = bridge::State::default();
    luft_app::run(
        &state.events,
        |window| {
            let asking = state.events.clone();
            let title = t!(L10N, "disks-app-name");
            let window = GlassWindow {
                title: &title,
                size: (1080, 720),
                min_size: (820, 560),
                sidebar_width: 260,
                single_instance: Some("com.lantharos.disks"),
                backdrop: Backdrop::WINDOW,
            }
            .apply(window)
            .on_close_requested(move |_| {
                asking.emit(events::CLOSE_ASKED, ());
                false
            });
            bridge::register(events::declare(window), &state)
        },
        |events| {
            udisks::watch::start(events.clone());
            trust::watch(events);
        },
    )
}
