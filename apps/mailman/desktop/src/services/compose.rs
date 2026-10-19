use base64::Engine;
use base64::engine::general_purpose::STANDARD;
use luft_app::launch;
use serde::Serialize;
use serde_json::json;

use crate::mail::compose::{self, Draft, Sender};
use crate::mail::envelope::{Address, Unsubscribe};
use crate::mail::render;
use crate::state::MailmanState;
use crate::store::{Identity, Outgoing, Role, now};
use crate::sync::{Operation, Target};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Queued {
    id: i64,
    send_at: i64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub enum Unsubscribed {
    Done,
    Opened,
}

fn is_address(address: &str) -> bool {
    address.rsplit_once('@').is_some_and(|(local, domain)| {
        !local.is_empty()
            && !local.starts_with('*')
            && domain.contains('.')
            && !address
                .contains(|character: char| character.is_whitespace() || "<>,;".contains(character))
    })
}

fn covers(identity: &Identity, address: &str) -> bool {
    match identity.address.strip_prefix("*@") {
        Some(domain) => address
            .rsplit_once('@')
            .is_some_and(|(_, at)| at.eq_ignore_ascii_case(domain)),
        None => identity.address == address,
    }
}

fn sender(state: &MailmanState, draft: &Draft) -> Result<Sender, String> {
    let account = state
        .store
        .account(draft.account)?
        .ok_or("That account is gone")?;
    let identity = state
        .store
        .identity(draft.identity)?
        .filter(|identity| identity.account == account.id)
        .ok_or("That address can't send from this account")?;
    let address = draft
        .from
        .as_deref()
        .map(str::trim)
        .filter(|from| !from.is_empty())
        .map_or_else(|| identity.address.clone(), str::to_lowercase);
    if !is_address(&address) {
        return Err("Pick the address to send from".into());
    }
    let own = state
        .store
        .identities()?
        .iter()
        .any(|candidate| candidate.account == account.id && covers(candidate, &address));
    if !own && !account.custom_from {
        return Err("This account only sends from its own addresses".into());
    }
    Ok(Sender {
        from: Address {
            name: identity.name,
            address,
        },
        reply_to: identity.reply_to,
        on_behalf_of: (!own).then_some(account.email),
    })
}

pub fn send(state: &MailmanState, draft: Draft) -> Result<Queued, String> {
    if draft.to.is_empty() && draft.cc.is_empty() && draft.bcc.is_empty() {
        return Err("Add someone to send this to".into());
    }
    let sender = sender(state, &draft)?;
    let built = compose::build(&draft, &sender)?;
    let send_at = draft
        .send_at
        .unwrap_or_else(|| now() + state.store.settings().undo_seconds);
    let remind_at = draft.remind_after.map(|after| send_at + after);
    let saved = serde_json::to_value(&draft).map_err(|error| error.to_string())?;
    let outgoing = Outgoing {
        id: 0,
        account: draft.account,
        raw: built.raw,
        sender: sender.from.address,
        recipients: built.recipients,
        remind_at,
    };
    let id = state.store.queue_outgoing(&outgoing, &saved, send_at)?;
    let recipients: Vec<Address> = draft
        .to
        .iter()
        .chain(&draft.cc)
        .chain(&draft.bcc)
        .cloned()
        .collect();
    state.store.meet(&recipients)?;
    state.engine.wake_outbox();
    Ok(Queued { id, send_at })
}

pub fn save_draft(state: &MailmanState, draft: Draft, replaces: Option<i64>) -> Result<(), String> {
    let built = compose::build(&draft, &sender(state, &draft)?)?;
    let drafts = state
        .store
        .mailbox_with_role(draft.account, Role::Drafts)?
        .ok_or("This account has no Drafts folder")?;
    state.engine.queue(
        draft.account,
        &Operation::Append {
            mailbox: drafts.id,
            raw: STANDARD.encode(&built.raw),
            draft: true,
        },
    )?;
    if let Some(previous) = replaces.and_then(|id| state.store.locate(&[id]).ok()?.pop()) {
        state.store.forget(&[previous.id])?;
        state.engine.queue(
            previous.account,
            &Operation::Destroy {
                mailbox: previous.mailbox,
                messages: vec![Target {
                    id: previous.id,
                    remote: previous.remote,
                }],
            },
        )?;
    }
    state.engine.sync_mailbox(draft.account, drafts.id);
    Ok(())
}

pub fn reopen(state: &MailmanState, id: i64) -> Result<serde_json::Value, String> {
    let message = state.store.message(id)?.ok_or("That draft is gone")?;
    let raw = state
        .store
        .body(id)?
        .ok_or("This draft hasn't arrived yet")?;
    let parsed = render::parse(&raw).ok_or("That draft can't be read")?;
    let html = parsed
        .body_html(0)
        .map(|html| html.into_owned())
        .unwrap_or_default();
    let text = parsed
        .body_text(0)
        .map(|text| text.into_owned())
        .unwrap_or_default();
    Ok(json!({
        "account": message.account,
        "from": message.sender,
        "recipients": message.recipients,
        "subject": message.subject,
        "html": html,
        "text": text,
    }))
}

pub fn unsubscribe(
    state: &MailmanState,
    id: i64,
    token: Option<&str>,
) -> Result<Unsubscribed, String> {
    let message = state.store.message(id)?.ok_or("That message is gone")?;
    let unsubscribe: Unsubscribe = message
        .unsubscribe
        .and_then(|value| serde_json::from_value(value).ok())
        .ok_or("This sender doesn't offer a way to unsubscribe")?;
    if let (true, Some(url)) = (unsubscribe.one_click, &unsubscribe.http) {
        ureq::post(url)
            .content_type("application/x-www-form-urlencoded")
            .send("List-Unsubscribe=One-Click")
            .map_err(|error| format!("Unsubscribing failed: {error}"))?;
        return Ok(Unsubscribed::Done);
    }
    if let Some(mailto) = &unsubscribe.mailto {
        let url = url::Url::parse(mailto).map_err(|error| error.to_string())?;
        let subject = url
            .query_pairs()
            .find(|(key, _)| key.eq_ignore_ascii_case("subject"))
            .map(|(_, value)| value.into_owned());
        let body = url
            .query_pairs()
            .find(|(key, _)| key.eq_ignore_ascii_case("body"))
            .map(|(_, value)| value.into_owned());
        let identity = state
            .store
            .preferred_identity(message.account)?
            .ok_or("This account has no address to send from")?;
        let draft = Draft {
            account: message.account,
            identity: identity.id,
            from: None,
            to: vec![Address {
                name: String::new(),
                address: url.path().to_owned(),
            }],
            cc: Vec::new(),
            bcc: Vec::new(),
            subject: subject.unwrap_or_else(|| "unsubscribe".into()),
            html: String::new(),
            text: body.unwrap_or_else(|| "unsubscribe".into()),
            attachments: Vec::new(),
            in_reply_to: None,
            references: Vec::new(),
            send_at: Some(now()),
            remind_after: None,
        };
        send(state, draft)?;
        return Ok(Unsubscribed::Done);
    }
    let url = unsubscribe
        .http
        .ok_or("This sender doesn't offer a way to unsubscribe")?;
    launch::open_web_link(&url, token)?;
    Ok(Unsubscribed::Opened)
}
