use anyhow::{Context, Result, bail};
use luft_accounts::types::{Answer, Phone, Provider, Step};
use serde_json::{Map, Value, json};

use super::Flow;
use crate::accounts::{self, NewAccount};
use crate::rclone::Question;
use crate::store::Secret;

const BACKEND: &str = "iclouddrive";
const DEVICE_CODE: &str = "config_2fa";
const TEXTED_CODE: &str = "config_2fa_sms";
const PHONE: &str = "config_2fa_phone";
const ASK_FOR_TEXT: &str = "sms";
const WAITING_FOR_APPROVAL: &str = "waiting for device approval";
const DEVICE_PROMPT: &str = "Enter the code shown on your iPhone, iPad or Mac.";
const WRONG_CODE: &str = "That code didn't work. Check it, or wait for a new one.";
const WRONG_TEXTED_CODE: &str = "That code didn't work. Try again to get a new one.";

pub async fn run(flow: &mut Flow) -> Result<String> {
    let (apple_id, password) = identity(flow).await?;
    let remote = format!("signin{}", flow.session);
    let outcome = converse(flow, &remote, &apple_id, &password).await;
    let _ = flow.hub.rclone.forget_remote(&remote).await;
    let secret = outcome?;
    accounts::add(
        &flow.hub,
        NewAccount {
            provider: Provider::Icloud,
            user: apple_id.to_lowercase(),
            server: None,
            options: Default::default(),
            secret,
        },
        flow.account.clone(),
    )
    .await
}

async fn identity(flow: &Flow) -> Result<(String, String)> {
    let typed_user = flow
        .credentials
        .user
        .clone()
        .filter(|user| !user.trim().is_empty());
    let typed_password = flow
        .credentials
        .password
        .clone()
        .filter(|password| !password.is_empty());
    if let Some(account) = &flow.account {
        let user = flow
            .hub
            .records()
            .get(account)
            .map(|record| record.user.clone());
        let saved = match flow.hub.keyring.load(account).await? {
            Some(Secret::Apple { password, .. }) => Some(password),
            _ => None,
        };
        if let (Some(user), Some(password)) = (user, typed_password.clone().or(saved)) {
            return Ok((user, password));
        }
    }
    match (typed_user, typed_password) {
        (Some(user), Some(password)) => Ok((user.trim().to_owned(), password)),
        _ => bail!("Enter your Apple Account email and password"),
    }
}

async fn converse(flow: &mut Flow, remote: &str, apple_id: &str, password: &str) -> Result<Secret> {
    let rclone = flow.hub.rclone.clone();
    let mut parameters = Map::new();
    parameters.insert("apple_id".into(), Value::String(apple_id.to_owned()));
    parameters.insert("password".into(), Value::String(password.to_owned()));
    let mut question = rclone
        .configure(
            remote,
            BACKEND,
            parameters,
            json!({"obscure": true, "nonInteractive": true}),
        )
        .await?;
    let mut wrong = false;
    while !question.state.is_empty() {
        let (step, choices) = step_for(&question, wrong)?;
        flow.show(step).await;
        let result = match flow.answer().await? {
            Answer::Code { code } => code.chars().filter(char::is_ascii_digit).collect(),
            Answer::Text => ASK_FOR_TEXT.to_owned(),
            Answer::Phone { id } if choices.contains(&id) => id,
            Answer::Phone { .. } => bail!("That phone number isn't on this Apple Account"),
        };
        flow.show(Step::Working).await;
        match rclone
            .continue_configuring(remote, &question.state, &result)
            .await
        {
            Ok(next) => {
                wrong = !next.error.is_empty();
                if !wrong {
                    question = next;
                }
            }
            Err(error)
                if question.state == "2fa_do" && error.to_string().contains("validate2FACode") =>
            {
                wrong = true
            }
            Err(error) if error.to_string().contains("validateSMSCode") => bail!(WRONG_TEXTED_CODE),
            Err(error) => return Err(error),
        }
    }
    open_drive(flow, remote).await?;
    let live = rclone.remote(remote).await?;
    let field = |key: &str| {
        live.get(key)
            .and_then(Value::as_str)
            .unwrap_or_default()
            .to_owned()
    };
    let trust_token = field("trust_token");
    if trust_token.is_empty() {
        bail!("Apple didn't confirm this computer. Try again.");
    }
    Ok(Secret::Apple {
        password: password.to_owned(),
        trust_token,
        cookies: field("cookies"),
    })
}

fn step_for(question: &Question, wrong: bool) -> Result<(Step, Vec<String>)> {
    let option = question
        .option
        .as_ref()
        .context("Apple asked for something Luft doesn't know")?;
    let step = match option.name.as_str() {
        DEVICE_CODE => Step::Code {
            prompt: if wrong { WRONG_CODE } else { DEVICE_PROMPT }.to_owned(),
            texted: false,
        },
        TEXTED_CODE => Step::Code {
            prompt: if wrong {
                WRONG_CODE.to_owned()
            } else {
                option
                    .help
                    .replace("verification code", "code")
                    .trim()
                    .to_owned()
                    + "."
            },
            texted: true,
        },
        PHONE => {
            let phones: Vec<Phone> = option
                .examples
                .iter()
                .flatten()
                .map(|example| Phone {
                    id: example.value.clone(),
                    number: example.help.clone(),
                })
                .collect();
            let choices = phones.iter().map(|phone| phone.id.clone()).collect();
            return Ok((Step::Phones { phones }, choices));
        }
        other => bail!("Apple asked for something Luft doesn't know ({other})"),
    };
    Ok((step, Vec::new()))
}

async fn open_drive(flow: &Flow, remote: &str) -> Result<()> {
    let mut logs = flow.hub.rclone.logs();
    let hub = flow.hub.clone();
    let session = flow.session.clone();
    let approval = tokio::spawn(async move {
        while let Ok(line) = logs.recv().await {
            if line.contains(WAITING_FOR_APPROVAL) {
                super::set(&hub, &session, Step::Approve).await;
                return;
            }
        }
    });
    let opened = flow.hub.rclone.list_top(&format!("{remote}:")).await;
    approval.abort();
    opened
}
