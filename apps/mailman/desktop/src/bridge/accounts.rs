use luft_app::Commands;
use sabine::SabineWindow;

use super::params::*;
use crate::accounts::{Account, Login, Secret, discover, oauth_sign_in};
use crate::state::MailmanState;
use crate::store::now;
use crate::sync::{Engine, Operation};

fn add(state: &MailmanState, request: NewAccount) -> Result<Account, String> {
    let mut email = request.email.trim().to_lowercase();
    let mut name = request.name.trim().to_owned();
    let (secret, login) = match request.secret {
        NewSecret::Password { password } => {
            let login = Login::Password {
                username: request.config.username.clone(),
                password: password.clone(),
            };
            (Secret::Password { password }, login)
        }
        NewSecret::OAuth { provider } => {
            let tokens = oauth_sign_in(provider, Some(&email))?;
            email = tokens.email.unwrap_or(email);
            if name.is_empty() {
                name = tokens.name.unwrap_or_default();
            }
            let refresh = tokens
                .refresh
                .ok_or("The provider didn't allow staying signed in")?;
            let login = Login::Bearer {
                username: email.clone(),
                token: tokens.access.clone(),
                expires: tokens.expires,
            };
            (
                Secret::OAuth {
                    refresh,
                    access: tokens.access,
                    expires: tokens.expires,
                },
                login,
            )
        }
    };
    let mut config = request.config;
    if config.oauth.is_some() {
        config.username = email.clone();
    }
    let candidate = Account {
        id: 0,
        email: email.clone(),
        name: name.clone(),
        config: config.clone(),
        added: now(),
    };
    Engine::verify(&candidate, login)?;
    let account = state.store.add_account(
        &email,
        if name.is_empty() { &email } else { &name },
        &config,
    )?;
    if let Err(error) = state.credentials.save(account.id, secret) {
        state.store.remove_account(account.id)?;
        return Err(error);
    }
    state.engine.add(account.clone());
    Ok(account)
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
