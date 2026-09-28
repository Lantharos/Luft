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
}
