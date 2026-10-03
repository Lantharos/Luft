mod display;
mod gtk;
mod modules;
mod resources;
mod snapshot;
mod wire;

use std::path::{Path, PathBuf};

use tokio::process::Command;
use tokio::sync::watch;
use zbus::object_server::InterfaceRef;
use zbus::{fdo, interface};

use crate::context::Context;
use crate::shared::remote::{Endpoint, RemoteProperty};
use crate::shared::settings::Schemas;
use crate::shared::watch::TreeWatch;
use display::Display;
use gtk::GtkSettings;
use modules::GtkModule;
use snapshot::{INTERFACE, Inputs, SCHEMAS, Snapshot};

const PATH: &str = "/com/lantharos/Settings";
const MUTTER_X11: Endpoint = Endpoint {
    service: "org.gnome.Mutter.X11",
    path: "/org/gnome/Mutter/X11",
    interface: "org.gnome.Mutter.X11",
};
const INTROSPECT: Endpoint = Endpoint {
    service: "com.lantharos.Kestrel.Introspect",
    path: "/com/lantharos/Kestrel/Introspect",
    interface: "com.lantharos.Kestrel.Introspect",
};

struct Sources {
    settings: Schemas,
    modules: Vec<GtkModule>,
    bus_id: String,
    window_scale: Option<i32>,
    animations: Option<bool>,
    fonts_changed: i64,
}

impl Sources {
    fn enabled_modules(&self) -> String {
        modules::enabled(&self.modules, &self.settings)
    }

    fn animations(&self) -> bool {
        self.animations
            .unwrap_or_else(|| self.settings.get(INTERFACE, "enable-animations"))
    }

    fn snapshot(&self) -> Snapshot {
        snapshot::build(&Inputs {
            settings: &self.settings,
            bus_id: &self.bus_id,
            window_scale: self.window_scale.unwrap_or(1),
            animations: self.animations(),
            modules: &self.enabled_modules(),
            fonts_changed: self.fonts_changed,
        })
    }

    fn gtk(&self) -> GtkSettings {
        GtkSettings {
            fontconfig_timestamp: self.fonts_changed,
            modules: self.enabled_modules(),
            enable_animations: self.animations(),
        }
    }
}

struct Xwayland {
    snapshots: watch::Receiver<Snapshot>,
}

#[interface(name = "com.lantharos.Settings.Xwayland")]
impl Xwayland {
    async fn start(&self, display: &str, authority: &str) -> fdo::Result<()> {
        let snapshot = self.snapshots.borrow().clone();
        let resources = tokio::task::spawn_blocking(resources::load)
            .await
            .unwrap_or_default();
        let connection = Display::connect(display, Path::new(authority))
            .and_then(|mut connection| {
                connection.merge_resources(&resources)?;
                connection.apply(&snapshot)?;
                Ok(connection)
            })
            .map_err(|error| {
                fdo::Error::Failed(format!("Couldn't serve settings to X11 apps: {error}"))
            })?;
        run_session_scripts(display, authority).await;
        tokio::spawn(connection.serve(self.snapshots.clone()));
        Ok(())
    }
}

pub async fn start(context: &Context) -> zbus::Result<()> {
    let modules = modules::installed();
    let mut schemas = SCHEMAS.to_vec();
    schemas.extend(modules.iter().filter_map(GtkModule::schema));
    schemas.sort_unstable();
    schemas.dedup();
    let Some(settings) = context.settings.watch(&schemas).await else {
        return Ok(());
    };
    let session = &context.session;
    let mut scale = RemoteProperty::<i32>::new(session, &MUTTER_X11, "UiScalingFactor").await?;
    let mut animations =
        RemoteProperty::<bool>::new(session, &INTROSPECT, "AnimationsEnabled").await?;
    let mut sources = Sources {
        settings,
        modules,
        bus_id: fdo::DBusProxy::new(session)
            .await?
            .get_id()
            .await?
            .to_string(),
        window_scale: scale.get().await,
        animations: animations.get().await,
        fonts_changed: 0,
    };
    let (snapshots, receiver) = watch::channel(sources.snapshot());
    let server = session.object_server();
    server.at(gtk::PATH, sources.gtk()).await?;
    server
        .at(
            PATH,
            Xwayland {
                snapshots: receiver,
            },
        )
        .await?;
    session.request_name(gtk::NAME).await?;
    let gtk = server.interface::<_, GtkSettings>(gtk::PATH).await?;
    let mut fonts = TreeWatch::new(font_directories())?;
    tokio::spawn(async move {
        loop {
            tokio::select! {
                _ = sources.settings.changed() => {}
                value = scale.changed() => sources.window_scale = value,
                value = animations.changed() => sources.animations = value,
                () = fonts.changed() => sources.fonts_changed = glib::real_time(),
            }
            let snapshot = sources.snapshot();
            snapshots.send_if_modified(|current| {
                let changed = *current != snapshot;
                *current = snapshot;
                changed
            });
            publish(&gtk, sources.gtk()).await;
        }
    });
    Ok(())
}

async fn publish(interface: &InterfaceRef<GtkSettings>, next: GtkSettings) {
    let emitter = interface.signal_emitter();
    let mut current = interface.get_mut().await;
    let timestamp = current.fontconfig_timestamp != next.fontconfig_timestamp;
    let modules = current.modules != next.modules;
    let animations = current.enable_animations != next.enable_animations;
    *current = next;
    let emitted = async {
        if timestamp {
            current.fontconfig_timestamp_changed(emitter).await?;
        }
        if modules {
            current.modules_changed(emitter).await?;
        }
        if animations {
            current.enable_animations_changed(emitter).await?;
        }
        zbus::Result::Ok(())
    };
    if let Err(error) = emitted.await {
        eprintln!("Couldn't announce GTK settings: {error}");
    }
}

fn font_directories() -> Vec<PathBuf> {
    let mut directories = vec![
        glib::user_data_dir().join("fonts"),
        glib::home_dir().join(".fonts"),
    ];
    directories.extend(
        glib::system_data_dirs()
            .into_iter()
            .map(|directory| directory.join("fonts")),
    );
    directories
}

async fn run_session_scripts(display: &str, authority: &str) {
    for directory in glib::system_config_dirs() {
        let Ok(entries) = std::fs::read_dir(directory.join("Xwayland-session.d")) else {
            continue;
        };
        let mut scripts: Vec<PathBuf> = entries
            .flatten()
            .filter(|entry| entry.file_type().is_ok_and(|kind| kind.is_file()))
            .map(|entry| entry.path())
            .filter(|path| rustix::fs::access(path, rustix::fs::Access::EXEC_OK).is_ok())
            .collect();
        scripts.sort();
        for script in scripts {
            let status = Command::new(&script)
                .env("DISPLAY", display)
                .env("XAUTHORITY", authority)
                .status()
                .await;
            if let Err(error) = status {
                eprintln!("Couldn't run {}: {error}", script.display());
            }
        }
    }
}
