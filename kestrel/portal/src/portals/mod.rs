mod account;
mod app_chooser;
mod apps;
mod dynamic_launcher;
mod email;
mod lockdown;
mod print;
mod usb;
mod wallpaper;

use std::collections::HashMap;

use zbus::{OwnedVariant as OwnedValue, Variant as Value};

use crate::context::Context;

pub const PATH: &str = "/org/freedesktop/portal/desktop";
pub const SUCCESS: u32 = 0;
pub const ENDED: u32 = 2;

pub type Options = HashMap<String, OwnedValue>;
pub type Response = (u32, Options);

pub async fn serve(context: &Context) -> zbus::Result<()> {
    let server = context.connection.object_server();
    server.at(PATH, account::Account::new(context)).await?;
    server
        .at(PATH, app_chooser::AppChooser::new(context))
        .await?;
    server
        .at(PATH, dynamic_launcher::DynamicLauncher::new(context))
        .await?;
    server.at(PATH, email::Email::new(context)).await?;
    server.at(PATH, print::Print::new(context)).await?;
    server.at(PATH, usb::Usb::new(context)).await?;
    server.at(PATH, wallpaper::Wallpaper::new(context)).await?;
    lockdown::serve(context).await
}

pub fn option<T: TryFrom<OwnedValue>>(options: &Options, key: &str) -> Option<T> {
    options
        .get(key)
        .cloned()
        .and_then(|value| T::try_from(value).ok())
}

pub fn owned(value: impl Into<Value<'static>>) -> OwnedValue {
    value
        .into()
        .try_into_owned()
        .expect("plain values have no file descriptors")
}

pub fn ended() -> Response {
    (ENDED, Options::new())
}
