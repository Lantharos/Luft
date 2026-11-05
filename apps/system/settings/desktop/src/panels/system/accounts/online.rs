use std::pin::pin;
use std::sync::Once;

use futures_util::StreamExt;
use luft_accounts::client::{self, Signal};
use luft_accounts::types::{Account, Answer, Credentials, Drive, Provider, Step};
use luft_app::{Commands, Empty, Events, launch};
use luft_i18n::t;
use sabine::{BridgeEvent, SabineWindow};
use serde::{Deserialize, Serialize};
use specta::Type;

use crate::L10N;

const CHANGED: BridgeEvent<AccountsSnapshot> = BridgeEvent::new("accounts.changed");
const STEP: BridgeEvent<StepUpdate> = BridgeEvent::new("accounts.step");

static WATCH: Once = Once::new();

#[derive(Serialize, Type)]
struct AccountsSnapshot {
    accounts: Vec<Account>,
    drives: Vec<Drive>,
}

#[derive(Serialize, Type)]
struct StepUpdate {
    session: String,
    step: Step,
}

#[derive(Deserialize, Type)]
struct SignIn {
    provider: Provider,
    credentials: Credentials,
}

#[derive(Deserialize, Type)]
struct SignInAgain {
    account: String,
    credentials: Credentials,
}

#[derive(Deserialize, Type)]
struct SignInSession {
    session: String,
}

#[derive(Deserialize, Type)]
struct Answering {
    session: String,
    answer: Answer,
}

#[derive(Deserialize, Type)]
struct AccountRename {
    account: String,
    name: String,
}

#[derive(Deserialize, Type)]
struct AccountTarget {
    account: String,
}

#[derive(Deserialize, Type)]
struct Address {
    url: String,
    token: Option<String>,
}

async fn snapshot() -> Result<AccountsSnapshot, String> {
    Ok(AccountsSnapshot {
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
                events.emit(STEP, StepUpdate { session, step });
            }
        }
    }
}

async fn accounts(events: Events, Empty {}: Empty) -> Result<AccountsSnapshot, String> {
    let snapshot = snapshot().await?;
    WATCH.call_once(|| {
        luft_app::spawn(watch(events));
    });
    Ok(snapshot)
}

fn open(Address { url, token }: Address) -> Result<(), String> {
    if !url.starts_with("https://") && !url.starts_with("http://") {
        return Err(t!(L10N, "desktop-accounts-not-web-address"));
    }
    launch::open(&url, token.as_deref()).map_err(|error| error.to_string())
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
        .bridge_event(&CHANGED)
        .bridge_event(&STEP)
        .with_async("accounts", events, accounts)
        .command_async("accounts_sign_in", sign_in)
        .command_async("accounts_sign_in_again", sign_in_again)
        .command_async("accounts_step", |SignInSession { session }| async move {
            client::step(&session).await
        })
        .command_async("accounts_answer", answer)
        .command_async("accounts_cancel", |SignInSession { session }| async move {
            client::cancel(&session).await
        })
        .command_async(
            "accounts_rename",
            |AccountRename { account, name }| async move { client::rename(&account, &name).await },
        )
        .command_async("accounts_remove", |AccountTarget { account }| async move {
            client::remove(&account).await
        })
        .command("accounts_open", open)
}
