use std::collections::BTreeMap;

use anyhow::Result;
use luft_accounts::types::{Provider, Step};

use super::Flow;
use crate::accounts::{self, NewAccount};
use crate::providers::{apps, dropbox, oauth, onedrive};
use crate::store::Secret;

pub async fn run(flow: &mut Flow) -> Result<String> {
    let app = match flow.provider {
        Provider::Dropbox => &apps::DROPBOX,
        _ => &apps::ONEDRIVE,
    };
    let pending = oauth::begin(app).await?;
    flow.show(Step::Browser {
        url: pending.url.clone(),
    })
    .await;
    let tokens = pending.finish().await?;
    flow.show(Step::Working).await;
    let provider = flow.provider;
    let access = tokens.access.clone();
    let (user, options) =
        tokio::task::spawn_blocking(move || -> Result<(String, BTreeMap<String, String>)> {
            match provider {
                Provider::Dropbox => Ok((dropbox::email(&access)?, BTreeMap::new())),
                _ => {
                    let drive = onedrive::drive(&access)?;
                    let user = tokens
                        .claims
                        .email
                        .or(tokens.claims.preferred_username)
                        .or(tokens.claims.name)
                        .unwrap_or_else(|| "OneDrive".to_owned());
                    let options = BTreeMap::from([
                        ("drive_id".to_owned(), drive.id),
                        ("drive_type".to_owned(), drive.drive_type),
                    ]);
                    Ok((user, options))
                }
            }
        })
        .await??;
    accounts::add(
        &flow.hub,
        NewAccount {
            provider,
            user: user.to_lowercase(),
            server: None,
            options,
            secret: Secret::Token {
                token: tokens.rclone,
            },
        },
        flow.account.clone(),
    )
    .await
}
