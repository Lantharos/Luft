pub mod decode;
pub mod encode;
pub mod export;
pub mod layered;
pub mod pdf;
pub mod raw;

use std::path::Path;
use std::sync::LazyLock;
use std::sync::mpsc;
use std::thread;

use gio::glib;
use glycin::SandboxSelector;

const APP_SANDBOX: &str = "/.flatpak-info";

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

pub fn on_glycin<T: Send + 'static, F: Future<Output = Result<T, String>> + 'static>(
    work: impl FnOnce() -> F + Send + 'static,
) -> Result<T, String> {
    let (sender, receiver) = mpsc::channel();
    CONTEXT.invoke(move || {
        CONTEXT.spawn_local(async move {
            let _ = sender.send(work().await);
        });
    });
    receiver.recv().map_err(|error| error.to_string())?
}

pub fn context() -> glib::MainContext {
    CONTEXT.clone()
}

/// Glycin's own sandbox can't start inside the one Sabine or Schelf holds
/// Easel to, which confines the loaders with it instead.
pub fn loaders_sandbox() -> SandboxSelector {
    static SELECTOR: LazyLock<SandboxSelector> = LazyLock::new(|| {
        if sabine::documents::confined() || Path::new(APP_SANDBOX).exists() {
            SandboxSelector::NotSandboxed
        } else {
            SandboxSelector::Auto
        }
    });
    *SELECTOR
}

pub fn premultiply(pixels: &mut [u8]) {
    for pixel in pixels.as_chunks_mut::<4>().0 {
        let alpha = u16::from(pixel[3]);
        for channel in &mut pixel[..3] {
            *channel = ((u16::from(*channel) * alpha + 127) / 255) as u8;
        }
    }
}
