use std::borrow::Cow;
use std::collections::HashMap;

use zbus::Variant;
use zbus::fdo::Properties;
use zbus::names::InterfaceName;
use zbus::object_server::SignalEmitter;

pub async fn changed(
    emitter: &SignalEmitter<'_>,
    interface: &'static str,
    name: &str,
    value: Variant<'_>,
) -> zbus::Result<()> {
    let interface = InterfaceName::from_static_str_unchecked(interface);
    Properties::properties_changed(
        emitter,
        interface,
        HashMap::from([(name, value)]),
        Cow::Borrowed(&[]),
    )
    .await
}
