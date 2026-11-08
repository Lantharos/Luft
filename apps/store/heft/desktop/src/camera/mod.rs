mod frame;
mod stream;

use std::sync::Mutex;

use luft_app::portal;
use luft_app::{Commands, Empty};
use sabine::{BridgeCommand, BridgeResponse, BridgeResult, SabineWindow};

use stream::Camera;

static CAMERA: Mutex<Option<Camera>> = Mutex::new(None);

/// Opens the camera through the camera portal; false when the person said no.
async fn open(Empty {}: Empty) -> Result<bool, String> {
    let Some(remote) = portal::camera().await? else {
        return Ok(false);
    };
    let camera = Camera::open(remote.into())?;
    *CAMERA.lock().expect("camera lock") = Some(camera);
    Ok(true)
}

fn close(Empty {}: Empty) -> Result<(), String> {
    CAMERA.lock().expect("camera lock").take();
    Ok(())
}

fn frame(_: BridgeCommand) -> BridgeResult {
    let frame = CAMERA
        .lock()
        .expect("camera lock")
        .as_ref()
        .and_then(Camera::take_frame);
    Ok(BridgeResponse::bytes(frame.unwrap_or_default()))
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command_async("camera_open", open)
        .command("camera_close", close)
        .bridge_handler("camera_frame", frame)
}
