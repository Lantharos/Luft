use std::collections::BTreeMap;
use std::io::Write;

use futures_util::{Stream, StreamExt};
use luft_dbus::{explain, objects, session};
use serde::Serialize;
use serde::de::DeserializeOwned;
use zbus::proxy::{Builder, CacheProperties};
use zbus::{DynamicType, Fd, Proxy, Type};

use crate::types::{Account, Answer, Credentials, Drive, FileState, Provider, Step};

pub const NAME: &str = "com.lantharos.Accounts1";
pub const PATH: &str = "/com/lantharos/Accounts1";
const ACCOUNTS: &str = "com.lantharos.Accounts1";
const FILES: &str = "com.lantharos.Accounts1.Files";

const LONGEST_PASSWORD: usize = 4096;

/// Why the service refused: `kind` is the last part of its D-Bus error name,
/// such as `Unsynced`, for apps to translate, and `message` says it in English.
pub struct Refused {
    pub kind: Option<String>,
    pub message: String,
}

pub enum Signal {
    Accounts,
    Drives,
    Step { session: String, step: Step },
}

async fn proxy(interface: &'static str) -> Result<Proxy<'static>, String> {
    Builder::new(session().await?)
        .destination(NAME)
        .path(PATH)
        .interface(interface)
        .cache_properties(CacheProperties::No)
        .build()
        .await
        .map_err(|error| explain(&error))
}

async fn call<B, R>(interface: &'static str, method: &str, body: &B) -> Result<R, String>
where
    B: Serialize + DynamicType,
    R: DeserializeOwned + Type,
{
    proxy(interface)
        .await?
        .call(method, body)
        .await
        .map_err(|error| explain(&error))
}

async fn call_json<B, R>(interface: &'static str, method: &str, body: &B) -> Result<R, String>
where
    B: Serialize + DynamicType,
    R: DeserializeOwned,
{
    let text: String = call(interface, method, body).await?;
    serde_json::from_str(&text).map_err(|error| error.to_string())
}

fn json(value: &impl Serialize) -> String {
    serde_json::to_string(value).expect("requests always serialize")
}

pub async fn accounts() -> Result<Vec<Account>, String> {
    call_json(ACCOUNTS, "Accounts", &()).await
}

/// Starts a sign-in. The password goes to the service through a pipe, so it
/// is never part of a message on the bus.
async fn start_sign_in(
    method: &str,
    subject: &str,
    credentials: &Credentials,
) -> Result<String, String> {
    let password = credentials.password.as_deref().unwrap_or_default();
    if password.len() > LONGEST_PASSWORD {
        return Err("That password is too long.".to_owned());
    }
    let (reader, mut writer) = std::io::pipe().map_err(|error| error.to_string())?;
    writer
        .write_all(password.as_bytes())
        .map_err(|error| error.to_string())?;
    drop(writer);
    let without_password = Credentials {
        password: None,
        ..credentials.clone()
    };
    call(
        ACCOUNTS,
        method,
        &(subject, json(&without_password), Fd::from(&reader)),
    )
    .await
}

pub async fn sign_in(provider: Provider, credentials: &Credentials) -> Result<String, String> {
    let provider = json(&provider);
    start_sign_in("SignIn", provider.trim_matches('"'), credentials).await
}

pub async fn sign_in_again(account: &str, credentials: &Credentials) -> Result<String, String> {
    start_sign_in("SignInAgain", account, credentials).await
}

pub async fn step(session: &str) -> Result<Step, String> {
    call_json(ACCOUNTS, "Step", &(session,)).await
}

pub async fn answer(session: &str, answer: &Answer) -> Result<(), String> {
    call(ACCOUNTS, "Answer", &(session, json(answer))).await
}

pub async fn cancel(session: &str) -> Result<(), String> {
    call(ACCOUNTS, "Cancel", &(session,)).await
}

pub async fn rename(account: &str, name: &str) -> Result<(), String> {
    call(ACCOUNTS, "Rename", &(account, name)).await
}

/// Removes an account and its files from this computer. Unless
/// `discard_unsynced`, it is refused as `Unsynced` while files kept here may
/// not have reached the cloud.
pub async fn remove_account(account: &str, discard_unsynced: bool) -> Result<(), Refused> {
    let accounts = proxy(ACCOUNTS).await.map_err(|message| Refused {
        kind: None,
        message,
    })?;
    accounts
        .call("Remove", &(account, discard_unsynced))
        .await
        .map_err(|error| Refused {
            kind: luft_dbus::error::kind(&error),
            message: explain(&error),
        })
}

pub async fn drives() -> Result<Vec<Drive>, String> {
    call_json(FILES, "Drives", &()).await
}

pub async fn states(folder: &str) -> Result<BTreeMap<String, FileState>, String> {
    call_json(FILES, "States", &(folder,)).await
}

pub async fn keep(paths: &[String]) -> Result<(), String> {
    call(FILES, "Keep", &(paths,)).await
}

pub async fn free(paths: &[String]) -> Result<(), String> {
    call(FILES, "Free", &(paths,)).await
}

pub async fn share_link(path: &str) -> Result<String, String> {
    call(FILES, "ShareLink", &(path,)).await
}

pub async fn web_address(path: &str) -> Result<String, String> {
    call(FILES, "WebAddress", &(path,)).await
}

pub async fn dismiss_conflict(account: &str, copy: &str) -> Result<(), String> {
    call(FILES, "DismissConflict", &(account, copy)).await
}

/// The service's signals, as they arrive. Ends when the session bus goes.
pub async fn signals() -> Result<impl Stream<Item = Signal>, String> {
    let messages = objects::signals(session().await?, NAME, PATH).await?;
    Ok(messages.filter_map(|message| async move {
        let message = message.ok()?;
        let header = message.header();
        match header.member().map(|member| member.as_str()) {
            Some("Changed") => Some(Signal::Accounts),
            Some("DrivesChanged") => Some(Signal::Drives),
            Some("SignInStep") => {
                let (session, step) = message.body().deserialize::<(String, String)>().ok()?;
                let step = serde_json::from_str(&step).ok()?;
                Some(Signal::Step { session, step })
            }
            _ => None,
        }
    }))
}
