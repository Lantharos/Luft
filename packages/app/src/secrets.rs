use std::io::{Read, Write};
use std::os::fd::OwnedFd;

use tokio::task::spawn_blocking;
use zbus::Fd;
use zbus::wire::DynamicDeserialize;

use crate::dbus::{self, failed};

const NAME: &str = "com.lantharos.Keyring1";
const PATH: &str = "/com/lantharos/Keyring1";
const INTERFACE: &str = "com.lantharos.Keyring1.AppSecrets";

async fn call<R>(
    method: &str,
    body: &(impl serde::Serialize + zbus::DynamicType),
) -> Result<R, String>
where
    R: for<'a> DynamicDeserialize<'a>,
{
    dbus::session()
        .await?
        .call_method(Some(NAME), PATH, Some(INTERFACE), method, body)
        .await
        .and_then(|reply| reply.body().deserialize::<R>())
        .map_err(failed)
}

pub async fn store(name: &str, secret: &[u8]) -> Result<(), String> {
    let (reader, mut writer) = std::io::pipe().map_err(failed)?;
    let reader = OwnedFd::from(reader);
    let secret = secret.to_vec();
    let feeding = spawn_blocking(move || writer.write_all(&secret));
    let stored = call::<()>("Store", &(name, Fd::from(&reader))).await;
    drop(reader);
    let fed = feeding
        .await
        .map_err(|_| "the secret couldn't be handed over".to_owned())?;
    stored?;
    fed.map_err(failed)
}

pub async fn load(name: &str) -> Result<Option<Vec<u8>>, String> {
    let (mut reader, writer) = std::io::pipe().map_err(failed)?;
    let writer = OwnedFd::from(writer);
    let draining = spawn_blocking(move || {
        let mut secret = Vec::new();
        reader.read_to_end(&mut secret).map(|_| secret)
    });
    let found = call::<bool>("Load", &(name, Fd::from(&writer))).await;
    drop(writer);
    let secret = draining
        .await
        .map_err(|_| "the secret couldn't be read".to_owned())?
        .map_err(failed)?;
    Ok(found?.then_some(secret))
}

pub async fn delete(name: &str) -> Result<bool, String> {
    call("Delete", &(name,)).await
}
