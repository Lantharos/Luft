mod icloud;
mod oauth;
mod password;

use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::Duration;

use anyhow::{Result, anyhow, bail};
use luft_accounts::types::{Answer, Credentials, Provider, Step};
use tokio::sync::mpsc;
use tokio::task::AbortHandle;

use crate::hub::Hub;
use crate::providers::trouble;
use crate::store::new_id;

const FORGET_AFTER: Duration = Duration::from_secs(5 * 60);

struct Session {
    step: Step,
    answers: mpsc::UnboundedSender<Answer>,
    task: Option<AbortHandle>,
    browser: bool,
}

#[derive(Default)]
pub struct SignIns {
    sessions: Mutex<HashMap<String, Session>>,
}

pub struct Flow {
    pub hub: Arc<Hub>,
    pub session: String,
    pub provider: Provider,
    pub credentials: Credentials,
    pub account: Option<String>,
    answers: mpsc::UnboundedReceiver<Answer>,
}

impl Flow {
    pub async fn show(&self, step: Step) {
        set(&self.hub, &self.session, step).await;
    }

    pub async fn answer(&mut self) -> Result<Answer> {
        self.answers
            .recv()
            .await
            .ok_or_else(|| anyhow!("Signing in was stopped"))
    }
}

impl SignIns {
    fn sessions(&self) -> std::sync::MutexGuard<'_, HashMap<String, Session>> {
        self.sessions.lock().expect("sign-ins are never poisoned")
    }

    pub fn step(&self, session: &str) -> Option<Step> {
        self.sessions()
            .get(session)
            .map(|session| session.step.clone())
    }

    pub fn answer(&self, session: &str, answer: Answer) -> Result<()> {
        let sessions = self.sessions();
        let session = sessions
            .get(session)
            .ok_or_else(|| anyhow!("That sign-in has ended"))?;
        session
            .answers
            .send(answer)
            .map_err(|_| anyhow!("That sign-in has ended"))
    }

    pub fn cancel(&self, session: &str) {
        if let Some(task) = self
            .sessions()
            .remove(session)
            .and_then(|session| session.task)
        {
            task.abort();
        }
    }

    pub fn in_progress(&self) -> bool {
        self.sessions()
            .values()
            .any(|session| !session.step.finished())
    }

    fn cancel_browser_sign_ins(&self) {
        self.sessions().retain(|_, session| {
            if session.browser && !session.step.finished() {
                if let Some(task) = &session.task {
                    task.abort();
                }
                return false;
            }
            true
        });
    }
}

fn uses_browser(provider: Provider, credentials: &Credentials) -> bool {
    match provider {
        Provider::Onedrive | Provider::Dropbox => true,
        Provider::Nextcloud => credentials.password.is_none(),
        Provider::Icloud | Provider::Webdav => false,
    }
}

pub async fn start(
    hub: &Arc<Hub>,
    provider: Provider,
    credentials: Credentials,
    account: Option<String>,
) -> Result<String> {
    if let Some(account) = &account
        && hub
            .records()
            .get(account)
            .is_none_or(|record| record.provider != provider)
    {
        bail!("That account isn't here anymore");
    }
    let browser = uses_browser(provider, &credentials);
    if browser {
        hub.signins.cancel_browser_sign_ins();
    }
    let session = new_id();
    let (answers_sender, answers) = mpsc::unbounded_channel();
    hub.signins.sessions().insert(
        session.clone(),
        Session {
            step: Step::Working,
            answers: answers_sender,
            task: None,
            browser,
        },
    );
    hub.demand.notify_one();
    let flow = Flow {
        hub: hub.clone(),
        session: session.clone(),
        provider,
        credentials,
        account,
        answers,
    };
    let task = tokio::spawn(run(flow)).abort_handle();
    if let Some(entry) = hub.signins.sessions().get_mut(&session) {
        entry.task = Some(task);
    }
    Ok(session)
}

async fn run(mut flow: Flow) {
    let hub = flow.hub.clone();
    let session = flow.session.clone();
    let provider = flow.provider;
    let outcome = match provider {
        Provider::Onedrive | Provider::Dropbox => oauth::run(&mut flow).await,
        Provider::Nextcloud if flow.credentials.password.is_none() => {
            password::nextcloud_login(&mut flow).await
        }
        Provider::Nextcloud | Provider::Webdav => password::run(&mut flow).await,
        Provider::Icloud => icloud::run(&mut flow).await,
    };
    let step = match outcome {
        Ok(account) => Step::Done { account },
        Err(error) => {
            eprintln!("Signing in to {} failed: {error:#}", provider.name());
            Step::Failed {
                message: trouble::explain_sign_in(provider, &format!("{error:#}")),
            }
        }
    };
    set(&hub, &session, step).await;
    tokio::time::sleep(FORGET_AFTER).await;
    hub.signins.sessions().remove(&session);
}

async fn set(hub: &Hub, session: &str, step: Step) {
    let known = hub
        .signins
        .sessions()
        .get_mut(session)
        .map(|entry| entry.step = step.clone())
        .is_some();
    if known {
        hub.step_changed(session, &step).await;
    }
}
