use std::sync::LazyLock;

use serde::Deserialize;

pub const REDIRECT: &str = "http://localhost:53682/";
pub const REDIRECT_PORT: u16 = 53682;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Registration {
    client_id: String,
    client_secret: Option<String>,
}

#[derive(Deserialize)]
struct Registrations {
    onedrive: Registration,
    dropbox: Registration,
}

static REGISTERED: LazyLock<Registrations> = LazyLock::new(|| {
    serde_json::from_str(include_str!("../../data/apps.json"))
        .expect("the app registrations are valid")
});

pub struct App {
    pub client_id: &'static str,
    pub client_secret: Option<&'static str>,
    pub authorize: &'static str,
    pub token: &'static str,
    pub scope: &'static str,
    pub extra: &'static [(&'static str, &'static str)],
}

pub static ONEDRIVE: LazyLock<App> = LazyLock::new(|| App {
    client_id: &REGISTERED.onedrive.client_id,
    client_secret: REGISTERED.onedrive.client_secret.as_deref(),
    authorize: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    token: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    scope: "openid email profile offline_access Files.Read Files.ReadWrite Files.Read.All Files.ReadWrite.All Sites.Read.All",
    extra: &[("prompt", "select_account")],
});

pub static DROPBOX: LazyLock<App> = LazyLock::new(|| App {
    client_id: &REGISTERED.dropbox.client_id,
    client_secret: REGISTERED.dropbox.client_secret.as_deref(),
    authorize: "https://www.dropbox.com/oauth2/authorize",
    token: "https://api.dropboxapi.com/oauth2/token",
    scope: "files.metadata.write files.content.write files.content.read sharing.write account_info.read",
    extra: &[
        ("token_access_type", "offline"),
        ("force_reapprove", "true"),
    ],
});
