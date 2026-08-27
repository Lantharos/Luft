use std::{
    env, fs, io,
    path::PathBuf,
    time::{SystemTime, UNIX_EPOCH},
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

use crate::capture::CaptureClient;

pub struct ScreenshotPortal;

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
        _: Option<MaybeAppID>,
        _: Option<WindowIdentifierType>,
        _: ScreenshotOptions,
    ) -> Result<Screenshot> {
        let path = tokio::task::spawn_blocking(capture_png)
            .await
            .map_err(|error| PortalError::Failed(error.to_string()))?
            .map_err(|error| PortalError::Failed(error.to_string()))?;
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

fn capture_png() -> std::result::Result<PathBuf, Box<dyn std::error::Error + Send + Sync>> {
    let mut client = CaptureClient::connect(false)?;
    let frame = client
        .capture(None)?
        .ok_or_else(|| io::Error::other("screenshot capture was cancelled"))?;
    let directory = screenshot_directory();
    fs::create_dir_all(&directory)?;
    let timestamp = SystemTime::now().duration_since(UNIX_EPOCH)?.as_millis();
    let path = directory.join(format!("Luft Screenshot {timestamp}.png"));
    let width = frame.width;
    let height = frame.height;
    let rgba = frame.into_rgba();
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
