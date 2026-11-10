use std::io::{PipeReader, Write};

use luft_app::dbus::{self, error, explain};
use serde::{Deserialize, Serialize};
use specta::Type;
use zbus::Fd;
use zbus::proxy::MethodFlags;

use crate::parse::parse;

const SERVICE: &str = "com.lantharos.Password1";
const PATH: &str = "/com/lantharos/Password1";

#[derive(Deserialize, Type)]
pub struct PasswordChange {
    current: Option<String>,
    password: String,
}

#[derive(Serialize, Deserialize, Clone, Copy, Type)]
#[serde(rename_all = "kebab-case")]
pub enum Weakness {
    TooShort,
    TooSimilar,
    DictionaryWord,
    ContainsName,
    TooSimple,
    Rejected,
}

#[derive(Serialize, Clone, Copy, Type)]
#[serde(rename_all = "camelCase")]
pub enum PasswordOutcome {
    Changed,
    WrongPassword,
    TooWeak(Weakness),
}

fn piped(secret: &str) -> Result<PipeReader, String> {
    let (reader, mut writer) = std::io::pipe().map_err(|error| error.to_string())?;
    writer
        .write_all(secret.as_bytes())
        .map_err(|error| error.to_string())?;
    Ok(reader)
}

pub async fn change(
    PasswordChange { current, password }: PasswordChange,
) -> Result<PasswordOutcome, String> {
    let (current, new) = (
        piped(current.as_deref().unwrap_or_default())?,
        piped(&password)?,
    );
    let changed = zbus::Proxy::new(dbus::system().await?, SERVICE, PATH, SERVICE)
        .await
        .map_err(|error| explain(&error))?
        .call_with_flags::<_, _, ()>(
            "ChangePassword",
            MethodFlags::ALLOW_INTERACTIVE_AUTH,
            &(Fd::from(&current), Fd::from(&new)),
        )
        .await;
    match changed {
        Ok(_) => Ok(PasswordOutcome::Changed),
        Err(refused) => match error::kind(&refused).as_deref() {
            Some("WrongPassword") => Ok(PasswordOutcome::WrongPassword),
            Some("TooWeak") => Ok(PasswordOutcome::TooWeak(
                parse(explain(&refused)).unwrap_or(Weakness::Rejected),
            )),
            _ => Err(explain(&refused)),
        },
    }
}
