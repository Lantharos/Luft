use std::sync::Mutex;

use luft_app::camera::{Camera, Request};
use luft_app::{Commands, Empty};
use sabine::{BridgeCommand, BridgeResponse, BridgeResult, SabineWindow};

static CAMERA: Mutex<Option<Camera>> = Mutex::new(None);

const REQUEST: Request = Request {
    app_name: "Heft",
    app_id: "com.lantharos.Heft",
    size: (1280, 720),
    largest: (1920, 1080),
};

/// Opens the camera through the camera portal; false when the person said no.
async fn open(Empty {}: Empty) -> Result<bool, String> {
    let Some(camera) = Camera::open(REQUEST).await? else {
        return Ok(false);
    };
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
    Ok(BridgeResponse::bytes(
        frame.map(|frame| frame.into_bytes()).unwrap_or_default(),
    ))
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command_async("camera_open", open)
        .command("camera_close", close)
        .bridge_handler("camera_frame", frame)
}
