use crate::context::Context;
use crate::shared::settings::Schemas;
use crate::shared::system::SystemdProxy;

const APPLICATIONS: &str = "org.gnome.desktop.a11y.applications";
const INTERFACE: &str = "org.gnome.desktop.interface";
const SCREEN_READER: &str = "screen-reader-enabled";
const ASSISTIVE: [&str; 3] = [
    SCREEN_READER,
    "screen-keyboard-enabled",
    "screen-magnifier-enabled",
];
const SCREEN_READER_UNIT: &str = "orca.service";

pub async fn start(context: &Context) -> zbus::Result<()> {
    let Some(mut settings) = context.settings.watch(&[APPLICATIONS, INTERFACE]).await else {
        return Ok(());
    };
    let systemd = SystemdProxy::new(&context.session).await?;
    if assistive_enabled(&settings) {
        settings.set(INTERFACE, "toolkit-accessibility", true);
    }
    if settings.get(APPLICATIONS, SCREEN_READER) {
        run_screen_reader(&systemd, true).await;
    }
    tokio::spawn(async move {
        loop {
            let (schema, key) = settings.changed().await;
            if schema != APPLICATIONS || !ASSISTIVE.contains(&key.as_str()) {
                continue;
            }
            settings.set(
                INTERFACE,
                "toolkit-accessibility",
                assistive_enabled(&settings),
            );
            if key == SCREEN_READER {
                run_screen_reader(&systemd, settings.get(APPLICATIONS, SCREEN_READER)).await;
            }
        }
    });
    Ok(())
}

fn assistive_enabled(settings: &Schemas) -> bool {
    ASSISTIVE
        .iter()
        .any(|key| settings.get::<bool>(APPLICATIONS, key))
}

async fn run_screen_reader(systemd: &SystemdProxy<'_>, enabled: bool) {
    let changed = if enabled {
        systemd.start_unit(SCREEN_READER_UNIT, "replace").await
    } else {
        systemd.stop_unit(SCREEN_READER_UNIT, "replace").await
    };
    if let Err(error) = changed {
        eprintln!(
            "Couldn't {} the screen reader: {error}",
            if enabled { "start" } else { "stop" }
        );
    }
}
