use std::collections::HashMap;

use zbus::names::UniqueName;
use zbus::zvariant::Value;
use zbus::{Connection, proxy};

use crate::error::Error;

const ALLOW_USER_INTERACTION: u32 = 1;

type Subject<'a> = (&'a str, HashMap<&'a str, Value<'a>>);

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
}

pub async fn check(
    connection: &Connection,
    caller: &UniqueName<'_>,
    action: &str,
    interactive: bool,
) -> Result<(), Error> {
    let subject = (
        "system-bus-name",
        HashMap::from([("name", Value::from(caller.as_str()))]),
    );
    let flags = if interactive {
        ALLOW_USER_INTERACTION
    } else {
        0
    };
    let (authorized, ..) = AuthorityProxy::new(connection)
        .await?
        .check_authorization(&subject, action, &HashMap::new(), flags, "")
        .await?;
    if authorized {
        Ok(())
    } else {
        Err(Error::not_authorized())
    }
}
