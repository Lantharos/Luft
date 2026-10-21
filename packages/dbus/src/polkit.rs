use std::collections::HashMap;

use zbus::Variant;
use zbus::message::{Flags, Header};
use zbus::{Connection, proxy};

const ALLOW_USER_INTERACTION: u32 = 1;

type Subject<'a> = (&'a str, HashMap<&'a str, Variant<'a>>);

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

pub async fn is_authorized(
    connection: &Connection,
    header: &Header<'_>,
    action: &str,
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
    let (authorized, ..) = AuthorityProxy::new(connection)
        .await?
        .check_authorization(&subject, action, &HashMap::new(), flags, "")
        .await?;
    Ok(authorized)
}
