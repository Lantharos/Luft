use gio::glib;
use gio::prelude::*;

const HANDWRITING: &str = "com.lantharos.kestrel.handwriting";

fn settings() -> Option<gio::Settings> {
    gio::SettingsSchemaSource::default()?.lookup(HANDWRITING, true)?;
    Some(gio::Settings::new(HANDWRITING))
}

pub fn enabled() -> bool {
    settings().is_some_and(|settings| settings.boolean("enabled"))
}

/// Calls `changed`, on a thread of its own, whenever handwriting is turned on or off.
pub fn watch(changed: impl Fn() + Send + 'static) -> std::io::Result<()> {
    std::thread::Builder::new()
        .name("preferences".into())
        .spawn(move || {
            let context = glib::MainContext::new();
            let watching = context.with_thread_default(|| {
                let Some(settings) = settings() else { return };
                settings.connect_changed(Some("enabled"), move |_, _| changed());
                glib::MainLoop::new(Some(&context), false).run();
            });
            if let Err(error) = watching {
                eprintln!("Couldn't watch the handwriting settings: {error}");
            }
        })
        .map(drop)
}
