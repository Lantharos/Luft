pub mod enterprise;
pub mod ip;
mod reapply;
pub mod settings;
pub mod wireless;

use luft_app::dbus::{self, failed};
use serde::{Deserialize, Serialize};
use zbus::Proxy;
use zbus::proxy::MethodFlags;

use super::{CONNECTION, SERVICE};
use ip::Ip;
use settings::{Settings, get, put, put_text, read};
use wireless::Wireless;

pub use wireless::Security;

const GENERAL: &str = "connection";
const ETHERNET: &str = "802-3-ethernet";
pub const WIFI: &str = "802-11-wireless";

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq)]
#[serde(rename_all = "lowercase")]
enum Kind {
    Wired,
    Wifi,
    Vpn,
    Other,
}

#[derive(Serialize, Deserialize, Clone, Copy)]
#[serde(rename_all = "lowercase")]
enum Metered {
    Automatic = 0,
    Yes = 1,
    No = 2,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Profile {
    kind: Kind,
    name: String,
    autoconnect: bool,
    all_users: bool,
    metered: Metered,
    ipv4: Ip,
    ipv6: Ip,
    mtu: u32,
    mac: String,
    wireless: Option<Wireless>,
}

#[derive(Deserialize)]
pub struct Save {
    path: String,
    profile: Profile,
    secret: Option<String>,
}

fn kind(settings: &Settings) -> Kind {
    match get::<String>(settings, GENERAL, "type").as_deref() {
        Some(ETHERNET) => Kind::Wired,
        Some(WIFI) => Kind::Wifi,
        Some("vpn" | "wireguard") => Kind::Vpn,
        _ => Kind::Other,
    }
}

fn link(kind: Kind) -> Option<&'static str> {
    match kind {
        Kind::Wired => Some(ETHERNET),
        Kind::Wifi => Some(WIFI),
        Kind::Vpn | Kind::Other => None,
    }
}

fn metered(value: Option<i32>) -> Metered {
    match value {
        Some(1) => Metered::Yes,
        Some(2) => Metered::No,
        _ => Metered::Automatic,
    }
}

pub fn explain(error: &zbus::Error) -> String {
    if dbus::error_name(error).is_some_and(|name| name.ends_with("PermissionDenied")) {
        return "You don't have permission to change this connection".to_owned();
    }
    dbus::explain(error)
}

async fn connection(path: &str) -> Result<Proxy<'_>, String> {
    Proxy::new(dbus::system().await?, SERVICE, path, CONNECTION)
        .await
        .map_err(failed)
}

async fn settings(connection: &Proxy<'_>) -> Result<Settings, String> {
    connection
        .call("GetSettings", &())
        .await
        .map_err(|error| explain(&error))
}

pub async fn load(path: &str) -> Result<Profile, String> {
    let settings = settings(&connection(path).await?).await?;
    let kind = kind(&settings);
    let link = link(kind).and_then(|group| settings.get(group));
    let permissions: Vec<String> = get(&settings, GENERAL, "permissions").unwrap_or_default();
    Ok(Profile {
        kind,
        name: get(&settings, GENERAL, "id").unwrap_or_default(),
        autoconnect: get(&settings, GENERAL, "autoconnect").unwrap_or(true),
        all_users: permissions.is_empty(),
        metered: metered(get(&settings, GENERAL, "metered")),
        ipv4: ip::load(settings.get("ipv4")),
        ipv6: ip::load(settings.get("ipv6")),
        mtu: read(link, "mtu").unwrap_or(0),
        mac: read(link, "assigned-mac-address").unwrap_or_default(),
        wireless: (kind == Kind::Wifi).then(|| wireless::load(&settings)),
    })
}

pub fn owner() -> Vec<String> {
    vec![format!(
        "user:{}:",
        gio::glib::user_name().to_string_lossy()
    )]
}

pub async fn save(
    Save {
        path,
        profile,
        secret,
    }: Save,
) -> Result<(), String> {
    let connection = connection(&path).await?;
    let mut settings = settings(&connection).await?;
    let general = settings.entry(GENERAL.to_owned()).or_default();
    put(general, "id", profile.name.trim().to_owned());
    put(general, "autoconnect", profile.autoconnect);
    put(general, "metered", profile.metered as i32);
    put(
        general,
        "permissions",
        if profile.all_users {
            Vec::new()
        } else {
            owner()
        },
    );
    ip::store(
        settings.entry("ipv4".to_owned()).or_default(),
        &profile.ipv4,
    )?;
    ip::store(
        settings.entry("ipv6".to_owned()).or_default(),
        &profile.ipv6,
    )?;
    if let Some(group) = link(profile.kind) {
        let link = settings.entry(group.to_owned()).or_default();
        put(link, "mtu", profile.mtu);
        link.remove("cloned-mac-address");
        put_text(link, "assigned-mac-address", &profile.mac);
    }
    if let Some(wireless) = &profile.wireless {
        wireless::store(&mut settings, wireless, secret.as_deref());
    }
    connection
        .call_with_flags::<_, _, ()>("Update", MethodFlags::ALLOW_INTERACTIVE_AUTH, &(settings,))
        .await
        .map_err(|error| explain(&error))?;
    reapply::reapply(&path).await
}

pub async fn secret(path: &str) -> Result<Option<String>, String> {
    let connection = connection(path).await?;
    let settings = settings(&connection).await?;
    let Some((group, key)) = wireless::secret_key(&settings) else {
        return Ok(None);
    };
    let secrets: Option<Settings> = connection
        .call_with_flags("GetSecrets", MethodFlags::ALLOW_INTERACTIVE_AUTH, &(group,))
        .await
        .map_err(|error| explain(&error))?;
    Ok(secrets.and_then(|secrets| get(&secrets, group, key)))
}
