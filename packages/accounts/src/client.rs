use std::collections::BTreeMap;

use luft_dbus::session;
use serde::Serialize;
use serde::de::DeserializeOwned;
use zbus::blocking::{MessageIterator, Proxy};
use zbus::message::Type as MessageType;

use crate::types::{Account, Answer, Credentials, Drive, FileState, Provider, Step};

pub const NAME: &str = "com.lantharos.Accounts1";
pub const PATH: &str = "/com/lantharos/Accounts1";
const ACCOUNTS: &str = "com.lantharos.Accounts1";
const FILES: &str = "com.lantharos.Accounts1.Files";

pub enum Signal {
    Accounts,
    Drives,
    Step { session: String, step: Step },
}

fn explain(error: zbus::Error) -> String {
    match error {
        zbus::Error::MethodError(_, Some(message), _) => message,
        error => error.to_string(),
    }
}

fn proxy(interface: &'static str) -> Result<Proxy<'static>, String> {
    zbus::blocking::proxy::Builder::new(session()?)
        .destination(NAME)
        .and_then(|builder| builder.path(PATH))
        .and_then(|builder| builder.interface(interface))
        .map(|builder| builder.cache_properties(zbus::proxy::CacheProperties::No))
        .and_then(|builder| builder.build())
        .map_err(explain)
}

fn call<B, R>(interface: &'static str, method: &str, body: &B) -> Result<R, String>
where
    B: Serialize + zbus::zvariant::DynamicType,
    R: DeserializeOwned + zbus::zvariant::Type,
{
    proxy(interface)?.call(method, body).map_err(explain)
}

fn call_json<B, R>(interface: &'static str, method: &str, body: &B) -> Result<R, String>
where
    B: Serialize + zbus::zvariant::DynamicType,
    R: DeserializeOwned,
{
    let text: String = call(interface, method, body)?;
    serde_json::from_str(&text).map_err(|error| error.to_string())
}

fn json(value: &impl Serialize) -> String {
    serde_json::to_string(value).expect("requests always serialize")
}

pub fn accounts() -> Result<Vec<Account>, String> {
    call_json(ACCOUNTS, "Accounts", &())
}

pub fn sign_in(provider: Provider, credentials: &Credentials) -> Result<String, String> {
    let provider = json(&provider);
    call(ACCOUNTS, "SignIn", &(provider.trim_matches('"'), json(credentials)))
}

pub fn sign_in_again(account: &str, credentials: &Credentials) -> Result<String, String> {
    call(ACCOUNTS, "SignInAgain", &(account, json(credentials)))
}

pub fn step(session: &str) -> Result<Step, String> {
    call_json(ACCOUNTS, "Step", &(session,))
}

pub fn answer(session: &str, answer: &Answer) -> Result<(), String> {
    call(ACCOUNTS, "Answer", &(session, json(answer)))
}

pub fn cancel(session: &str) -> Result<(), String> {
    call(ACCOUNTS, "Cancel", &(session,))
}

pub fn rename(account: &str, name: &str) -> Result<(), String> {
    call(ACCOUNTS, "Rename", &(account, name))
}

pub fn remove(account: &str) -> Result<(), String> {
    call(ACCOUNTS, "Remove", &(account,))
}

pub fn drives() -> Result<Vec<Drive>, String> {
    call_json(FILES, "Drives", &())
}

pub fn states(folder: &str) -> Result<BTreeMap<String, FileState>, String> {
    call_json(FILES, "States", &(folder,))
}

pub fn keep(paths: &[String]) -> Result<(), String> {
    call(FILES, "Keep", &(paths,))
}

pub fn free(paths: &[String]) -> Result<(), String> {
    call(FILES, "Free", &(paths,))
}

pub fn share_link(path: &str) -> Result<String, String> {
    call(FILES, "ShareLink", &(path,))
}

pub fn web_address(path: &str) -> Result<String, String> {
    call(FILES, "WebAddress", &(path,))
}

pub fn dismiss_conflict(account: &str, copy: &str) -> Result<(), String> {
    call(FILES, "DismissConflict", &(account, copy))
}

pub fn watch(mut receive: impl FnMut(Signal) + Send + 'static) {
    std::thread::spawn(move || {
        let Ok(session) = session() else { return };
        let Ok(rule) = zbus::MatchRule::builder()
            .msg_type(MessageType::Signal)
            .sender(NAME)
            .and_then(|rule| rule.path(PATH))
            .map(|rule| rule.build())
        else {
            return;
        };
        let Ok(messages) = MessageIterator::for_match_rule(rule, session, None) else {
            return;
        };
        for message in messages.flatten() {
            let header = message.header();
            let signal = match header.member().map(|member| member.as_str()) {
                Some("Changed") => Signal::Accounts,
                Some("DrivesChanged") => Signal::Drives,
                Some("SignInStep") => {
                    let Ok((session, step)) = message.body().deserialize::<(String, String)>() else {
                        continue;
                    };
                    let Ok(step) = serde_json::from_str(&step) else { continue };
                    Signal::Step { session, step }
                }
                _ => continue,
            };
            receive(signal);
        }
    });
}
