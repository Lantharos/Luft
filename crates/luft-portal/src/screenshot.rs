use std::{
    env, fs, io,
    path::PathBuf,
    sync::{
        Arc,
        atomic::{AtomicBool, Ordering},
    },
    time::{Duration, SystemTime, UNIX_EPOCH},
};

use ashpd::{
    MaybeAppID, PortalError, Uri, WindowIdentifierType,
    backend::{Result, request::RequestImpl, screenshot::ScreenshotImpl},
    desktop::{
        Color, HandleToken,
        screenshot::{AvailableTargets, ColorOptions, Screenshot, ScreenshotOptions},
    },
};
use enumflags2::BitFlags;
use wayland_client::Connection;

use crate::{
    capture::CaptureClient,
    consent::{ConsentOutcome, RequestCancellation, request_consent},
};

#[derive(Clone)]
pub struct ScreenshotPortal {
    wayland: Connection,
}

impl ScreenshotPortal {
    pub fn new(wayland: Connection) -> Self {
        Self { wayland }
    }
}

#[async_trait::async_trait]
impl RequestImpl for ScreenshotPortal {
    async fn close(&self, _: HandleToken) {}
}

#[async_trait::async_trait]
impl ScreenshotImpl for ScreenshotPortal {
    fn available_targets(&self) -> BitFlags<AvailableTargets> {
        AvailableTargets::Screen.into()
    }

    async fn screenshot(
        &self,
        _: HandleToken,
        app_id: Option<MaybeAppID>,
        _: Option<WindowIdentifierType>,
        _: ScreenshotOptions,
    ) -> Result<Screenshot> {
        let mut cancellation = RequestCancellation::new();
        let cancelled = cancellation.flag();
        let wayland = self.wayland.clone();
        let result = tokio::task::spawn_blocking(move || {
            let app_id = app_id
                .map(|value| value.to_string())
                .filter(|value| !value.trim().is_empty());
            match request_consent(luft_ipc::CaptureKind::Screenshot, app_id, &cancelled)? {
                ConsentOutcome::Granted(output) => {
                    match capture_png(wayland, &output, &cancelled) {
                        Ok(path) => Ok(Some(path)),
                        Err(_) if cancelled.load(Ordering::Acquire) => Ok(None),
                        Err(error) => Err(error),
                    }
                }
                ConsentOutcome::Denied | ConsentOutcome::Cancelled | ConsentOutcome::TimedOut => {
                    Ok(None)
                }
            }
        })
        .await
        .map_err(|error| PortalError::Failed(error.to_string()))?;
        cancellation.disarm();
        let path = result
            .map_err(|error| PortalError::Failed(error.to_string()))?
            .ok_or_else(|| PortalError::Cancelled("screen capture was cancelled".into()))?;
        let uri = url::Url::from_file_path(&path)
            .map_err(|()| PortalError::Failed("failed to create screenshot URI".into()))?;
        Ok(Screenshot::new(
            Uri::parse(uri.as_str()).map_err(|error| PortalError::Failed(error.to_string()))?,
        ))
    }

    async fn pick_color(
        &self,
        _: HandleToken,
        _: Option<MaybeAppID>,
        _: Option<WindowIdentifierType>,
        _: ColorOptions,
    ) -> Result<Color> {
        Err(PortalError::NotAllowed(
            "Luft does not advertise color picking".into(),
        ))
    }
}

fn capture_png(
    wayland: Connection,
    output: &str,
    cancelled: &Arc<AtomicBool>,
) -> std::result::Result<PathBuf, Box<dyn std::error::Error + Send + Sync>> {
    let mut client = CaptureClient::connect(wayland, output, false)?;
    if !client.capture(Some(cancelled), Duration::from_secs(5))? {
        return Err(
            io::Error::new(io::ErrorKind::Interrupted, "screenshot capture cancelled").into(),
        );
    }
    let directory = screenshot_directory();
    fs::create_dir_all(&directory)?;
    let timestamp = SystemTime::now().duration_since(UNIX_EPOCH)?.as_millis();
    let path = directory.join(format!("Luft Screenshot {timestamp}.png"));
    let (width, height) = client.size();
    let rgba = client.rgba();
    image::save_buffer_with_format(
        &path,
        &rgba,
        width,
        height,
        image::ColorType::Rgba8,
        image::ImageFormat::Png,
    )?;
    Ok(path)
}

fn screenshot_directory() -> PathBuf {
    env::var_os("XDG_PICTURES_DIR")
        .map(PathBuf::from)
        .or_else(|| env::var_os("HOME").map(|home| PathBuf::from(home).join("Pictures")))
        .or_else(|| env::var_os("XDG_RUNTIME_DIR").map(PathBuf::from))
        .unwrap_or_else(env::temp_dir)
}
