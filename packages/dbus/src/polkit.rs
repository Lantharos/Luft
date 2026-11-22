use std::collections::HashMap;

use luft_dbus_macros::introspect;
use zbus::Variant;
use zbus::message::{Flags, Header};
use zbus::{Connection, proxy};

use crate::idle::Asking;

const ALLOW_USER_INTERACTION: u32 = 1;
const MESSAGE: &str = "polkit.message";
const START_TIME_FIELD: usize = 19;

type Subject<'a> = (&'a str, HashMap<&'a str, Variant<'a>>);

/// What the prompt for an action says about the one change it is asked for.
/// Only a service running as root may hand polkit any.
#[derive(Default)]
pub struct Details<'a>(HashMap<&'a str, &'a str>);

impl<'a> Details<'a> {
    /// The words the prompt shows in place of the action's own message, such
    /// as `Open port 22/tcp to devices on home networks`.
    pub fn message(words: &'a str) -> Self {
        Self(HashMap::from([(MESSAGE, words)]))
    }

    /// A value that polkit rules read with `action.lookup(key)` and that the
    /// action's message may name as `$(key)`.
    #[must_use]
    pub fn with(mut self, key: &'a str, value: &'a str) -> Self {
        self.0.insert(key, value);
        self
    }
}

#[introspect]
#[proxy(
    interface = "org.freedesktop.PolicyKit1.Authority",
    default_service = "org.freedesktop.PolicyKit1",
    default_path = "/org/freedesktop/PolicyKit1/Authority"
)]
trait Authority {
    fn check_authorization(
        &self,
        subject: &Subject<'_>,
        action_id: &str,
        details: &HashMap<&str, &str>,
        flags: u32,
        cancellation_id: &str,
    ) -> zbus::Result<(bool, bool, HashMap<String, String>)>;

    fn cancel_check_authorization(&self, cancellation_id: &str) -> zbus::Result<()>;
}

pub async fn is_authorized(
    connection: &Connection,
    header: &Header<'_>,
    action: &str,
) -> zbus::Result<bool> {
    is_authorized_to(connection, header, action, &Details::default()).await
}

/// Like [`is_authorized`], with a prompt that says what is about to change.
pub async fn is_authorized_to(
    connection: &Connection,
    header: &Header<'_>,
    action: &str,
    details: &Details<'_>,
) -> zbus::Result<bool> {
    let Some(sender) = header.sender() else {
        return Ok(false);
    };
    let subject = (
        "system-bus-name",
        HashMap::from([("name", Variant::from(sender.as_str()))]),
    );
    let interactive = header
        .primary()
        .flags()
        .contains(Flags::ALLOW_INTERACTIVE_AUTH);
    let flags = if interactive {
        ALLOW_USER_INTERACTION
    } else {
        0
    };
    let _asking = Asking::start();
    let (authorized, ..) = AuthorityProxy::new(connection)
        .await?
        .check_authorization(&subject, action, &details.0, flags, "")
        .await?;
    Ok(authorized)
}

/// A process polkit asks on behalf of, as `unix-process` subjects name it.
pub struct Process {
    pid: u32,
    start_time: u64,
    uid: u32,
}

impl Process {
    /// The running process `pid` of `uid`, told apart from a later one with
    /// the same number by when it started.
    pub fn of(pid: u32, uid: u32) -> std::io::Result<Self> {
        let stat = std::fs::read_to_string(format!("/proc/{pid}/stat"))?;
        let start_time = stat
            .rsplit_once(')')
            .and_then(|(_, fields)| fields.split_whitespace().nth(START_TIME_FIELD))
            .and_then(|field| field.parse().ok())
            .ok_or_else(|| std::io::Error::other(format!("process {pid} has no start time")))?;
        Ok(Self {
            pid,
            start_time,
            uid,
        })
    }
}

/// Asks whoever is at the session of `process` to allow `action`, for a
/// change that comes from the computer rather than a caller, such as a
/// device being plugged in. `cancellation` names the question for
/// [`cancel`].
pub async fn process_is_authorized_to(
    connection: &Connection,
    process: &Process,
    action: &str,
    details: &Details<'_>,
    cancellation: &str,
) -> zbus::Result<bool> {
    let subject = (
        "unix-process",
        HashMap::from([
            ("pid", Variant::from(process.pid)),
            ("start-time", Variant::from(process.start_time)),
            ("uid", Variant::from(process.uid as i32)),
        ]),
    );
    let _asking = Asking::start();
    let (authorized, ..) = AuthorityProxy::new(connection)
        .await?
        .check_authorization(
            &subject,
            action,
            &details.0,
            ALLOW_USER_INTERACTION,
            cancellation,
        )
        .await?;
    Ok(authorized)
}

/// Takes back a question asked with a `cancellation` name, closing its prompt.
pub async fn cancel(connection: &Connection, cancellation: &str) -> zbus::Result<()> {
    AuthorityProxy::new(connection)
        .await?
        .cancel_check_authorization(cancellation)
        .await
}

pub enum Denied {
    Refused,
    Unanswered(zbus::Error),
}

/// Lets a call go on only when polkit allows its caller the action.
pub async fn authorize(
    connection: &Connection,
    header: &Header<'_>,
    action: &str,
) -> Result<(), Denied> {
    match is_authorized(connection, header, action).await {
        Ok(true) => Ok(()),
        Ok(false) => Err(Denied::Refused),
        Err(error) => Err(Denied::Unanswered(error)),
    }
}
