use std::collections::HashMap;

use ctap::Prompt;
use ctap::platform::Purpose;
use tokio::sync::mpsc;
use zbus::zvariant::{OwnedObjectPath, OwnedValue, Value};
use zbus::{Connection, Proxy};
use zeroize::Zeroizing;

const KESTREL: &str = "com.lantharos.Kestrel.Passkeys";
const PATH: &str = "/com/lantharos/Kestrel/Passkeys";
const PROMPTS: &str = "com.lantharos.Kestrel.Passkeys1";
const PROMPT: &str = "com.lantharos.Kestrel.Passkeys1.Prompt";

pub enum Action {
    Account(usize),
    Password(Zeroizing<String>),
    Confirm,
    Cancel,
}

pub enum Feedback<'a> {
    FingerprintHint(&'a str),
    FingerprintUnavailable,
    WrongPassword,
    Verified,
}

pub struct Window {
    proxy: Proxy<'static>,
    actions: mpsc::UnboundedReceiver<Action>,
}

fn purpose(purpose: Purpose) -> &'static str {
    match purpose {
        Purpose::Register => "register",
        Purpose::SignIn => "sign-in",
        Purpose::Manage => "manage",
        Purpose::AlreadyRegistered => "registered",
        Purpose::Choose => "choose",
    }
}

impl Window {
    pub async fn open(
        session: &Connection,
        prompt: &Prompt<'_>,
        requester: Option<u32>,
        fingerprint: Option<&str>,
    ) -> zbus::Result<Self> {
        let accounts: Vec<(&str, &str)> = prompt
            .accounts
            .iter()
            .map(|user| {
                (
                    user.name.as_deref().unwrap_or_default(),
                    user.display_name.as_deref().unwrap_or_default(),
                )
            })
            .collect();
        let mut details: HashMap<&str, Value<'_>> = HashMap::from([
            ("purpose", Value::from(purpose(prompt.purpose))),
            ("accounts", Value::from(accounts)),
        ]);
        details.extend(fingerprint.map(|hint| ("fingerprint", Value::from(hint))));
        details.extend(prompt.rp_id.map(|site| ("site", Value::from(site))));
        details.extend(prompt.rp_name.map(|name| ("site_name", Value::from(name))));
        details.extend(requester.map(|pid| ("requester", Value::from(pid))));
        let prompts = Proxy::new(session, KESTREL, PATH, PROMPTS).await?;
        let path: OwnedObjectPath = prompts.call("Open", &(details,)).await?;
        let proxy = Proxy::new(session, KESTREL, path, PROMPT).await?;
        let (sender, actions) = mpsc::unbounded_channel();
        tokio::spawn(pump(proxy.clone(), sender));
        Ok(Self { proxy, actions })
    }

    pub async fn next(&mut self) -> Action {
        self.actions.recv().await.unwrap_or(Action::Cancel)
    }

    pub async fn show(&self, feedback: Feedback<'_>) {
        let (state, message) = match feedback {
            Feedback::FingerprintHint(message) => ("fingerprint-hint", message),
            Feedback::FingerprintUnavailable => ("fingerprint-unavailable", ""),
            Feedback::WrongPassword => ("wrong-password", ""),
            Feedback::Verified => ("verified", ""),
        };
        let _ = self
            .proxy
            .call::<_, _, ()>("Update", &(state, message))
            .await;
    }
}

impl Drop for Window {
    fn drop(&mut self) {
        let proxy = self.proxy.clone();
        tokio::spawn(async move {
            let _ = proxy.call::<_, _, ()>("Close", &()).await;
        });
    }
}

async fn pump(proxy: Proxy<'static>, sender: mpsc::UnboundedSender<Action>) {
    loop {
        let action = match proxy
            .call::<_, _, (String, HashMap<String, OwnedValue>)>("Next", &())
            .await
        {
            Ok((kind, details)) => action(&kind, &details),
            Err(_) => Action::Cancel,
        };
        let finished = matches!(action, Action::Cancel);
        if sender.send(action).is_err() || finished {
            return;
        }
    }
}

fn action(kind: &str, details: &HashMap<String, OwnedValue>) -> Action {
    let value = |name: &str| details.get(name).and_then(|value| value.try_clone().ok());
    match kind {
        "account" => value("index")
            .and_then(|index| u32::try_from(index).ok())
            .map_or(Action::Cancel, |index| Action::Account(index as usize)),
        "password" => value("password")
            .and_then(|password| String::try_from(password).ok())
            .map_or(Action::Cancel, |password| {
                Action::Password(Zeroizing::new(password))
            }),
        "confirm" => Action::Confirm,
        _ => Action::Cancel,
    }
}
