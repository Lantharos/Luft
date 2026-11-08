use luft_app::dbus::{self, failed};
use zbus::Variant;

const SYSTEMD: &str = "org.freedesktop.systemd1";
const SYSTEMD_PATH: &str = "/org/freedesktop/systemd1";
const MANAGER: &str = "org.freedesktop.systemd1.Manager";

type Properties<'a> = Vec<(&'a str, Variant<'a>)>;

pub fn separate(shell: u32) {
    luft_app::spawn(async move {
        if let Err(error) = start(shell).await {
            eprintln!("Couldn't give the shell its own scope: {error}");
        }
    });
}

async fn start(shell: u32) -> Result<(), String> {
    let unit = format!("tern-shell-{shell}.scope");
    let properties: Properties = vec![
        ("Slice", Variant::from("app.slice")),
        ("PIDs", Variant::from(vec![shell])),
        ("CollectMode", Variant::from("inactive-or-failed")),
    ];
    let auxiliary: Vec<(&str, Properties)> = Vec::new();
    dbus::session()
        .await?
        .call_method(
            Some(SYSTEMD),
            SYSTEMD_PATH,
            Some(MANAGER),
            "StartTransientUnit",
            &(unit.as_str(), "fail", properties, auxiliary),
        )
        .await
        .map(drop)
        .map_err(failed)
}
