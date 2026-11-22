use anyhow::Result;
use luft_policy::Policy;
use zbus::object_server::InterfaceRef;

use super::interface::Trust;
use crate::disk::SystemDisk;
use crate::disk::encrypting;
use crate::disk::unlock::keys;
use crate::system::secrets::secret::Secret;

/// Has Luft's partition encrypted at the next restart when the policy requires it and the TPM
/// unlocks it without anyone typing. The recovery key is made here and kept sealed to the TPM,
/// where an administrator can show it in Settings.
fn encrypt(on_battery: bool) -> Result<()> {
    if !Policy::load().encryption.required || !encrypting::tpm_unlocks() || encrypting::underway() {
        return Ok(());
    }
    let disk = SystemDisk::find()?;
    if !encrypting::possible(&disk) || disk.header()?.is_some() {
        return Ok(());
    }
    encrypting::request(
        &keys::generate_recovery_key()?,
        &Secret::default(),
        on_battery,
    )
}

pub async fn follow(trust: &InterfaceRef<Trust>) {
    if !Policy::load().encryption.required {
        return;
    }
    let on_battery = luft_dbus::power::on_battery(trust.signal_emitter().connection()).await;
    let emitter = trust.signal_emitter();
    if let Err(error) = trust
        .get()
        .await
        .run(emitter, move || encrypt(on_battery))
        .await
    {
        eprintln!("Couldn't encrypt Luft's partition as the policy requires: {error}");
    }
}

pub async fn keep_following(trust: InterfaceRef<Trust>) -> anyhow::Result<()> {
    let mut policy = luft_policy::Follow::start()?;
    loop {
        policy.changed().await?;
        follow(&trust).await;
    }
}
