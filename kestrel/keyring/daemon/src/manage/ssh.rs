use std::sync::Arc;

use luft_keyring_vault::SshPrivate;
use luft_keyring_wire::Chip;
use zbus::message::Header;
use zbus::object_server::SignalEmitter;
use zbus::{fdo, interface};

use super::{PATH, settings_only};
use crate::daemon::Daemon;
use crate::ssh::{
    fingerprint, generate_in_chip, generate_software, kind, openssh_line, socket_path,
};

pub struct Ssh {
    pub daemon: Arc<Daemon>,
}

type Key = (String, String, String, bool, bool, u64);

impl Daemon {
    pub async fn ssh_changed(&self) {
        if let Ok(ssh) = self
            .connection
            .object_server()
            .interface::<_, Ssh>(PATH)
            .await
        {
            let _ = Ssh::changed(ssh.signal_emitter()).await;
        }
    }

    async fn edit_key(
        &self,
        wanted: &str,
        change: impl FnOnce(&mut Vec<luft_keyring_vault::SshKey>, usize),
    ) -> fdo::Result<()> {
        let mut keyring = self.keyring.lock().await;
        keyring
            .edit(|contents| {
                let position = contents
                    .ssh
                    .iter()
                    .position(|key| fingerprint(&key.public) == wanted)?;
                change(&mut contents.ssh, position);
                Some(())
            })
            .map_err(|error| fdo::Error::Failed(error.to_string()))?
            .ok_or_else(|| fdo::Error::InvalidArgs("No such key".into()))
    }
}

#[interface(name = "com.lantharos.Keyring1.Ssh")]
impl Ssh {
    async fn keys(&self, #[zbus(header)] header: Header<'_>) -> fdo::Result<Vec<Key>> {
        settings_only(&self.daemon, &header).await?;
        let keyring = self.daemon.keyring.lock().await;
        let Some(view) = keyring.view() else {
            return Ok(Vec::new());
        };
        Ok(view
            .ssh
            .iter()
            .map(|key| {
                let chip = matches!(key.private, SshPrivate::Chip { .. });
                (
                    fingerprint(&key.public),
                    key.comment.clone(),
                    kind(&key.public).to_owned(),
                    chip,
                    key.confirm,
                    key.added,
                )
            })
            .collect())
    }

    async fn generate(
        &self,
        name: String,
        chip: bool,
        #[zbus(header)] header: Header<'_>,
    ) -> fdo::Result<String> {
        settings_only(&self.daemon, &header).await?;
        let key = if chip {
            generate_in_chip(name).await.map_err(fdo::Error::Failed)?
        } else {
            generate_software(name)
        };
        let made = fingerprint(&key.public);
        self.daemon
            .keyring
            .lock()
            .await
            .edit(|contents| contents.ssh.push(key))
            .map_err(|error| fdo::Error::Failed(error.to_string()))?;
        self.daemon.ssh_changed().await;
        Ok(made)
    }

    async fn public_key(
        &self,
        fingerprint_wanted: &str,
        #[zbus(header)] header: Header<'_>,
    ) -> fdo::Result<String> {
        settings_only(&self.daemon, &header).await?;
        let keyring = self.daemon.keyring.lock().await;
        keyring
            .view()
            .and_then(|view| {
                view.ssh
                    .iter()
                    .find(|key| fingerprint(&key.public) == fingerprint_wanted)
            })
            .map(openssh_line)
            .ok_or_else(|| fdo::Error::InvalidArgs("No such key".into()))
    }

    async fn set_confirm(
        &self,
        fingerprint_wanted: &str,
        confirm: bool,
        #[zbus(header)] header: Header<'_>,
    ) -> fdo::Result<()> {
        settings_only(&self.daemon, &header).await?;
        self.daemon
            .edit_key(fingerprint_wanted, |keys, position| {
                keys[position].confirm = confirm
            })
            .await?;
        self.daemon.ssh_changed().await;
        Ok(())
    }

    async fn remove(
        &self,
        fingerprint_wanted: &str,
        #[zbus(header)] header: Header<'_>,
    ) -> fdo::Result<()> {
        settings_only(&self.daemon, &header).await?;
        self.daemon
            .edit_key(fingerprint_wanted, |keys, position| {
                drop(keys.remove(position))
            })
            .await?;
        self.daemon.ssh_changed().await;
        Ok(())
    }

    #[zbus(property)]
    fn socket(&self) -> String {
        socket_path().display().to_string()
    }

    #[zbus(property)]
    async fn chip_keys(&self) -> bool {
        self.daemon
            .chip
            .lock()
            .await
            .as_ref()
            .is_some_and(|status| status.chip == Chip::Ready)
    }

    #[zbus(signal)]
    async fn changed(emitter: &SignalEmitter<'_>) -> zbus::Result<()>;
}
