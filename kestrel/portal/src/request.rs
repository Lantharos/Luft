use zbus::ObjectPath;
use zbus::message::Header;
use zbus::{fdo, interface};

use crate::context::Context;

struct Request {
    handle: String,
    context: Context,
}

#[interface(name = "org.freedesktop.impl.portal.Request")]
impl Request {
    async fn close(&self, #[zbus(header)] header: Header<'_>) -> fdo::Result<()> {
        self.context.allow(&header).await?;
        self.context.shell.dismiss(&self.handle).await;
        Ok(())
    }
}

pub async fn while_open<T>(
    context: &Context,
    handle: &ObjectPath<'_>,
    asked: impl Future<Output = T>,
) -> T {
    let server = context.connection.object_server();
    let request = Request {
        handle: handle.to_string(),
        context: context.clone(),
    };
    let exported = matches!(server.at(handle, request).await, Ok(None));
    let answer = asked.await;
    if exported {
        let _ = server.remove::<Request, _>(handle).await;
    }
    answer
}
