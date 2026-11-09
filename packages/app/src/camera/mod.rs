mod frame;
mod stream;

pub use frame::Frame;
pub use stream::{Camera, Request};

use crate::portal;

impl Camera {
    /// Asks to use the camera through the camera portal and starts it, or
    /// `None` when the person said no.
    pub async fn open(request: Request) -> Result<Option<Self>, String> {
        let Some(remote) = portal::camera().await? else {
            return Ok(None);
        };
        Self::start(remote.into(), request).map(Some)
    }
}
