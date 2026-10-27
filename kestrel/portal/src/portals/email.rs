use std::fmt::Write;

use zbus::ObjectPath;
use zbus::message::Header;
use zbus::{fdo, interface};

use super::apps::handler_for_scheme;
use super::{Options, Response, SUCCESS, ended, option};
use crate::context::Context;

pub struct Email {
    context: Context,
}

impl Email {
    pub fn new(context: &Context) -> Self {
        Self {
            context: context.clone(),
        }
    }
}

#[interface(name = "org.freedesktop.impl.portal.Email")]
impl Email {
    async fn compose_email(
        &self,
        _handle: ObjectPath<'_>,
        _app_id: &str,
        _parent_window: &str,
        options: Options,
        #[zbus(header)] header: Header<'_>,
    ) -> fdo::Result<Response> {
        self.context.allow(&header).await?;
        let Some(mailer) = handler_for_scheme(&self.context.gio, "mailto").await else {
            return Ok(ended());
        };
        let uri = mailto_uri(&options);
        let launched = self
            .context
            .shell
            .answer(|dialogs| async move { dialogs.launch(&mailer, &[&uri]).await })
            .await;
        Ok(launched.map_or_else(ended, |()| (SUCCESS, Options::new())))
    }
}

fn escape(text: &str, allowed: &[u8]) -> String {
    let mut escaped = String::with_capacity(text.len());
    for &byte in text.as_bytes() {
        if byte.is_ascii_alphanumeric() || b"-._~".contains(&byte) || allowed.contains(&byte) {
            escaped.push(byte.into());
        } else {
            let _ = write!(escaped, "%{byte:02X}");
        }
    }
    escaped
}

fn addresses(addresses: &[String]) -> String {
    addresses
        .iter()
        .map(|address| escape(address, b"@"))
        .collect::<Vec<_>>()
        .join(",")
}

fn mailto_uri(options: &Options) -> String {
    let mut recipients: Vec<String> = option::<String>(options, "address").into_iter().collect();
    recipients.extend(option::<Vec<String>>(options, "addresses").unwrap_or_default());
    recipients.retain(|address| !address.is_empty());
    let mut fields = Vec::new();
    for key in ["cc", "bcc"] {
        let copied = option::<Vec<String>>(options, key).unwrap_or_default();
        if !copied.is_empty() {
            fields.push(format!("{key}={}", addresses(&copied)));
        }
    }
    for key in ["subject", "body"] {
        if let Some(text) = option::<String>(options, key).filter(|text| !text.is_empty()) {
            fields.push(format!("{key}={}", escape(&text, b"")));
        }
    }
    for path in option::<Vec<String>>(options, "attachments").unwrap_or_default() {
        fields.push(format!("attachment={}", escape(&path, b"/")));
    }
    let query = if fields.is_empty() {
        String::new()
    } else {
        format!("?{}", fields.join("&"))
    };
    format!("mailto:{}{query}", addresses(&recipients))
}
