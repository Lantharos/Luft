use std::collections::BTreeMap;
use std::fs;
use std::sync::Arc;

use anyhow::{Context, Result};
use luft_accounts::types::Provider;

use crate::drives;
use crate::hub::Hub;
use crate::store::{Record, Secret, new_id};

pub struct NewAccount {
    pub provider: Provider,
    pub user: String,
    pub server: Option<String>,
    pub options: BTreeMap<String, String>,
    pub secret: Secret,
}

pub async fn add(hub: &Arc<Hub>, account: NewAccount, replacing: Option<String>) -> Result<String> {
    let existing = replacing.or_else(|| {
        hub.records()
            .all()
            .iter()
            .find(|record| {
                record.provider == account.provider
                    && record.user.eq_ignore_ascii_case(&account.user)
                    && record.server == account.server
            })
            .map(|record| record.id.clone())
    });
    let id = match existing {
        Some(id) => {
            hub.keyring.store(&id, &account.secret).await?;
            hub.records().edit(&id, |record| {
                record.user = account.user;
                record.options = account.options;
                record.sign_in_again = None;
            })?;
            id
        }
        None => {
            let id = new_id();
            hub.keyring.store(&id, &account.secret).await?;
            let name = hub.records().unique_name(account.provider.name(), None);
            hub.records().add(Record {
                id: id.clone(),
                provider: account.provider,
                name,
                user: account.user,
                server: account.server,
                options: account.options,
                kept: Vec::new(),
                skipped: Vec::new(),
                conflicts: Vec::new(),
                sign_in_again: None,
            })?;
            id
        }
    };
    hub.accounts_changed().await;
    let attaching = hub.clone();
    let account = id.clone();
    tokio::spawn(async move {
        if drives::attach(&attaching, &account).await.is_ok() {
            drives::report(
                &attaching,
                &account,
                drives::sync(&attaching, &account, false).await,
            )
            .await;
        }
    });
    Ok(id)
}

pub async fn rename(hub: &Arc<Hub>, id: &str, wanted: &str) -> Result<()> {
    let record = hub
        .records()
        .get(id)
        .cloned()
        .context("That account isn't here anymore")?;
    let name = hub.records().unique_name(wanted, Some(id));
    if name == record.name {
        return Ok(());
    }
    drives::rename(hub, &record, &name).await?;
    hub.accounts_changed().await;
    Ok(())
}

pub async fn remove(hub: &Arc<Hub>, id: &str) -> Result<()> {
    let record = hub
        .records()
        .get(id)
        .cloned()
        .context("That account isn't here anymore")?;
    drives::report(hub, id, drives::sync(hub, id, true).await).await;
    drives::detach(hub, &record).await;
    hub.keyring.delete(id).await?;
    hub.records().remove(id)?;
    for leftover in [hub.paths.kept(id), hub.paths.bisync(id)] {
        let _ = fs::remove_dir_all(leftover);
    }
    let _ = fs::remove_file(hub.paths.filters(id));
    hub.accounts_changed().await;
    hub.drives_changed().await;
    Ok(())
}
