use luft_app::{Commands, Empty};
use sabine::SabineWindow;

use super::params::*;
use crate::accounts::{Account, Login, Secret, discover, oauth_sign_in};
use crate::state::MailmanState;
use crate::store::now;
use crate::sync::{Engine, Operation};

struct SignedIn {
    secret: Secret,
    login: Login,
    email: Option<String>,
    name: Option<String>,
}

fn sign_in(
    secret: NewSecret,
    username: &str,
    email: &str,
    token: Option<&str>,
) -> Result<SignedIn, String> {
    match secret {
        NewSecret::Password { password } => Ok(SignedIn {
            login: Login::Password {
                username: username.to_owned(),
                password: password.clone(),
            },
            secret: Secret::Password { password },
            email: None,
            name: None,
        }),
        NewSecret::OAuth { provider } => {
            let tokens = oauth_sign_in(provider, Some(email), token)?;
            let refresh = tokens
                .refresh
                .ok_or("The provider didn't allow staying signed in")?;
            Ok(SignedIn {
                login: Login::Bearer {
                    username: tokens.email.clone().unwrap_or_else(|| email.to_owned()),
                    token: tokens.access.clone(),
                    expires: tokens.expires,
                },
                secret: Secret::OAuth {
                    refresh,
                    access: tokens.access,
                    expires: tokens.expires,
                },
                email: tokens.email,
                name: tokens.name,
            })
        }
    }
}

fn add(state: &MailmanState, request: NewAccount) -> Result<Account, String> {
    let requested = request.email.trim().to_lowercase();
    let signed_in = sign_in(
        request.secret,
        &request.config.username,
        &requested,
        request.token.as_deref(),
    )?;
    let email = signed_in.email.unwrap_or(requested);
    let mut name = request.name.trim().to_owned();
    if name.is_empty() {
        name = signed_in.name.unwrap_or_default();
    }
    let mut config = request.config;
    if config.oauth.is_some() {
        config.username = email.clone();
    }
    let candidate = Account {
        id: 0,
        email: email.clone(),
        name: name.clone(),
        custom_from: false,
        config: config.clone(),
        added: now(),
    };
    Engine::verify(&candidate, signed_in.login)?;
    let account = state.store.add_account(
        &email,
        if name.is_empty() { &email } else { &name },
        &config,
    )?;
    if let Err(error) = state.credentials.save(account.id, signed_in.secret) {
        state.store.remove_account(account.id)?;
        return Err(error);
    }
    state.engine.add(account.clone());
    Ok(account)
}

fn sign_in_again(state: &MailmanState, request: SignInAgain) -> Result<(), String> {
    let account = state
        .store
        .account(request.id)?
        .ok_or("This account is gone")?;
    let signed_in = sign_in(
        request.secret,
        &account.config.username,
        &account.email,
        request.token.as_deref(),
    )?;
    if signed_in.email.is_some_and(|email| email != account.email) {
        return Err(format!("Sign in as {} to use this account", account.email));
    }
    Engine::verify(&account, signed_in.login)?;
    state.credentials.save(account.id, signed_in.secret)?;
    state.engine.reconnect(account.id);
    Ok(())
}

fn remove(state: &MailmanState, Id { id }: Id) -> Result<(), String> {
    state.engine.remove(id);
    state.credentials.forget(id);
    state.store.remove_account(id)
}

pub fn register(window: SabineWindow, state: &MailmanState) -> SabineWindow {
    window
        .command("discover", |Email { email }| Ok(discover(&email)))
        .with("add_account", state, add)
        .with("sign_in_again", state, sign_in_again)
        .with("remove_account", state, remove)
        .with(
            "rename_account",
            state,
            |state, AccountUpdate { id, name }| state.store.rename_account(id, &name),
        )
        .with("identities", state, |state, Empty {}| {
            state.store.identities()
        })
        .with(
            "save_identity",
            state,
            |state, SavedIdentity { identity }| {
                let id = state.store.save_identity(&identity)?;
                state.engine.queue(
                    identity.account,
                    &Operation::Identity {
                        id,
                        remote: identity.remote,
                    },
                )?;
                Ok(id)
            },
        )
        .with("prefer_identity", state, |state, Id { id }| {
            state.store.prefer_identity(id)
        })
        .with("remove_identity", state, |state, Id { id }| {
            if let Some(removed) = state.store.remove_identity(id)? {
                state.engine.queue(
                    removed.account,
                    &Operation::Identity {
                        id,
                        remote: removed.remote,
                    },
                )?;
            }
            Ok(())
        })
        .with("accounts", state, |state, Empty {}| state.store.accounts())
        .with("mailboxes", state, |state, Empty {}| {
            state.store.mailboxes(None)
        })
        .with("sync_now", state, |state, Empty {}| {
            state.engine.refresh();
            Ok(())
        })
        .with("sync_mailbox", state, |state, Sync { account, mailbox }| {
            state.engine.sync_mailbox(account, mailbox);
            Ok(())
        })
}
