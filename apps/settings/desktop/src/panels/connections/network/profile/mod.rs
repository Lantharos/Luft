pub mod enterprise;
pub mod ip;
mod reapply;
pub mod settings;
pub mod wireless;

use luft_app::dbus;
use luft_app::dbus::objects::failed;
use serde::{Deserialize, Serialize};
use zbus::blocking::Proxy;
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

pub fn explain(error: zbus::Error) -> String {
    match &error {
        zbus::Error::MethodError(name, _, _) if name.ends_with("PermissionDenied") => {
            "You don't have permission to change this connection".to_owned()
        }
        zbus::Error::MethodError(_, Some(message), _) => message.clone(),
        _ => error.to_string(),
    }
}

fn connection(path: &str) -> Result<Proxy<'_>, String> {
    Proxy::new(dbus::system()?, SERVICE, path, CONNECTION).map_err(failed)
}

fn settings(connection: &Proxy) -> Result<Settings, String> {
    connection.call("GetSettings", &()).map_err(explain)
}

pub fn load(path: &str) -> Result<Profile, String> {
    let settings = settings(&connection(path)?)?;
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

pub fn save(
    Save {
        path,
        profile,
        secret,
    }: Save,
) -> Result<(), String> {
    let connection = connection(&path)?;
    let mut settings = settings(&connection)?;
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
        .call_with_flags::<_, _, ()>(
            "Update",
            MethodFlags::AllowInteractiveAuth.into(),
            &(settings,),
        )
        .map_err(explain)?;
    reapply::reapply(&path)
}

pub fn secret(path: &str) -> Result<Option<String>, String> {
    let connection = connection(path)?;
    let settings = settings(&connection)?;
    let Some((group, key)) = wireless::secret_key(&settings) else {
        return Ok(None);
    };
    let secrets: Option<Settings> = connection
        .call_with_flags(
            "GetSecrets",
            MethodFlags::AllowInteractiveAuth.into(),
            &(group,),
        )
        .map_err(explain)?;
    Ok(secrets.and_then(|secrets| get(&secrets, group, key)))
}
