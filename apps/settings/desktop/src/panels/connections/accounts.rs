use std::sync::Once;

use luft_accounts::client::{self, Signal};
use luft_accounts::types::{Account, Answer, Credentials, Drive, Provider};
use luft_app::{Commands, Events};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};

const CHANGED: &str = "accounts.changed";
const STEP: &str = "accounts.step";

static WATCH: Once = Once::new();

#[derive(Serialize)]
struct Snapshot {
    accounts: Vec<Account>,
    drives: Vec<Drive>,
}

#[derive(Deserialize)]
struct SignIn {
    provider: Provider,
    credentials: Credentials,
}

#[derive(Deserialize)]
struct SignInAgain {
    account: String,
    credentials: Credentials,
}

#[derive(Deserialize)]
struct Session {
    session: String,
}

#[derive(Deserialize)]
struct Answering {
    session: String,
    answer: Answer,
}

#[derive(Deserialize)]
struct Rename {
    account: String,
    name: String,
}

#[derive(Deserialize)]
struct Target {
    account: String,
}

#[derive(Deserialize)]
struct Address {
    url: String,
}

fn snapshot() -> Result<Snapshot, String> {
    Ok(Snapshot {
        accounts: client::accounts()?,
        drives: client::drives()?,
    })
}

fn watch(events: Events) {
    client::watch(move |signal| match signal {
        Signal::Accounts | Signal::Drives => {
            if let Ok(snapshot) = snapshot() {
                events.emit(CHANGED, snapshot);
            }
        }
        Signal::Step { session, step } => {
            events.emit(STEP, json!({"session": session, "step": step}));
        }
    });
}

fn accounts(events: &Events, _: Value) -> Result<Snapshot, String> {
    let snapshot = snapshot()?;
    let events = events.clone();
    WATCH.call_once(|| watch(events));
    Ok(snapshot)
}

fn open(Address { url }: Address) -> Result<(), String> {
    if !url.starts_with("https://") && !url.starts_with("http://") {
        return Err("That isn't a web address".to_owned());
    }
    gio::AppInfo::launch_default_for_uri(&url, gio::AppLaunchContext::NONE).map_err(|error| error.to_string())
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .with("accounts", events, accounts)
        .command("accounts_sign_in", |SignIn { provider, credentials }| client::sign_in(provider, &credentials))
        .command("accounts_sign_in_again", |SignInAgain { account, credentials }| {
            client::sign_in_again(&account, &credentials)
        })
        .command("accounts_step", |Session { session }| client::step(&session))
        .command("accounts_answer", |Answering { session, answer }| client::answer(&session, &answer))
        .command("accounts_cancel", |Session { session }| client::cancel(&session))
        .command("accounts_rename", |Rename { account, name }| client::rename(&account, &name))
        .command("accounts_remove", |Target { account }| client::remove(&account))
        .command("accounts_open", open)
}
