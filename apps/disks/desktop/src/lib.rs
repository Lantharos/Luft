mod actions;
mod bridge;
mod images;
mod launch;
mod space;
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
        |window| bridge::register(GLASS_WINDOW.apply(window), &state),
        udisks::watch::start,
    )
}
