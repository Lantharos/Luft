pub const REDIRECT: &str = "http://localhost:53682/";
pub const REDIRECT_PORT: u16 = 53682;

pub struct App {
    pub client_id: &'static str,
    pub client_secret: &'static str,
    pub authorize: &'static str,
    pub token: &'static str,
    pub scope: &'static str,
    pub extra: &'static [(&'static str, &'static str)],
}

const fn configured(built: Option<&'static str>, fallback: &'static str) -> &'static str {
    match built {
        Some(value) => value,
        None => fallback,
    }
}

pub const ONEDRIVE: App = App {
    client_id: configured(option_env!("LUFT_ONEDRIVE_CLIENT_ID"), "b15665d9-eda6-4092-8539-0eec376afd59"),
    client_secret: configured(option_env!("LUFT_ONEDRIVE_CLIENT_SECRET"), "qtyfaBBYA403=unZUP40~_#"),
    authorize: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    token: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    scope: "openid email profile offline_access Files.Read Files.ReadWrite Files.Read.All Files.ReadWrite.All Sites.Read.All",
    extra: &[("prompt", "select_account")],
};

pub const DROPBOX: App = App {
    client_id: configured(option_env!("LUFT_DROPBOX_CLIENT_ID"), "5jcck7diasz0rqy"),
    client_secret: configured(option_env!("LUFT_DROPBOX_CLIENT_SECRET"), "1n9m04y2zx7bf26"),
    authorize: "https://www.dropbox.com/oauth2/authorize",
    token: "https://api.dropboxapi.com/oauth2/token",
    scope: "files.metadata.write files.content.write files.content.read sharing.write account_info.read",
    extra: &[("token_access_type", "offline"), ("force_reapprove", "true")],
};
