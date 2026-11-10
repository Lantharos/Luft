mod actions;
mod bridge;
mod events;
mod images;
mod launch;
mod space;
mod trust;
mod udisks;

use luft_app::GlassWindow;

const GLASS_WINDOW: GlassWindow = GlassWindow {
    title: "Disks",
    size: (1080, 720),
    min_size: (820, 560),
    sidebar_width: 260,
    single_instance: Some("com.lantharos.disks"),
};

pub fn run() -> ! {
    let state = bridge::State::default();
    luft_app::run(
        &state.events,
        |window| {
            let asking = state.events.clone();
            let window = GLASS_WINDOW
                .apply_with_page_close(window)
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
