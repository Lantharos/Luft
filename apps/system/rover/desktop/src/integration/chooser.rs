use std::collections::HashMap;
use std::sync::atomic::{AtomicU32, Ordering};
use std::sync::{Arc, OnceLock};

use parking_lot::Mutex;
use sabine::{SabineProcessHandle, SabineWindow};
use serde::Serialize;
use specta::Type;
use tokio::sync::oneshot;

use crate::APP_NAME;

#[derive(Debug, Clone, Copy, Serialize, PartialEq, Type)]
#[serde(rename_all = "snake_case")]
pub enum ChooserMode {
    Open,
    Save,
    SaveFiles,
}

#[derive(Debug, Clone, Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct ChooserFilter {
    pub name: String,
    pub patterns: Vec<String>,
    pub mime_types: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct ChooserConfig {
    pub mode: ChooserMode,
    pub title: String,
    pub accept_label: String,
    pub directory: bool,
    pub multiple: bool,
    pub current_folder: Option<String>,
    pub current_name: Option<String>,
    pub files: Vec<String>,
    pub filters: Vec<ChooserFilter>,
    pub filter: Option<u32>,
}

#[derive(Debug, Default)]
pub struct ChooserResponse {
    pub accepted: bool,
    pub paths: Vec<String>,
    pub filter: Option<u32>,
}

/// The file choosers Rover shows for other apps, each in a window of its
/// own, all served by the one process that answers the desktop portal.
#[derive(Clone, Default)]
pub struct Choosers {
    inner: Arc<Inner>,
}

#[derive(Default)]
struct Inner {
    process: OnceLock<SabineProcessHandle>,
    last_request: AtomicU32,
    open: Mutex<HashMap<u32, Open>>,
}

struct Open {
    config: ChooserConfig,
    answer: oneshot::Sender<ChooserResponse>,
}

impl Choosers {
    pub fn attach(&self, process: SabineProcessHandle) {
        let _ = self.inner.process.set(process);
    }

    /// Opens a chooser over the window `parent` names, and calls `closed`
    /// with the chooser's request once its window is gone.
    pub fn open(
        &self,
        config: ChooserConfig,
        parent: &str,
        closed: impl Fn(u32) + Send + Sync + 'static,
    ) -> Result<oneshot::Receiver<ChooserResponse>, String> {
        let process = self.inner.process.get().ok_or("Rover is still starting")?;
        let request = self.inner.last_request.fetch_add(1, Ordering::Relaxed) + 1;
        let title = Some(config.title.as_str())
            .filter(|title| !title.is_empty())
            .unwrap_or(APP_NAME);
        let window = SabineWindow::for_current_app().map_err(|error| error.to_string())?;
        let mut window = crate::glass_window(window, title, None)
            .content_suffix(format!("#chooser/{request}"))
            .modal(true)
            .on_closed(move |_| closed(request));
        if !parent.is_empty() {
            window = window.parent_window(parent);
        }
        let (answer, answered) = oneshot::channel();
        self.inner
            .open
            .lock()
            .insert(request, Open { config, answer });
        if let Err(error) = process.open_window(window) {
            self.inner.open.lock().remove(&request);
            return Err(error.to_string());
        }
        Ok(answered)
    }

    pub fn config(&self, request: u32) -> Result<ChooserConfig, String> {
        self.inner
            .open
            .lock()
            .get(&request)
            .map(|open| open.config.clone())
            .ok_or_else(|| "This file chooser has already closed".to_string())
    }

    /// Answers a chooser. Only its first answer counts, so a window closing
    /// after its page answered changes nothing.
    pub fn respond(&self, request: u32, response: ChooserResponse) {
        if let Some(open) = self.inner.open.lock().remove(&request) {
            let _ = open.answer.send(response);
        }
    }
}
