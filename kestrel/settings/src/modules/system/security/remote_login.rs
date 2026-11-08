use futures_util::StreamExt;
use luft_i18n::t;
use zbus::{Connection, OwnedObjectPath};

use crate::L10N;
use crate::context::Context;
use crate::shared::notify::{self, Notification, NotificationsProxy, Sound, URGENCY_CRITICAL};
use crate::shared::system::{LoginProxy, LoginSessionProxy};

const SSHD: &str = "sshd";
const SETTINGS_ACTION: &str = "settings";
const PAGE: &str = "security/remote-login";

struct SignIn {
    account: String,
    address: String,
}

async fn over_ssh(system: &Connection, path: OwnedObjectPath) -> zbus::Result<Option<SignIn>> {
    let session = LoginSessionProxy::builder(system).path(path).build().await?;
    if session.service().await? != SSHD {
        return Ok(None);
    }
    Ok(Some(SignIn {
        account: session.name().await?,
        address: session.remote_host().await?,
    }))
}

async fn announce(session: &Connection, SignIn { account, address }: &SignIn) -> zbus::Result<u32> {
    Notification {
        app: "Remote Login",
        icon: "utilities-terminal-symbolic",
        summary: &t!(
            L10N,
            "remote-login-signed-in-title",
            address = address.as_str()
        ),
        body: &t!(L10N, "remote-login-signed-in", account = account.as_str()),
        actions: &[(SETTINGS_ACTION, &t!(L10N, "remote-login-settings"))],
        urgency: URGENCY_CRITICAL,
        transient: false,
        sound: Sound::Usual,
        shows_when_locked: true,
    }
    .show(session, 0)
    .await
}

pub async fn start(context: &Context) -> zbus::Result<()> {
    let mut signed_in = LoginProxy::new(&context.system)
        .await?
        .receive_session_new()
        .await?;
    let mut actions = NotificationsProxy::new(&context.session)
        .await?
        .receive_action_invoked()
        .await?;
    let (session, system) = (context.session.clone(), context.system.clone());
    tokio::spawn(async move {
        if let Err(error) = notify::server_ready(&session).await {
            eprintln!("Couldn't wait for the notification server: {error}");
        }
        let mut shown = Vec::new();
        loop {
            tokio::select! {
                Some(new) = signed_in.next() => {
                    let Ok(args) = new.args() else { continue };
                    match over_ssh(&system, args.path).await {
                        Ok(Some(sign_in)) => match announce(&session, &sign_in).await {
                            Ok(id) => shown.push(id),
                            Err(error) => eprintln!("Couldn't tell about a sign-in over SSH: {error}"),
                        },
                        Ok(None) => {}
                        Err(error) => eprintln!("Couldn't read a new session: {error}"),
                    }
                }
                Some(action) = actions.next() => {
                    if action.args().is_ok_and(|args| shown.contains(&args.id) && args.action_key == SETTINGS_ACTION) {
                        notify::open_settings(PAGE);
                    }
                }
            }
        }
    });
    Ok(())
}
