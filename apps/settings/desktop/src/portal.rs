use std::collections::HashMap;

use zbus::blocking::{MessageIterator, Proxy};
use zbus::zvariant::{OwnedObjectPath, OwnedValue, Value};

use crate::dbus;

const PORTAL: &str = "org.freedesktop.portal.Desktop";
const PORTAL_PATH: &str = "/org/freedesktop/portal/desktop";

pub struct Filter<'a> {
    pub name: &'a str,
    pub patterns: Vec<String>,
}

fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
}

pub fn open_file(title: &str, filter: Filter) -> Result<Option<String>, String> {
    let connection = dbus::session()?;
    let chooser = Proxy::new(
        connection,
        PORTAL,
        PORTAL_PATH,
        "org.freedesktop.portal.FileChooser",
    )
    .map_err(failed)?;
    let token = format!("settings{}", std::process::id());
    let sender = connection
        .unique_name()
        .ok_or("Not connected to the session bus")?
        .trim_start_matches(':')
        .replace('.', "_");
    let handle = format!("{PORTAL_PATH}/request/{sender}/{token}");
    let rule = zbus::MatchRule::builder()
        .msg_type(zbus::message::Type::Signal)
        .interface("org.freedesktop.portal.Request")
        .map_err(failed)?
        .member("Response")
        .map_err(failed)?
        .path(handle.as_str())
        .map_err(failed)?
        .build();
    let mut responses = MessageIterator::for_match_rule(rule, connection, None).map_err(failed)?;
    let patterns: Vec<(u32, String)> = filter
        .patterns
        .into_iter()
        .map(|pattern| (0, pattern))
        .collect();
    let mut options: HashMap<&str, Value> = HashMap::new();
    options.insert("handle_token", Value::from(token.as_str()));
    options.insert("filters", Value::from(vec![(filter.name, patterns)]));
    let _: OwnedObjectPath = chooser
        .call("OpenFile", &("", title, options))
        .map_err(failed)?;
    let message = responses
        .next()
        .ok_or("The file chooser closed")?
        .map_err(failed)?;
    let (response, results): (u32, HashMap<String, OwnedValue>) =
        message.body().deserialize().map_err(failed)?;
    if response != 0 {
        return Ok(None);
    }
    let uris = results
        .get("uris")
        .cloned()
        .map(Vec::<String>::try_from)
        .transpose()
        .map_err(failed)?
        .unwrap_or_default();
    Ok(uris.into_iter().next())
}
