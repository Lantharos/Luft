use std::fs::File;
use std::path::Path;

use luft_app::dbus::{self, service::Service};
use zbus::Fd;

const PACKAGES: Service = Service {
    name: "com.lantharos.Packages1",
    path: "/com/lantharos/Packages1",
    interface: "com.lantharos.Packages1",
};

/// A signed document from schelf.store, as it was sent, with its seal.
pub struct Signed<'a> {
    pub body: &'a [u8],
    pub seal: &'a [u8],
}

/// Has the system install an extension release schelf.store approved to run
/// inside Luft, for this account, where the account's own programs can't
/// change it. The system checks `listing` and `keys` against schelf.store's
/// signature and `archive` against `listing` itself.
pub async fn install(
    id: &str,
    listing: Signed<'_>,
    keys: Signed<'_>,
    archive: &Path,
) -> Result<(), String> {
    let archive = File::open(archive).map_err(|error| error.to_string())?;
    PACKAGES
        .change::<_, ()>(
            "InstallExtension",
            &(
                id,
                listing.body,
                listing.seal,
                keys.body,
                keys.seal,
                Fd::from(&archive),
            ),
        )
        .await
        .map_err(|error| dbus::explain(&error))
}

/// Has the system remove an extension it installed for this account.
pub async fn remove(id: &str) -> Result<(), String> {
    PACKAGES
        .change::<_, ()>("RemoveExtension", &(id,))
        .await
        .map_err(|error| dbus::explain(&error))
}
