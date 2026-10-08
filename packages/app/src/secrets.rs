use std::io::{Read, Write};
use std::os::fd::OwnedFd;
use std::thread;

use sabine::SabineWindow;
use serde::Deserialize;
use zbus::zvariant::Fd;

use crate::{Commands, dbus};

const NAME: &str = "com.lantharos.Keyring1";
const PATH: &str = "/com/lantharos/Keyring1";
const INTERFACE: &str = "com.lantharos.Keyring1.AppSecrets";

fn call<R>(
    method: &str,
    body: &(impl serde::Serialize + zbus::zvariant::DynamicType),
) -> Result<R, String>
where
    R: for<'a> zbus::zvariant::DynamicDeserialize<'a>,
{
    dbus::session()?
        .call_method(Some(NAME), PATH, Some(INTERFACE), method, body)
        .and_then(|reply| reply.body().deserialize::<R>())
        .map_err(|error| error.to_string())
}

pub fn store(name: &str, secret: &[u8]) -> Result<(), String> {
    let (reader, mut writer) = std::io::pipe().map_err(|error| error.to_string())?;
    let reader = OwnedFd::from(reader);
    let secret = secret.to_vec();
    let feeding = thread::spawn(move || writer.write_all(&secret));
    let stored = call::<()>("Store", &(name, Fd::from(&reader)));
    drop(reader);
    let fed = feeding
        .join()
        .map_err(|_| "the secret couldn't be handed over".to_owned())?;
    stored?;
    fed.map_err(|error| error.to_string())
}

pub fn load(name: &str) -> Result<Option<Vec<u8>>, String> {
    let (mut reader, writer) = std::io::pipe().map_err(|error| error.to_string())?;
    let writer = OwnedFd::from(writer);
    let draining = thread::spawn(move || {
        let mut secret = Vec::new();
        reader.read_to_end(&mut secret).map(|_| secret)
    });
    let found = call::<bool>("Load", &(name, Fd::from(&writer)));
    drop(writer);
    let secret = draining
        .join()
        .map_err(|_| "the secret couldn't be read".to_owned())?
        .map_err(|error| error.to_string())?;
    Ok(found?.then_some(secret))
}

pub fn delete(name: &str) -> Result<bool, String> {
    call("Delete", &(name,))
}

pub fn names() -> Result<Vec<String>, String> {
    call("List", &())
}

#[derive(Deserialize)]
struct Named {
    name: String,
}

#[derive(Deserialize)]
struct Value {
    name: String,
    value: String,
}

fn load_text(Named { name }: Named) -> Result<Option<String>, String> {
    load(&name)?
        .map(|secret| String::from_utf8(secret).map_err(|error| error.to_string()))
        .transpose()
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command("secrets_store", |Value { name, value }: Value| {
            store(&name, value.as_bytes())
        })
        .command("secrets_load", load_text)
        .command("secrets_delete", |Named { name }: Named| delete(&name))
}
