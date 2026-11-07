use std::collections::HashMap;
use std::path::PathBuf;

use futures_util::StreamExt;
use luft_dbus_macros::introspect;
use luft_i18n::t;
use zbus::OwnedVariant;
use zbus::proxy::CacheProperties;
use zbus::{Connection, proxy};

use crate::L10N;
use crate::context::Context;
use crate::shared::notify::{self, Notification, NotificationsProxy, Sound, URGENCY_NORMAL};

const OPEN: &str = "default";
const SHOW_STEPS: &str = "settings";
const PAGE: &str = "security/secure-boot";
const TOLD: &str = "luft/secure-boot-told";
const BOOT_ID: &str = "/proc/sys/kernel/random/boot_id";

#[introspect]
#[proxy(
    interface = "com.lantharos.Trust1",
    default_service = "com.lantharos.Trust1",
    default_path = "/com/lantharos/Trust1"
)]
trait Trust {
    #[zbus(property)]
    fn signing_key(&self) -> zbus::Result<HashMap<String, OwnedVariant>>;

    #[zbus(property)]
    fn startup(&self) -> zbus::Result<HashMap<String, OwnedVariant>>;
}

enum Unfinished {
    Missed,
    WaitingForRestart,
    GaveUp,
}

fn flag(map: &HashMap<String, OwnedVariant>, key: &str) -> bool {
    map.get(key)
        .and_then(|value| bool::try_from(value).ok())
        .unwrap_or_default()
}

impl Unfinished {
    fn read(
        key: &HashMap<String, OwnedVariant>,
        startup: &HashMap<String, OwnedVariant>,
    ) -> Option<Self> {
        let missed = flag(key, "MissedThisBoot");
        let without_key = flag(startup, "WithoutKey");
        match key
            .get("State")
            .and_then(|value| <&str>::try_from(value).ok())
        {
            Some("pending") if missed => Some(Self::Missed),
            Some("pending") if without_key => Some(Self::WaitingForRestart),
            Some("none") if missed => Some(Self::GaveUp),
            _ => None,
        }
    }

    fn body(&self) -> String {
        match self {
            Self::Missed => t!(L10N, "secure-boot-missed"),
            Self::WaitingForRestart => t!(L10N, "secure-boot-waiting"),
            Self::GaveUp => t!(L10N, "secure-boot-gave-up"),
        }
    }
}

fn told() -> PathBuf {
    glib::user_state_dir().join(TOLD)
}

fn this_boot() -> String {
    std::fs::read_to_string(BOOT_ID)
        .map(|id| id.trim().to_owned())
        .unwrap_or_default()
}

fn told_this_boot(boot: &str) -> bool {
    std::fs::read_to_string(told()).is_ok_and(|told| told.trim() == boot)
}

fn remember(boot: &str) {
    let told = told();
    let remembered = std::fs::create_dir_all(told.parent().expect("state lives in a folder"))
        .and_then(|()| std::fs::write(&told, boot));
    if let Err(error) = remembered {
        eprintln!("Couldn't remember telling about Secure Boot: {error}");
    }
}

async fn unfinished(trust: &TrustProxy<'_>) -> zbus::Result<Option<Unfinished>> {
    let key = trust.signing_key().await?;
    let startup = trust.startup().await?;
    Ok(Unfinished::read(&key, &startup))
}

pub async fn start(context: &Context) -> zbus::Result<()> {
    let boot = this_boot();
    if told_this_boot(&boot) {
        return Ok(());
    }
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
        let unfinished = match unfinished(&trust).await {
            Ok(unfinished) => unfinished,
            Err(error) => {
                eprintln!("Couldn't check whether Secure Boot is set up for Luft: {error}");
                None
            }
        };
        let Some(unfinished) = unfinished else {
            return;
        };
        let Some(shown) = announce(&session, &unfinished).await else {
            return;
        };
        remember(&boot);
        while let Some(action) = actions.next().await {
            if action.args().is_ok_and(|args| {
                args.id == shown && [OPEN, SHOW_STEPS].contains(&args.action_key.as_str())
            }) {
                notify::open_settings(PAGE);
            }
        }
    });
    Ok(())
}

async fn announce(session: &Connection, unfinished: &Unfinished) -> Option<u32> {
    if let Err(error) = notify::server_ready(session).await {
        eprintln!("Couldn't wait for the notification server: {error}");
    }
    let show_steps = t!(L10N, "secure-boot-show-steps");
    Notification {
        app: &t!(L10N, "secure-boot-source"),
        icon: "security-high-symbolic",
        summary: &t!(L10N, "secure-boot-unfinished-title"),
        body: &unfinished.body(),
        actions: &[(OPEN, ""), (SHOW_STEPS, &show_steps)],
        urgency: URGENCY_NORMAL,
        transient: false,
        sound: Sound::Usual,
        shows_when_locked: false,
    }
    .show(session, 0)
    .await
    .inspect_err(|error| eprintln!("Couldn't say that Secure Boot isn't set up: {error}"))
    .ok()
}
