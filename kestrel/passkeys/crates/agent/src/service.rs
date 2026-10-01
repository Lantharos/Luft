use serde::Serialize;
use zbus::object_server::SignalEmitter;
use zbus::zvariant::Type;
use zbus::{Connection, fdo, interface};

use crate::vault::Vault;

pub const PATH: &str = "/com/lantharos/Passkeys1";

#[derive(Serialize, Type)]
pub struct Entry {
    id: Vec<u8>,
    site: String,
    site_name: String,
    account: String,
    display_name: String,
    nickname: String,
    created: u64,
    used: u64,
    chip: bool,
}

pub struct Service {
    vault: Vault,
    ready: bool,
}

fn failed(status: ctap::Status) -> fdo::Error {
    fdo::Error::Failed(status.to_string())
}

impl Service {
    pub fn new(vault: Vault) -> Self {
        Self {
            vault,
            ready: false,
        }
    }
}

#[interface(name = "com.lantharos.Passkeys1")]
impl Service {
    async fn list(&self) -> fdo::Result<Vec<Entry>> {
        let passkeys = self.vault.list().await.map_err(failed)?;
        Ok(passkeys
            .into_iter()
            .map(|passkey| {
                let credential = passkey.credential;
                Entry {
                    id: credential.id,
                    site_name: credential.rp.name.unwrap_or_default(),
                    site: credential.rp.id,
                    account: credential.user.name.unwrap_or_default(),
                    display_name: credential.user.display_name.unwrap_or_default(),
                    nickname: passkey.nickname,
                    created: passkey.created,
                    used: passkey.used,
                    chip: passkey.chip,
                }
            })
            .collect())
    }

    async fn rename(
        &self,
        id: Vec<u8>,
        nickname: String,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> fdo::Result<()> {
        self.vault
            .rename(&id, nickname.trim())
            .await
            .map_err(failed)?;
        Self::changed(&emitter).await?;
        Ok(())
    }

    async fn delete(
        &self,
        id: Vec<u8>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> fdo::Result<()> {
        self.vault.delete(&id).await.map_err(failed)?;
        Self::changed(&emitter).await?;
        Ok(())
    }

    #[zbus(property)]
    async fn protection(&self) -> String {
        match self.vault.chip().await {
            Ok(true) => "chip",
            Ok(false) => "password",
            Err(_) => "unavailable",
        }
        .to_owned()
    }

    #[zbus(property)]
    fn ready(&self) -> bool {
        self.ready
    }

    #[zbus(signal)]
    async fn changed(emitter: &SignalEmitter<'_>) -> zbus::Result<()>;
}

#[derive(Clone)]
pub struct Notifier {
    connection: Connection,
}

impl Notifier {
    pub fn new(connection: Connection) -> Self {
        Self { connection }
    }

    pub async fn changed(&self) {
        if let Ok(emitter) = SignalEmitter::new(&self.connection, PATH) {
            let _ = Service::changed(&emitter).await;
        }
    }

    pub async fn ready(&self, ready: bool) {
        let Ok(service) = self
            .connection
            .object_server()
            .interface::<_, Service>(PATH)
            .await
        else {
            return;
        };
        let mut state = service.get_mut().await;
        if state.ready != ready {
            state.ready = ready;
            let _ = state.ready_changed(service.signal_emitter()).await;
        }
    }
}
