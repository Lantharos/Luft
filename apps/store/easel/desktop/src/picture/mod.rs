pub mod decode;
pub mod encode;
pub mod export;
pub mod pdf;

use std::sync::LazyLock;
use std::sync::mpsc;
use std::thread;

use gio::glib;

static CONTEXT: LazyLock<glib::MainContext> = LazyLock::new(|| {
    let context = glib::MainContext::new();
    let running = context.clone();
    thread::spawn(move || {
        let _entered = sabine::async_runtime().enter();
        let _ = running.with_thread_default(|| {
            glib::MainLoop::new(Some(&running), false).run();
        });
    });
    context
});

pub fn on_glycin<T: Send + 'static>(
    work: impl Future<Output = Result<T, String>> + 'static,
) -> Result<T, String> {
    let (sender, receiver) = mpsc::channel();
    CONTEXT.spawn_local(async move {
        let _ = sender.send(work.await);
    });
    receiver.recv().map_err(|error| error.to_string())?
}

pub fn context() -> glib::MainContext {
    CONTEXT.clone()
}
