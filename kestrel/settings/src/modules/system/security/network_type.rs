use std::collections::HashMap;

use futures_util::StreamExt;
use luft_dbus_macros::introspect;
use luft_i18n::t;
use zbus::{Connection, OwnedObjectPath, proxy};

use crate::L10N;
use crate::context::Context;
use crate::shared::notify::{self, Notification, NotificationsProxy, Sound, URGENCY_NORMAL};

const TYPES: [&str; 2] = ["home", "public"];

#[introspect]
#[proxy(
    interface = "com.lantharos.Firewall1",
    default_service = "com.lantharos.Firewall1",
    default_path = "/com/lantharos/Firewall1"
)]
trait Firewall {
    #[zbus(property)]
    fn unclassified(&self) -> zbus::Result<Vec<(OwnedObjectPath, String)>>;

    fn set_network_type(&self, network: &OwnedObjectPath, kind: &str) -> zbus::Result<()>;
}

pub async fn start(context: &Context) -> zbus::Result<()> {
    let firewall = FirewallProxy::new(&context.system).await?;
    let mut changes = firewall.receive_unclassified_changed().await;
    let mut actions = NotificationsProxy::new(&context.session)
        .await?
        .receive_action_invoked()
        .await?;
    let session = context.session.clone();
    tokio::spawn(async move {
        if let Err(error) = notify::server_ready(&session).await {
            eprintln!("Couldn't wait for the notification server: {error}");
        }
        let mut asking = HashMap::new();
        ask(&session, &firewall, &mut asking).await;
        loop {
            tokio::select! {
                Some(_) = changes.next() => ask(&session, &firewall, &mut asking).await,
                Some(action) = actions.next() => {
                    let Ok(args) = action.args() else { continue };
                    let Some(network) = asking.iter().find_map(|(network, id)| (*id == args.id).then(|| network.clone())) else {
                        continue;
                    };
                    if !TYPES.contains(&args.action_key.as_str()) {
                        continue;
                    }
                    if let Err(error) = firewall.set_network_type(&network, &args.action_key).await {
                        eprintln!("Couldn't keep what kind of network this is: {error}");
                    }
                }
            }
        }
    });
    Ok(())
}

async fn ask(
    session: &Connection,
    firewall: &FirewallProxy<'_>,
    asking: &mut HashMap<OwnedObjectPath, u32>,
) {
    let unclassified = match firewall.unclassified().await {
        Ok(unclassified) => unclassified,
        Err(error) => {
            eprintln!("Couldn't see which networks are new: {error}");
            return;
        }
    };
    let answered: Vec<OwnedObjectPath> = asking
        .keys()
        .filter(|network| !unclassified.iter().any(|(path, _)| path == *network))
        .cloned()
        .collect();
    for network in answered {
        if let Some(id) = asking.remove(&network) {
            notify::close(session, id).await;
        }
    }
    for (network, name) in unclassified {
        if asking.contains_key(&network) {
            continue;
        }
        match question(session, &name).await {
            Ok(id) => {
                asking.insert(network, id);
            }
            Err(error) => eprintln!("Couldn't ask what kind of network {name} is: {error}"),
        }
    }
}

async fn question(session: &Connection, name: &str) -> zbus::Result<u32> {
    let home = t!(L10N, "network-type-home");
    let public = t!(L10N, "network-type-public");
    Notification {
        app: "Network",
        icon: "network-wireless-symbolic",
        summary: &t!(L10N, "network-type-title", network = name),
        body: &t!(L10N, "network-type-body"),
        actions: &[(TYPES[0], &home), (TYPES[1], &public)],
        urgency: URGENCY_NORMAL,
        transient: false,
        sound: Sound::Usual,
        shows_when_locked: false,
    }
    .show(session, 0)
    .await
}
