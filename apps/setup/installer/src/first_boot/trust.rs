use zbus::{Connection, Proxy};

const SERVICE: &str = "com.lantharos.Trust1";
const PATH: &str = "/com/lantharos/Trust1";
const NO_PIN: &str = "";

async fn trust(connection: &Connection) -> zbus::Result<Proxy<'_>> {
    Proxy::new(connection, SERVICE, PATH, SERVICE).await
}

pub async fn enroll_signing_key(connection: &Connection) -> zbus::Result<String> {
    trust(connection).await?.call("EnrollSigningKey", &()).await
}

pub async fn turn_on_encryption(
    connection: &Connection,
    recovery_key: &str,
    passphrase: &str,
) -> zbus::Result<()> {
    trust(connection)
        .await?
        .call("TurnOnEncryption", &(recovery_key, NO_PIN, passphrase))
        .await
}
