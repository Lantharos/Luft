pub mod events;

use std::future::Future;

use sabine::{BridgeError, SabineWindow};
use serde::Serialize;
use serde::de::DeserializeOwned;

pub type Handler<Req, Res> = fn(Req) -> Result<Res, String>;
pub type ContextHandler<C, Req, Res> = fn(&C, Req) -> Result<Res, String>;

pub trait Commands {
    fn command<Req: DeserializeOwned + 'static, Res: Serialize + 'static>(
        self,
        name: &str,
        handler: Handler<Req, Res>,
    ) -> Self;

    fn with<C, Req, Res>(
        self,
        name: &str,
        context: &C,
        handler: ContextHandler<C, Req, Res>,
    ) -> Self
    where
        C: Clone + Send + Sync + 'static,
        Req: DeserializeOwned + 'static,
        Res: Serialize + 'static;

    /// A command whose handler is awaited on Sabine's async runtime, for
    /// work that waits on D-Bus or other I/O.
    fn command_async<Req, Res, F, Fut>(self, name: &str, handler: F) -> Self
    where
        Req: DeserializeOwned + 'static,
        Res: Serialize + 'static,
        F: Fn(Req) -> Fut + Send + Sync + 'static,
        Fut: Future<Output = Result<Res, String>> + Send + 'static;

    /// An async command that gets its own copy of `context`.
    fn with_async<C, Req, Res, F, Fut>(self, name: &str, context: &C, handler: F) -> Self
    where
        C: Clone + Send + Sync + 'static,
        Req: DeserializeOwned + 'static,
        Res: Serialize + 'static,
        F: Fn(C, Req) -> Fut + Send + Sync + 'static,
        Fut: Future<Output = Result<Res, String>> + Send + 'static;
}

impl Commands for SabineWindow {
    fn command<Req: DeserializeOwned + 'static, Res: Serialize + 'static>(
        self,
        name: &str,
        handler: Handler<Req, Res>,
    ) -> Self {
        self.bridge_typed(name, move |request| {
            handler(request).map_err(BridgeError::new)
        })
    }

    fn with<C, Req, Res>(
        self,
        name: &str,
        context: &C,
        handler: ContextHandler<C, Req, Res>,
    ) -> Self
    where
        C: Clone + Send + Sync + 'static,
        Req: DeserializeOwned + 'static,
        Res: Serialize + 'static,
    {
        let context = context.clone();
        self.bridge_typed(name, move |request| {
            handler(&context, request).map_err(BridgeError::new)
        })
    }

    fn command_async<Req, Res, F, Fut>(self, name: &str, handler: F) -> Self
    where
        Req: DeserializeOwned + 'static,
        Res: Serialize + 'static,
        F: Fn(Req) -> Fut + Send + Sync + 'static,
        Fut: Future<Output = Result<Res, String>> + Send + 'static,
    {
        self.bridge_typed_async(name, move |request| {
            let answer = handler(request);
            async move { answer.await.map_err(BridgeError::new) }
        })
    }

    fn with_async<C, Req, Res, F, Fut>(self, name: &str, context: &C, handler: F) -> Self
    where
        C: Clone + Send + Sync + 'static,
        Req: DeserializeOwned + 'static,
        Res: Serialize + 'static,
        F: Fn(C, Req) -> Fut + Send + Sync + 'static,
        Fut: Future<Output = Result<Res, String>> + Send + 'static,
    {
        let context = context.clone();
        self.command_async(name, move |request| handler(context.clone(), request))
    }
}
