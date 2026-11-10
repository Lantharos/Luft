use std::sync::Mutex;
use std::time::{Duration, Instant};

use image::RgbImage;
use luft_app::camera::{Camera, Frame, Request};
use luft_app::{Commands, Empty};
use sabine::{BridgeCommand, BridgeResponse, BridgeResult, SabineWindow};

use crate::document::{self, Kind, Source};
use crate::imaging::{self, Origin, Quad};

const REQUEST: Request = Request {
    app_name: "Flatbed",
    app_id: crate::APP_ID,
    size: (3840, 2160),
    largest: (4096, 3072),
};

const LOOK_EVERY: Duration = Duration::from_millis(90);

struct Live {
    camera: Camera,
    latest: Option<Frame>,
    page: Option<Quad>,
    looked: Instant,
}

static LIVE: Mutex<Option<Live>> = Mutex::new(None);

async fn open(Empty {}: Empty) -> Result<bool, String> {
    let Some(camera) = Camera::open(REQUEST).await? else {
        return Ok(false);
    };
    *LIVE.lock().expect("camera lock") = Some(Live {
        camera,
        latest: None,
        page: None,
        looked: Instant::now() - LOOK_EVERY,
    });
    Ok(true)
}

fn close(Empty {}: Empty) -> Result<(), String> {
    LIVE.lock().expect("camera lock").take();
    Ok(())
}

fn pixels(frame: &Frame) -> Option<RgbImage> {
    if frame.is_jpeg() {
        return document::decode(frame.pixels()).ok();
    }
    let (width, height) = frame.size();
    let rgba = frame.pixels();
    Some(RgbImage::from_fn(width, height, |x, y| {
        let at = ((y * width + x) * 4) as usize;
        image::Rgb([rgba[at], rgba[at + 1], rgba[at + 2]])
    }))
}

fn frame(_: BridgeCommand) -> BridgeResult {
    let mut live = LIVE.lock().expect("camera lock");
    let Some(live) = live.as_mut() else {
        return Ok(BridgeResponse::bytes(Vec::new()));
    };
    let Some(frame) = live.camera.take_frame() else {
        return Ok(BridgeResponse::bytes(Vec::new()));
    };
    if live.looked.elapsed() >= LOOK_EVERY {
        live.looked = Instant::now();
        live.page =
            pixels(&frame).and_then(|picture| imaging::find_page(&imaging::small_grey(&picture)));
    }
    let corners = live.page.map_or([f32::NAN; 8], |Quad(corners)| {
        corners.as_flattened().try_into().expect("eight numbers")
    });
    let mut bytes: Vec<u8> = corners
        .iter()
        .flat_map(|value| value.to_le_bytes())
        .collect();
    bytes.extend_from_slice(frame.as_bytes());
    live.latest = Some(frame);
    Ok(BridgeResponse::bytes(bytes))
}

async fn capture(Empty {}: Empty) -> Result<String, String> {
    let frame = LIVE
        .lock()
        .expect("camera lock")
        .as_mut()
        .and_then(|live| live.latest.take())
        .ok_or("The camera hasn't shown anything yet")?;
    let source = if frame.is_jpeg() {
        Source::Encoded {
            bytes: frame.pixels().to_vec(),
            kind: Kind::Jpeg,
        }
    } else {
        Source::Pixels(pixels(&frame).ok_or("The camera's picture couldn't be read")?)
    };
    tokio::task::spawn_blocking(move || document::add(source, Origin::Camera, None))
        .await
        .map_err(|error| error.to_string())?
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command_async("camera_open", open)
        .command("camera_close", close)
        .command_async("camera_capture", capture)
        .bridge_handler("camera_frame", frame)
}
