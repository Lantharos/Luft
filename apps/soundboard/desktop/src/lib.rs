mod app;
mod audio;
mod hotkeys;
mod library;

use app::state::SoundboardState;
use luft_app::GlassWindow;
use luft_i18n::Localizer;
use sabine::SabineWindow;

pub const APP_ID: &str = "com.lantharos.soundboard";
const BACKGROUND: &str = "--background";

pub static L10N: Localizer = luft_i18n::localizer!("locales", ["desktop"]);

const WINDOW: GlassWindow = GlassWindow {
    title: "Soundboard",
    size: (1080, 720),
    min_size: (720, 480),
    sidebar_width: 280,
    single_instance: Some(APP_ID),
};

fn window(window: SabineWindow, state: &SoundboardState, opens_window: bool) -> SabineWindow {
    let launched = state.clone();
    let shown = state.clone();
    let desktop = state.clone();
    let window = WINDOW
        .apply(window)
        .background()
        .tray_icon(app::tray::icon())
        .on_launched(move |process| {
            launched.set_process(process.clone());
            if opens_window {
                process.present(None);
            }
        })
        .on_visibility_changed(move |visibility| shown.window_shown(visibility.visible))
        .on_desktop_event(move |process, event| app::tray::handle(&desktop, process, event));
    app::bridge::register(window, state)
}

pub fn run_app() -> ! {
    let opens_window = !std::env::args().any(|argument| argument == BACKGROUND);
    let state = SoundboardState::new().expect("the app's data folder can be used");
    let started = state.clone();
    luft_app::run(
        state.events(),
        |sabine| self::window(sabine, &state, opens_window),
        move |_| started.start(),
    )
}
