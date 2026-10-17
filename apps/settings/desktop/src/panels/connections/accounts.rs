use std::pin::pin;
use std::sync::Once;

use futures_util::StreamExt;
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

async fn snapshot() -> Result<Snapshot, String> {
    Ok(Snapshot {
        accounts: client::accounts().await?,
        drives: client::drives().await?,
    })
}

async fn watch(events: Events) {
    let Ok(signals) = client::signals().await else {
        return;
    };
    let mut signals = pin!(signals);
    while let Some(signal) = signals.next().await {
        match signal {
            Signal::Accounts | Signal::Drives => {
                if let Ok(snapshot) = snapshot().await {
                    events.emit(CHANGED, snapshot);
                }
            }
            Signal::Step { session, step } => {
                events.emit(STEP, json!({"session": session, "step": step}));
            }
        }
    }
}

async fn accounts(events: Events, _: Value) -> Result<Snapshot, String> {
    let snapshot = snapshot().await?;
    WATCH.call_once(|| {
        luft_app::spawn(watch(events));
    });
    Ok(snapshot)
}

fn open(Address { url }: Address) -> Result<(), String> {
    if !url.starts_with("https://") && !url.starts_with("http://") {
        return Err("That isn't a web address".to_owned());
    }
    gio::AppInfo::launch_default_for_uri(&url, gio::AppLaunchContext::NONE)
        .map_err(|error| error.to_string())
}

async fn sign_in(
    SignIn {
        provider,
        credentials,
    }: SignIn,
) -> Result<String, String> {
    client::sign_in(provider, &credentials).await
}

async fn sign_in_again(
    SignInAgain {
        account,
        credentials,
    }: SignInAgain,
) -> Result<String, String> {
    client::sign_in_again(&account, &credentials).await
}

async fn answer(Answering { session, answer }: Answering) -> Result<(), String> {
    client::answer(&session, &answer).await
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .with_async("accounts", events, accounts)
        .command_async("accounts_sign_in", sign_in)
        .command_async("accounts_sign_in_again", sign_in_again)
        .command_async("accounts_step", |Session { session }| async move {
            client::step(&session).await
        })
        .command_async("accounts_answer", answer)
        .command_async("accounts_cancel", |Session { session }| async move {
            client::cancel(&session).await
        })
        .command_async("accounts_rename", |Rename { account, name }| async move {
            client::rename(&account, &name).await
        })
        .command_async("accounts_remove", |Target { account }| async move {
            client::remove(&account).await
        })
        .command("accounts_open", open)
}
