use luft_app::dbus::service::{Service, get};
use luft_app::dbus::{self, error_message, failed};
use serde::Serialize;
use specta::Type;
use zbus::wire::DynamicDeserialize;
use zbus::{DynamicType, Proxy};

pub const REMOTE_LOGIN: Service = Service {
    name: "com.lantharos.RemoteLogin1",
    path: "/com/lantharos/RemoteLogin1",
    interface: "com.lantharos.RemoteLogin1",
};

#[derive(Serialize, Type)]
pub struct HostKey {
    kind: String,
    fingerprint: String,
}

#[derive(Serialize, Type)]
pub struct AuthorizedKey {
    kind: String,
    comment: String,
    fingerprint: String,
}

impl From<(String, String, String)> for AuthorizedKey {
    fn from((kind, comment, fingerprint): (String, String, String)) -> Self {
        Self {
            kind,
            comment,
            fingerprint,
        }
    }
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct RemoteLogin {
    enabled: bool,
    password_login: bool,
    public_networks: bool,
    accounts: Vec<String>,
    host_keys: Vec<HostKey>,
    hostname: String,
}

async fn hostname() -> Result<String, String> {
    Proxy::new(
        dbus::system().await?,
        "org.freedesktop.hostname1",
        "/org/freedesktop/hostname1",
        "org.freedesktop.hostname1",
    )
    .await
    .map_err(failed)?
    .get_property("Hostname")
    .await
    .map_err(failed)
}

pub async fn read() -> Result<Option<RemoteLogin>, String> {
    let Some(properties) = REMOTE_LOGIN.read().await? else {
        return Ok(None);
    };
    let host_keys: Vec<(String, String)> = get(&properties, "HostKeys").unwrap_or_default();
    Ok(Some(RemoteLogin {
        enabled: get(&properties, "Enabled").unwrap_or_default(),
        password_login: get(&properties, "PasswordLogin").unwrap_or_default(),
        public_networks: get(&properties, "PublicNetworks").unwrap_or_default(),
        accounts: get(&properties, "Accounts").unwrap_or_default(),
        host_keys: host_keys
            .into_iter()
            .map(|(kind, fingerprint)| HostKey { kind, fingerprint })
            .collect(),
        hostname: hostname().await?,
    }))
}

pub async fn change<B, R>(method: &str, body: &B) -> Result<R, String>
where
    B: Serialize + DynamicType,
    R: for<'d> DynamicDeserialize<'d>,
{
    REMOTE_LOGIN
        .change(method, body)
        .await
        .map_err(|error| error_message(&error).map_or_else(|| failed(&error), str::to_owned))
}
