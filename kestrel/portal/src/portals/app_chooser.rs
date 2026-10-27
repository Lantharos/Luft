use zbus::ObjectPath;
use zbus::message::Header;
use zbus::{fdo, interface};

use super::{Options, Response, SUCCESS, ended, owned};
use crate::context::Context;
use crate::request::while_open;

pub struct AppChooser {
    context: Context,
}

impl AppChooser {
    pub fn new(context: &Context) -> Self {
        Self {
            context: context.clone(),
        }
    }
}

#[interface(name = "org.freedesktop.impl.portal.AppChooser")]
impl AppChooser {
    async fn choose_application(
        &self,
        handle: ObjectPath<'_>,
        _app_id: &str,
        _parent_window: &str,
        choices: Vec<String>,
        options: Options,
        #[zbus(header)] header: Header<'_>,
    ) -> fdo::Result<Response> {
        self.context.allow(&header).await?;
        let key = handle.as_str();
        let asked = self.context.shell.answer(|dialogs| async move {
            dialogs.choose_application(key, &choices, &options).await
        });
        Ok(match while_open(&self.context, &handle, asked).await {
            Some((SUCCESS, choice)) => (SUCCESS, Options::from([("choice".into(), owned(choice))])),
            Some((response, _)) => (response, Options::new()),
            None => ended(),
        })
    }

    async fn update_choices(
        &self,
        handle: ObjectPath<'_>,
        choices: Vec<String>,
        #[zbus(header)] header: Header<'_>,
    ) -> fdo::Result<()> {
        self.context.allow(&header).await?;
        self.context
            .shell
            .answer(|dialogs| async move { dialogs.update_choices(&handle, &choices).await })
            .await;
        Ok(())
    }
}
