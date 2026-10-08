use std::collections::HashMap;

use futures_util::StreamExt;
use zbus::proxy::CacheProperties;
use zbus::zvariant::OwnedValue;
use zbus::{Connection, proxy};

use crate::context::Context;
use crate::shared::notify::{self, Notification, NotificationsProxy, URGENCY_NORMAL};

const SETTINGS_ACTION: &str = "settings";

#[proxy(
    interface = "com.lantharos.Trust1",
    default_service = "com.lantharos.Trust1",
    default_path = "/com/lantharos/Trust1"
)]
trait Trust {
    #[zbus(property)]
    fn signing_key(&self) -> zbus::Result<HashMap<String, OwnedValue>>;
}

enum Missed {
    AskingAgain,
    GaveUp,
}

impl Missed {
    fn read(key: &HashMap<String, OwnedValue>) -> Option<Self> {
        let this_boot = key
            .get("MissedThisBoot")
            .and_then(|value| bool::try_from(value).ok())?;
        match key
            .get("State")
            .and_then(|value| <&str>::try_from(value).ok())
        {
            Some("pending") if this_boot => Some(Self::AskingAgain),
            Some("none") if this_boot => Some(Self::GaveUp),
            _ => None,
        }
    }

    fn notification(&self) -> Notification<'static> {
        let (summary, body) = match self {
            Self::AskingAgain => (
                "Luft's key wasn't added",
                "The steps for adding it show again when you restart.",
            ),
            Self::GaveUp => (
                "Luft's key still wasn't added",
                "You can try again from Security in Settings whenever you're ready.",
            ),
        };
        Notification {
            app: "Device Security",
            icon: "security-high-symbolic",
            summary,
            body,
            actions: &[(SETTINGS_ACTION, "Settings")],
            urgency: URGENCY_NORMAL,
            transient: false,
        }
    }
}

pub async fn start(context: &Context) -> zbus::Result<()> {
    let trust = TrustProxy::builder(&context.system)
        .cache_properties(CacheProperties::No)
        .build()
        .await?;
    let mut actions = NotificationsProxy::new(&context.session)
        .await?
        .receive_action_invoked()
        .await?;
    let session = context.session.clone();
    tokio::spawn(async move {
        let missed = match trust.signing_key().await {
            Ok(key) => Missed::read(&key),
            Err(error) => {
                eprintln!("Couldn't check whether Luft's key was added: {error}");
                None
            }
        };
        let Some(missed) = missed else {
            return;
        };
        let Some(shown) = announce(&session, &missed).await else {
            return;
        };
        while let Some(action) = actions.next().await {
            if action
                .args()
                .is_ok_and(|args| args.id == shown && args.action_key == SETTINGS_ACTION)
            {
                notify::open_settings("security");
            }
        }
    });
    Ok(())
}

async fn announce(session: &Connection, missed: &Missed) -> Option<u32> {
    if let Err(error) = notify::server_ready(session).await {
        eprintln!("Couldn't wait for the notification server: {error}");
    }
    missed
        .notification()
        .show(session, 0)
        .await
        .inspect_err(|error| eprintln!("Couldn't say that Luft's key wasn't added: {error}"))
        .ok()
}
