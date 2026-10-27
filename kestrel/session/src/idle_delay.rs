use gio::prelude::*;
use tokio::sync::watch;

const SCHEMA: &str = "org.gnome.desktop.session";
const KEY: &str = "idle-delay";

/// How many seconds without input count as idle, as set in GNOME's session
/// settings, followed on a thread of its own since GSettings needs a GLib
/// main loop.
pub fn follow() -> watch::Receiver<u32> {
    let (sender, delay) = watch::channel(0);
    std::thread::Builder::new()
        .name("gsettings".into())
        .spawn(move || {
            let context = glib::MainContext::new();
            context
                .with_thread_default(|| {
                    let settings = gio::Settings::new(SCHEMA);
                    sender.send_replace(settings.uint(KEY));
                    settings.connect_changed(Some(KEY), move |settings, key| {
                        sender.send_replace(settings.uint(key));
                    });
                    glib::MainLoop::new(Some(&context), false).run();
                })
                .expect("the settings thread owns its main context");
        })
        .expect("the settings thread starts");
    delay
}
