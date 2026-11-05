use std::collections::HashMap;
use std::sync::atomic::{AtomicU32, Ordering};

use futures_util::StreamExt;
use zbus::{MessageStream, OwnedObjectPath, OwnedVariant, Proxy, Variant};

use crate::dbus::{self, failed};
use crate::portal::{Response, request};

const PORTAL: &str = "org.freedesktop.portal.Desktop";
const PORTAL_PATH: &str = "/org/freedesktop/portal/desktop";
const INTERFACE: &str = "org.freedesktop.portal.GlobalShortcuts";
const REGISTRY: &str = "org.freedesktop.host.portal.Registry";

static SESSIONS: AtomicU32 = AtomicU32::new(0);

pub struct Shortcut<'a> {
    pub id: &'a str,
    pub description: &'a str,
}

#[derive(Clone, Debug, PartialEq)]
pub struct Bound {
    pub id: String,
    pub trigger: Option<String>,
}

#[derive(Clone, Debug, PartialEq)]
pub enum Event {
    Pressed(String),
    Released(String),
    Changed(Vec<Bound>),
}

type Described = (String, HashMap<String, OwnedVariant>);

fn bound(described: Vec<Described>) -> Vec<Bound> {
    described
        .into_iter()
        .map(|(id, options)| Bound {
            id,
            trigger: options
                .get("trigger_description")
                .and_then(|trigger| String::try_from(trigger.clone()).ok()),
        })
        .collect()
}

/// A session with the GlobalShortcuts portal. The shortcuts belong to the desktop: it asks before an app gets one, lets
/// people change them, and only passes them on while the desktop is in normal use, so never from the lock screen.
pub struct GlobalShortcuts {
    portal: Proxy<'static>,
    session: OwnedObjectPath,
}

impl GlobalShortcuts {
    /// Apps outside a sandbox name themselves first, since the portal can't tell who they are. In a sandbox the portal
    /// knows, and refuses this.
    pub async fn open(app_id: &str) -> Result<Self, String> {
        let connection = dbus::session().await?;
        let registry = Proxy::new(connection, PORTAL, PORTAL_PATH, REGISTRY)
            .await
            .map_err(failed)?;
        let _: Result<(), _> = registry
            .call("Register", &(app_id, HashMap::<&str, Variant<'_>>::new()))
            .await;
        let portal = Proxy::new(connection, PORTAL, PORTAL_PATH, INTERFACE)
            .await
            .map_err(failed)?;
        let token = format!(
            "luft{}_{}",
            std::process::id(),
            SESSIONS.fetch_add(1, Ordering::Relaxed)
        );
        let (response, results) = request(INTERFACE, "CreateSession", |request_token| {
            let mut options = HashMap::new();
            options.insert("handle_token", Variant::from(request_token));
            options.insert("session_handle_token", Variant::from(token.clone()));
            (options,)
        })
        .await?;
        if response != Response::Answered {
            return Err("The desktop refused global shortcuts".into());
        }
        let handle = results
            .get("session_handle")
            .ok_or("The portal gave no session")?;
        let session = String::try_from(handle.clone()).map_err(failed)?;
        Ok(Self {
            portal,
            session: OwnedObjectPath::try_from(session).map_err(failed)?,
        })
    }

    /// Asks for `shortcuts`, the whole set the app wants right now. Ones the desktop already knows keep their keys;
    /// new ones start without any, until people set them with [`Self::configure`].
    pub async fn bind(&self, shortcuts: &[Shortcut<'_>]) -> Result<Vec<Bound>, String> {
        let shortcuts: Vec<(&str, HashMap<&str, Variant<'_>>)> = shortcuts
            .iter()
            .map(|shortcut| {
                (
                    shortcut.id,
                    HashMap::from([("description", Variant::from(shortcut.description))]),
                )
            })
            .collect();
        let (response, results) = request(INTERFACE, "BindShortcuts", |token| {
            (
                &self.session,
                &shortcuts,
                "",
                HashMap::from([("handle_token", Variant::from(token))]),
            )
        })
        .await?;
        if response != Response::Answered {
            return Err("The shortcuts weren't allowed".into());
        }
        let described = results
            .get("shortcuts")
            .ok_or("The portal gave no shortcuts")?;
        let described = Variant::from(described.clone())
            .try_into()
            .map_err(failed)?;
        Ok(bound(described))
    }

    /// Opens the desktop's dialog for choosing keys.
    pub async fn configure(&self) -> Result<(), String> {
        self.portal
            .call::<_, _, ()>(
                "ConfigureShortcuts",
                &(&self.session, "", HashMap::<&str, Variant<'_>>::new()),
            )
            .await
            .map_err(failed)
    }

    /// Calls `handle` with everything that happens to the session's shortcuts, until the connection ends.
    pub async fn listen(&self, mut handle: impl FnMut(Event)) -> Result<(), String> {
        let rule = zbus::MatchRule::builder()
            .msg_type(zbus::message::Type::Signal)
            .interface(INTERFACE)
            .build()
            .map_err(failed)?;
        let mut signals = MessageStream::for_match_rule(rule, self.portal.connection(), None)
            .await
            .map_err(failed)?;
        while let Some(message) = signals.next().await {
            let message = message.map_err(failed)?;
            let header = message.header();
            let member = header.member().map(|member| member.as_str());
            let body = message.body();
            let event = match member {
                Some("Activated") => body
                    .deserialize::<(OwnedObjectPath, String, u64, HashMap<String, OwnedVariant>)>()
                    .ok()
                    .filter(|(session, ..)| *session == self.session)
                    .map(|(_, id, ..)| Event::Pressed(id)),
                Some("Deactivated") => body
                    .deserialize::<(OwnedObjectPath, String, u64, HashMap<String, OwnedVariant>)>()
                    .ok()
                    .filter(|(session, ..)| *session == self.session)
                    .map(|(_, id, ..)| Event::Released(id)),
                Some("ShortcutsChanged") => body
                    .deserialize::<(OwnedObjectPath, Vec<Described>)>()
                    .ok()
                    .filter(|(session, _)| *session == self.session)
                    .map(|(_, described)| Event::Changed(bound(described))),
                _ => None,
            };
            if let Some(event) = event {
                handle(event);
            }
        }
        Ok(())
    }
}
