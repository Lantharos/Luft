mod app;
mod background;
mod catalog;
mod cli;
mod fedora;
mod files;
mod library;
mod operations;
mod updates;

use luft_app::{Events, GlassWindow};
use sabine::SabineWindow;

use operations::Queue;

const GLASS_WINDOW: GlassWindow = GlassWindow {
    title: "Schelf",
    size: (1180, 780),
    min_size: (820, 560),
    sidebar_width: 280,
    single_instance: Some("com.lantharos.schelf"),
};

pub fn run_app() -> ! {
    let arguments: Vec<String> = std::env::args().skip(1).collect();
    if let Some(code) = cli::run(&arguments).or_else(|| {
        arguments
            .first()
            .and_then(|command| background::run(command))
    }) {
        std::process::exit(code);
    }
    let events = Events::default();
    let queue = Queue::start(events.clone());
    let served = queue.clone();
    luft_app::run(
        &events,
        |window| build_window(window, &queue),
        move |_| {
            std::thread::spawn(background::integrate_apps);
            luft_app::spawn(serve(served));
        },
    )
}

async fn serve(queue: Queue) {
    if let Err(error) = operations::bus::serve(queue).await {
        eprintln!("Schelf can't take operations from the command line: {error}");
    }
}

fn build_window(window: SabineWindow, queue: &Queue) -> SabineWindow {
    let window = app::register(GLASS_WINDOW.apply(window));
    let window = catalog::register(window);
    let window = fedora::register(window);
    let window = library::register(window);
    let window = files::register(window);
    let window = updates::register(window);
    operations::register(window, queue)
}
