use luft_dbus_macros::introspect;
use zbus::ObjectPath;
use zbus::message::Header;
use zbus::{fdo, interface};

use super::{Options, Response, ended, option};
use crate::context::Context;
use crate::request::while_open;

pub struct Account {
    context: Context,
}

impl Account {
    pub fn new(context: &Context) -> Self {
        Self {
            context: context.clone(),
        }
    }
}

#[introspect]
#[interface(name = "org.freedesktop.impl.portal.Account")]
impl Account {
    async fn get_user_information(
        &self,
        handle: ObjectPath<'_>,
        app_id: &str,
        _parent_window: &str,
        options: Options,
        #[zbus(header)] header: Header<'_>,
    ) -> fdo::Result<Response> {
        self.context.allow(&header).await?;
        let reason = option::<String>(&options, "reason").unwrap_or_default();
        let key = handle.as_str();
        let asked = self
            .context
            .shell
            .answer(|dialogs| async move { dialogs.share_account(key, app_id, &reason).await });
        Ok(while_open(&self.context, &handle, asked)
            .await
            .unwrap_or_else(ended))
    }
}
