use std::collections::HashMap;
use std::sync::Arc;

use luft_app::secrets;
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};

use super::{Account, Login, oauth};
use crate::store::now;

const REFRESH_MARGIN: i64 = 120;

#[derive(Clone, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum Secret {
    Password {
        password: String,
    },
    OAuth {
        refresh: String,
        access: String,
        expires: i64,
    },
}

#[derive(Clone, Default)]
pub struct Credentials {
    cache: Arc<Mutex<HashMap<i64, Secret>>>,
    refreshing: Arc<Mutex<()>>,
}

fn key(account: i64) -> String {
    format!("account-{account}")
}

impl Credentials {
    pub fn save(&self, account: i64, secret: Secret) -> Result<(), String> {
        let encoded = serde_json::to_vec(&secret).map_err(|error| error.to_string())?;
        secrets::store(&key(account), &encoded)?;
        self.cache.lock().insert(account, secret);
        Ok(())
    }

    pub fn forget(&self, account: i64) {
        self.cache.lock().remove(&account);
        let _ = secrets::delete(&key(account));
    }

    pub fn renew(&self, account: &Account, rejected: &str) -> Result<Login, String> {
        if let Some(Secret::OAuth {
            access, expires, ..
        }) = self.cache.lock().get_mut(&account.id)
            && access == rejected
        {
            *expires = 0;
        }
        self.login(account)
    }

    pub fn login(&self, account: &Account) -> Result<Login, String> {
        if let Some(login) = self.current(account)? {
            return Ok(login);
        }
        let _refreshing = self.refreshing.lock();
        if let Some(login) = self.current(account)? {
            return Ok(login);
        }
        let Secret::OAuth { refresh, .. } = self.secret(account.id)? else {
            unreachable!("passwords are always current");
        };
        let provider = account
            .config
            .oauth
            .ok_or("This account has no sign-in provider")?;
        let tokens = oauth::refresh(provider, &refresh)?;
        let login = Login::Bearer {
            username: account.config.username.clone(),
            token: tokens.access.clone(),
            expires: tokens.expires,
        };
        self.save(
            account.id,
            Secret::OAuth {
                refresh: tokens.refresh.unwrap_or(refresh),
                access: tokens.access,
                expires: tokens.expires,
            },
        )?;
        Ok(login)
    }

    fn secret(&self, account: i64) -> Result<Secret, String> {
        if let Some(secret) = self.cache.lock().get(&account) {
            return Ok(secret.clone());
        }
        let stored = secrets::load(&key(account))?
            .ok_or("The password for this account is missing from the keyring")?;
        let secret: Secret = serde_json::from_slice(&stored).map_err(|error| error.to_string())?;
        self.cache.lock().insert(account, secret.clone());
        Ok(secret)
    }

    fn current(&self, account: &Account) -> Result<Option<Login>, String> {
        let username = account.config.username.clone();
        Ok(match self.secret(account.id)? {
            Secret::Password { password } => Some(Login::Password { username, password }),
            Secret::OAuth {
                access, expires, ..
            } if expires > now() + REFRESH_MARGIN => Some(Login::Bearer {
                username,
                token: access,
                expires,
            }),
            Secret::OAuth { .. } => None,
        })
    }
}
