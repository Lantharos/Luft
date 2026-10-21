use luft_app::dbus::{self, failed};
use serde::Deserialize;
use zbus::{OwnedObjectPath, Proxy};

use crate::{L10N, installer};

const ACCOUNTS: &str = "org.freedesktop.Accounts";
const ACCOUNTS_PATH: &str = "/org/freedesktop/Accounts";
const USER: &str = "org.freedesktop.Accounts.User";

#[derive(Deserialize)]
pub struct Language {
    language: String,
}

async fn remember_for_account(language: &str) -> Result<(), String> {
    let connection = dbus::system().await?;
    let accounts = Proxy::new(connection, ACCOUNTS, ACCOUNTS_PATH, ACCOUNTS)
        .await
        .map_err(failed)?;
    let uid = i64::from(unsafe { libc::getuid() });
    let path: OwnedObjectPath = accounts.call("FindUserById", &uid).await.map_err(failed)?;
    Proxy::new(connection, ACCOUNTS, path, USER)
        .await
        .map_err(failed)?
        .call::<_, _, ()>("SetLanguage", &(language,))
        .await
        .map_err(failed)
}

pub async fn use_language(Language { language }: Language) -> Result<(), String> {
    let tag = luft_i18n::bcp47(&language).unwrap_or_else(|| luft_i18n::SOURCE_LOCALE.to_owned());
    L10N.use_locale(&tag);
    luft_trust::L10N.use_locale(&tag);
    installer::call::<_, ()>("UseLanguage", &(tag,)).await?;
    remember_for_account(&language).await
}
