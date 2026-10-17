mod bridge;
mod gpu;
mod monitor;
mod settings;
mod system;
mod tasks;

use luft_app::{Events, GlassWindow};

use monitor::Monitor;

const WINDOW: GlassWindow = GlassWindow {
    title: "Barometer",
    size: (1120, 760),
    min_size: (820, 560),
    sidebar_width: 280,
    single_instance: Some("com.lantharos.barometer"),
};

const SAMPLE_SYSTEM: &str = "LUFT_SAMPLE_SYSTEM";

pub(crate) fn sample_system() -> bool {
    std::env::var_os(SAMPLE_SYSTEM).is_some()
}

pub fn run_app() -> ! {
    raise_file_limit();
    let events = Events::default();
    let monitor = Monitor::new();
    let sampler = monitor.clone();
    luft_app::run(
        &events,
        |window| bridge::register(WINDOW.apply(window), &monitor),
        move |events| {
            if !sample_system() {
                sampler.start(events).expect("Barometer needs /proc to run");
            }
        },
    )
}

fn raise_file_limit() {
    let mut limit: libc::rlimit = unsafe { std::mem::zeroed() };
    if unsafe { libc::getrlimit(libc::RLIMIT_NOFILE, &mut limit) } == 0
        && limit.rlim_cur < limit.rlim_max
    {
        limit.rlim_cur = limit.rlim_max;
        unsafe { libc::setrlimit(libc::RLIMIT_NOFILE, &limit) };
    }
}
