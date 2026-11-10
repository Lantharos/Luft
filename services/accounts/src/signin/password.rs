use std::collections::BTreeMap;
use std::time::Duration;

use anyhow::{Context, Result, bail};
use luft_accounts::types::{Provider, Step};
use serde_json::{Map, Value, json};
use zeroize::Zeroizing;

use super::Flow;
use crate::accounts::{self, NewAccount};
use crate::providers::nextcloud;
use crate::store::Secret;

const POLL: Duration = Duration::from_secs(2);
const LOGIN_TIMEOUT: Duration = Duration::from_secs(20 * 60);

pub async fn run(flow: &mut Flow) -> Result<String> {
    let user = flow.user.as_deref().unwrap_or_default().trim().to_owned();
    let password = flow.password.clone().unwrap_or_default();
    if user.is_empty() || password.is_empty() {
        bail!("Enter the user name and password");
    }
    let server = nextcloud::server_address(flow.server.as_deref().unwrap_or_default())?;
    finish(flow, server, user, password).await
}

pub async fn nextcloud_login(flow: &mut Flow) -> Result<String> {
    let server = nextcloud::server_address(flow.server.as_deref().unwrap_or_default())?;
    let login = {
        let server = server.clone();
        tokio::task::spawn_blocking(move || nextcloud::start_login(&server)).await??
    };
    flow.show(Step::Browser {
        url: login.url.clone(),
    })
    .await;
    let login = std::sync::Arc::new(login);
    let granted = tokio::time::timeout(LOGIN_TIMEOUT, async {
        loop {
            tokio::time::sleep(POLL).await;
            let login = login.clone();
            if let Some(granted) = tokio::task::spawn_blocking(move || login.poll()).await?? {
                return anyhow::Ok(granted);
            }
        }
    })
    .await
    .context("Signing in took too long. Try again.")??;
    flow.show(Step::Working).await;
    let server = granted.server(server);
    finish(flow, server, granted.login_name, granted.app_password).await
}

async fn finish(
    flow: &mut Flow,
    server: String,
    user: String,
    password: Zeroizing<String>,
) -> Result<String> {
    let nextcloud = flow.provider == Provider::Nextcloud;
    let url = if nextcloud {
        nextcloud::files_address(&server, &user)
    } else {
        server.clone()
    };
    let options = BTreeMap::from([
        ("url".to_owned(), url),
        (
            "vendor".to_owned(),
            if nextcloud { "nextcloud" } else { "other" }.to_owned(),
        ),
        ("user".to_owned(), user.clone()),
    ]);
    let secret = Secret::Password { password };
    verify(flow, &options, &secret).await?;
    accounts::add(
        &flow.hub,
        NewAccount {
            provider: flow.provider,
            user,
            server: Some(server),
            options,
            secret,
        },
        flow.account.clone(),
    )
    .await
}

async fn verify(flow: &Flow, options: &BTreeMap<String, String>, secret: &Secret) -> Result<()> {
    let rclone = &flow.hub.rclone;
    let remote = rclone.temporary(format!("check{}", flow.session));
    let mut parameters: Map<String, Value> = options
        .iter()
        .map(|(key, value)| (key.clone(), value.clone().into()))
        .collect();
    parameters.extend(secret.parameters());
    rclone
        .configure(
            &remote.name,
            "webdav",
            parameters,
            json!({"obscure": true, "nonInteractive": true}),
        )
        .await?;
    rclone.list_top(&format!("{}:", remote.name)).await
}
