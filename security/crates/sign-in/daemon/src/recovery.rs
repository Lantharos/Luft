use luft_dbus_macros::introspect;
use zbus::{Connection, proxy};

#[introspect]
#[proxy(
    interface = "com.lantharos.Trust1",
    default_service = "com.lantharos.Trust1",
    default_path = "/com/lantharos/Trust1"
)]
trait Trust {
    fn check_recovery_key(&self, recovery_key: &str) -> zbus::Result<bool>;
}

/// Whether `words` are the recovery key of the disk Luft started from.
/// An empty key would ask trustd about the copy it keeps, so it never counts.
pub async fn opens_the_disk(connection: &Connection, words: &str) -> bool {
    if words.trim().is_empty() {
        return false;
    }
    match TrustProxy::new(connection).await {
        Ok(trust) => trust.check_recovery_key(words).await.unwrap_or(false),
        Err(_) => false,
    }
}
