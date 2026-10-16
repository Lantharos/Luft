use std::collections::BTreeMap;
use std::time::Duration;

use anyhow::{Context, Result, bail};
use luft_accounts::types::{Provider, Step};
use serde_json::{Map, Value, json};

use super::Flow;
use crate::accounts::{self, NewAccount};
use crate::providers::nextcloud;
use crate::store::Secret;

const POLL: Duration = Duration::from_secs(2);
const LOGIN_TIMEOUT: Duration = Duration::from_secs(20 * 60);

pub async fn run(flow: &mut Flow) -> Result<String> {
    let credentials = flow.credentials.clone();
    let typed = credentials.server.as_deref().unwrap_or_default();
    let user = credentials.user.unwrap_or_default().trim().to_owned();
    let password = credentials.password.unwrap_or_default();
    if user.is_empty() || password.is_empty() {
        bail!("Enter the user name and password");
    }
    let server = nextcloud::server_address(typed)?;
    finish(flow, server, user, password).await
}

pub async fn nextcloud_login(flow: &mut Flow) -> Result<String> {
    let server = nextcloud::server_address(flow.credentials.server.as_deref().unwrap_or_default())?;
    let login = {
        let server = server.clone();
        tokio::task::spawn_blocking(move || nextcloud::start_login(&server)).await??
    };
    flow.show(Step::Browser { url: login.url.clone() }).await;
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
    let server = nextcloud::server_address(&granted.server).unwrap_or(server);
    finish(flow, server, granted.login_name, granted.app_password).await
}

async fn finish(flow: &mut Flow, server: String, user: String, password: String) -> Result<String> {
    let nextcloud = flow.provider == Provider::Nextcloud;
    let url = if nextcloud {
        nextcloud::files_address(&server, &user)
    } else {
        server.clone()
    };
    let options = BTreeMap::from([
        ("url".to_owned(), url),
        ("vendor".to_owned(), if nextcloud { "nextcloud" } else { "other" }.to_owned()),
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
    let name = format!("check{}", flow.session);
    let mut parameters: Map<String, Value> = options.iter().map(|(key, value)| (key.clone(), value.clone().into())).collect();
    parameters.extend(secret.parameters());
    let rclone = &flow.hub.rclone;
    rclone
        .configure(&name, "webdav", parameters, json!({"obscure": true, "nonInteractive": true}))
        .await?;
    let reached = rclone.list_top(&format!("{name}:")).await;
    let _ = rclone.forget_remote(&name).await;
    reached
}
