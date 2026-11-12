use luft_dbus::polkit::{self, Details};
use zbus::Connection;
use zbus::message::Header;
use zbus::proxy::CacheProperties;

use super::error::Error;

const GREETER: &str = "com.lantharos.Greeter1";
const GREETER_PATH: &str = "/com/lantharos/Greeter1";
const SETTINGS: &str = "/usr/lib/sabine/com.lantharos.settings/settings";
const UNREVIEWED: &str = "com.lantharos.packages.unreviewed-extensions";

async fn developer_tools(connection: &Connection) -> zbus::Result<bool> {
    zbus::proxy::Builder::<zbus::Proxy<'_>>::new(connection)
        .destination(GREETER)
        .path(GREETER_PATH)
        .interface(GREETER)
        .cache_properties(CacheProperties::No)
        .build()
        .await?
        .get_property("DeveloperTools")
        .await
}

/// The account of a person who, in Luft's own Settings while Developer
/// tools is on, proved they're there to let an extension nobody reviewed
/// run inside the shell. Polkit asks every time, with `question`.
pub async fn approver(
    connection: &Connection,
    header: &Header<'_>,
    question: &str,
) -> Result<u32, Error> {
    if !developer_tools(connection).await.unwrap_or(false) {
        return Err(Error::NotAuthorized(
            "Extensions nobody reviewed only run inside Luft while Developer tools is on."
                .to_owned(),
        ));
    }
    if luft_identity::caller::luft_program(connection, header, &[SETTINGS])
        .await
        .is_none()
    {
        return Err(Error::NotAuthorized(
            "Only Luft's Settings can let an extension nobody reviewed run inside Luft.".to_owned(),
        ));
    }
    if !polkit::is_authorized_to(connection, header, UNREVIEWED, &Details::message(question))
        .await?
    {
        return Err(Error::not_authorized());
    }
    luft_identity::caller::uid(connection, header)
        .await?
        .ok_or_else(Error::not_authorized)
}
