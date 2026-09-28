use sabine::{BridgeError, SabineWindow};
use serde::Serialize;
use serde::de::DeserializeOwned;

use crate::events::Events;

pub type Handler<Req, Res> = fn(Req) -> Result<Res, String>;
pub type EventHandler<Req, Res> = fn(&Events, Req) -> Result<Res, String>;

pub trait Commands {
    fn command<Req: DeserializeOwned + 'static, Res: Serialize + 'static>(
        self,
        name: &str,
        handler: Handler<Req, Res>,
    ) -> Self;

    fn with_events<Req: DeserializeOwned + 'static, Res: Serialize + 'static>(
        self,
        name: &str,
        events: &Events,
        handler: EventHandler<Req, Res>,
    ) -> Self;
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

    fn with_events<Req: DeserializeOwned + 'static, Res: Serialize + 'static>(
        self,
        name: &str,
        events: &Events,
        handler: EventHandler<Req, Res>,
    ) -> Self {
        let events = events.clone();
        self.bridge_typed(name, move |request| {
            handler(&events, request).map_err(BridgeError::new)
        })
    }
}
