use std::path::Path;

use anyhow::{Context, Result, bail};
use luft_accounts::types::Provider;
use serde_json::Value;

use super::{locate, remote};
use crate::hub::Hub;
use crate::providers::{dropbox, nextcloud, onedrive, trouble};
use crate::store::{Record, Secret};

pub async fn share_link(hub: &Hub, path: &Path) -> Result<String> {
    let located = locate(hub, path)?;
    let record = &located.record;
    let relative = located.relative;
    let link = match record.provider {
        Provider::Onedrive | Provider::Dropbox => {
            hub.rclone.public_link(&remote(&record.id), &relative).await
        }
        Provider::Nextcloud => {
            let password = password(hub, record).await?;
            let server = record
                .server
                .clone()
                .context("This account has no server")?;
            let user = record.user.clone();
            tokio::task::spawn_blocking(move || {
                nextcloud::share_link(&server, &user, &password, &relative)
            })
            .await?
        }
        Provider::Icloud | Provider::Webdav => {
            bail!("{} doesn't make share links", record.provider.name())
        }
    };
    link.map_err(|error| anyhow::anyhow!(trouble::explain(record.provider, &error.to_string())))
}

pub async fn web_address(hub: &Hub, path: &Path) -> Result<String> {
    let located = locate(hub, path)?;
    let record = &located.record;
    let relative = located.relative;
    let folder = path.is_dir();
    match record.provider {
        Provider::Onedrive => {
            let access = access_token(hub, record).await?;
            tokio::task::spawn_blocking(move || onedrive::web_address(&access, &relative)).await?
        }
        Provider::Dropbox => Ok(dropbox::web_address(&relative, folder)),
        Provider::Nextcloud => {
            let server = record
                .server
                .as_deref()
                .context("This account has no server")?;
            Ok(nextcloud::web_address(server, &relative, folder))
        }
        Provider::Icloud | Provider::Webdav => {
            bail!("{} has no page for this", record.provider.name())
        }
    }
}

async fn password(hub: &Hub, record: &Record) -> Result<String> {
    match hub.keyring.load(&record.id).await? {
        Some(Secret::Password { password }) => Ok(password),
        _ => bail!("Sign in to {} again", record.name),
    }
}

async fn access_token(hub: &Hub, record: &Record) -> Result<String> {
    hub.rclone.about(&remote(&record.id)).await?;
    let live = hub.rclone.remote(&record.id).await?;
    let token = live
        .get("token")
        .and_then(Value::as_str)
        .context("This account isn't signed in")?;
    let token: Value = serde_json::from_str(token)?;
    Ok(token["access_token"]
        .as_str()
        .context("This account isn't signed in")?
        .to_owned())
}
