use zbus::message::Header;
use zbus::{ObjectPath, OwnedVariant as OwnedValue, Variant as Value};
use zbus::{fdo, interface};

use super::{ENDED, Options, Response, SUCCESS, ended, owned};
use crate::context::Context;
use crate::request::while_open;

const APPLICATION: u32 = 1;
const WEB_APPLICATION: u32 = 2;
const TRUSTED_INSTALLERS: [&str; 1] = ["com.lantharos.schelf"];

pub struct DynamicLauncher {
    context: Context,
}

impl DynamicLauncher {
    pub fn new(context: &Context) -> Self {
        Self {
            context: context.clone(),
        }
    }
}

#[interface(name = "org.freedesktop.impl.portal.DynamicLauncher")]
impl DynamicLauncher {
    #[allow(clippy::too_many_arguments)]
    async fn prepare_install(
        &self,
        handle: ObjectPath<'_>,
        app_id: &str,
        _parent_window: &str,
        name: &str,
        icon: OwnedValue,
        options: Options,
        #[zbus(header)] header: Header<'_>,
    ) -> fdo::Result<Response> {
        self.context.allow(&header).await?;
        let (key, shown) = (handle.as_str(), &icon);
        let asked = self.context.shell.answer(|dialogs| async move {
            dialogs
                .add_launcher(key, app_id, name, shown, &options)
                .await
        });
        Ok(match while_open(&self.context, &handle, asked).await {
            Some((SUCCESS, name)) => (
                SUCCESS,
                Options::from([
                    ("name".into(), owned(name)),
                    ("icon".into(), owned(Value::Variant(Box::new(icon.into())))),
                ]),
            ),
            Some((response, _)) => (response, Options::new()),
            None => ended(),
        })
    }

    async fn request_install_token(
        &self,
        app_id: &str,
        _options: Options,
        #[zbus(header)] header: Header<'_>,
    ) -> fdo::Result<u32> {
        self.context.allow(&header).await?;
        Ok(if TRUSTED_INSTALLERS.contains(&app_id) {
            SUCCESS
        } else {
            ENDED
        })
    }

    #[zbus(property, name = "SupportedLauncherTypes")]
    fn supported_launcher_types(&self) -> u32 {
        APPLICATION | WEB_APPLICATION
    }

    #[zbus(property, name = "version")]
    fn version(&self) -> u32 {
        1
    }
}
