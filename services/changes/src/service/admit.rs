use luft_identity::caller;
use zbus::Connection;
use zbus::message::Header;

use super::error::Error;

const KESTREL_UNIT: &str = "kestrel.service";
const KESTREL: &str = "/usr/bin/kestrel";

/// Lets only the desktop of the person at the screen hand over changes: the
/// one place that shows them for review before they reach this service.
pub async fn kestrel(connection: &Connection, header: &Header<'_>) -> Result<(), Error> {
    let in_unit = caller::session_unit(connection, header)
        .await
        .is_some_and(|unit| unit.name == KESTREL_UNIT);
    if in_unit
        && caller::luft_program(connection, header, &[KESTREL])
            .await
            .is_some()
    {
        return Ok(());
    }
    eprintln!("Refused changes from a caller that isn't {KESTREL} in {KESTREL_UNIT}");
    Err(Error::not_authorized())
}
