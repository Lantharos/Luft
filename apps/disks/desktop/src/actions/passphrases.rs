use std::collections::HashMap;

use luft_app::dbus;
use zbus::blocking::{Connection, Proxy};
use zbus::zvariant::{DynamicDeserialize, DynamicType, OwnedObjectPath, OwnedValue, Value};

const SERVICE: &str = "org.freedesktop.secrets";
const ROOT: &str = "/org/freedesktop/secrets";
const DEFAULT_COLLECTION: &str = "/org/freedesktop/secrets/aliases/default";
const SECRETS: &str = "org.freedesktop.Secret.Service";
const COLLECTION: &str = "org.freedesktop.Secret.Collection";
const ITEM: &str = "org.freedesktop.Secret.Item";
const PROMPT: &str = "org.freedesktop.Secret.Prompt";
const NO_PROMPT: &str = "/";

const SCHEMA: &str = "org.gnome.GVfs.Luks.Password";
const UUID: &str = "gvfs-luks-uuid";

type Secret = (OwnedObjectPath, Vec<u8>, Vec<u8>, String);

fn connection() -> Result<&'static Connection, String> {
    dbus::session()
}

fn call<R>(
    path: &str,
    interface: &str,
    method: &str,
    body: &(impl serde::Serialize + DynamicType),
) -> Result<R, String>
where
    R: for<'a> DynamicDeserialize<'a>,
{
    connection()?
        .call_method(Some(SERVICE), path, Some(interface), method, body)
        .and_then(|reply| reply.body().deserialize::<R>())
        .map_err(|error| error.to_string())
}

fn session() -> Result<OwnedObjectPath, String> {
    let (_, session): (OwnedValue, OwnedObjectPath) =
        call(ROOT, SECRETS, "OpenSession", &("plain", Value::from("")))?;
    Ok(session)
}

fn prompt(path: OwnedObjectPath) -> Result<Option<OwnedValue>, String> {
    if path.as_str() == NO_PROMPT {
        return Ok(None);
    }
    let proxy =
        Proxy::new(connection()?, SERVICE, path, PROMPT).map_err(|error| error.to_string())?;
    let mut completed = proxy
        .receive_signal("Completed")
        .map_err(|error| error.to_string())?;
    proxy
        .call_method("Prompt", &("",))
        .map_err(|error| error.to_string())?;
    let Some(signal) = completed.next() else {
        return Ok(None);
    };
    let (dismissed, result): (bool, OwnedValue) = signal
        .body()
        .deserialize()
        .map_err(|error| error.to_string())?;
    Ok((!dismissed).then_some(result))
}

fn items(uuid: &str) -> Result<Vec<OwnedObjectPath>, String> {
    let (mut unlocked, locked): (Vec<OwnedObjectPath>, Vec<OwnedObjectPath>) = call(
        ROOT,
        SECRETS,
        "SearchItems",
        &(HashMap::from([(UUID, uuid)]),),
    )?;
    if !locked.is_empty() {
        let (opened, waiting): (Vec<OwnedObjectPath>, OwnedObjectPath) =
            call(ROOT, SECRETS, "Unlock", &(&locked,))?;
        unlocked.extend(opened);
        if let Some(result) = prompt(waiting)? {
            unlocked.extend(Vec::<OwnedObjectPath>::try_from(result).unwrap_or_default());
        }
    }
    Ok(unlocked)
}

pub fn load(uuid: &str) -> Option<String> {
    let item = items(uuid).ok()?.into_iter().next()?;
    let session = session().ok()?;
    let (_, _, value, _): Secret = call(item.as_str(), ITEM, "GetSecret", &(&session,)).ok()?;
    String::from_utf8(value).ok()
}

pub fn store(uuid: &str, name: &str, passphrase: &str) -> Result<(), String> {
    delete(uuid);
    let session = session()?;
    let label = format!("Encryption passphrase for {name}");
    let attributes = HashMap::from([("xdg:schema", SCHEMA), (UUID, uuid)]);
    let properties = HashMap::from([
        (
            "org.freedesktop.Secret.Item.Label",
            Value::from(label.as_str()),
        ),
        (
            "org.freedesktop.Secret.Item.Attributes",
            Value::from(attributes),
        ),
    ]);
    let secret = (
        &session,
        Vec::<u8>::new(),
        passphrase.as_bytes(),
        "text/plain",
    );
    let (_, waiting): (OwnedObjectPath, OwnedObjectPath) = call(
        DEFAULT_COLLECTION,
        COLLECTION,
        "CreateItem",
        &(properties, secret, true),
    )?;
    prompt(waiting)?;
    Ok(())
}

pub fn delete(uuid: &str) {
    for item in items(uuid).unwrap_or_default() {
        if let Ok(waiting) = call::<OwnedObjectPath>(item.as_str(), ITEM, "Delete", &()) {
            let _ = prompt(waiting);
        }
    }
}
