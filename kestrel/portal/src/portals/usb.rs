use luft_dbus_macros::introspect;
use zbus::message::Header;
use zbus::{ObjectPath, OwnedVariant as OwnedValue};
use zbus::{fdo, interface};

use super::{Options, Response, SUCCESS, ended, owned};
use crate::context::Context;
use crate::request::while_open;

type Device = (String, Options, Options);

pub struct Usb {
    context: Context,
}

impl Usb {
    pub fn new(context: &Context) -> Self {
        Self {
            context: context.clone(),
        }
    }
}

fn granted(devices: Vec<Device>, chosen: &[String]) -> OwnedValue {
    let granted: Vec<(String, Options)> = devices
        .into_iter()
        .filter(|(id, _, _)| chosen.contains(id))
        .map(|(id, _, access)| (id, access))
        .collect();
    owned(granted)
}

#[introspect]
#[interface(name = "org.freedesktop.impl.portal.Usb")]
impl Usb {
    async fn acquire_devices(
        &self,
        handle: ObjectPath<'_>,
        _parent_window: &str,
        app_id: &str,
        devices: Vec<Device>,
        _options: Options,
        #[zbus(header)] header: Header<'_>,
    ) -> fdo::Result<Response> {
        self.context.allow(&header).await?;
        let shown: Vec<(String, Options)> = devices
            .iter()
            .map(|(id, info, _)| (id.clone(), info.clone()))
            .collect();
        let key = handle.as_str();
        let asked = self
            .context
            .shell
            .answer(|dialogs| async move { dialogs.choose_devices(key, app_id, &shown).await });
        Ok(match while_open(&self.context, &handle, asked).await {
            Some((SUCCESS, chosen)) => (
                SUCCESS,
                Options::from([("devices".into(), granted(devices, &chosen))]),
            ),
            Some((response, _)) => (response, Options::new()),
            None => ended(),
        })
    }

    #[zbus(property, name = "version")]
    fn version(&self) -> u32 {
        1
    }
}
