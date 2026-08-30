use super::{
    actions::WebShellAction,
    model::{WebShellSnapshot, WebShellSurface},
    surface_layout::{panel_output_width, shell_surface},
    surface_motion::shell_blur_region,
};
use sabine::{
    BridgeCommandDescriptor, BridgeError, BridgeResponse, ContentSecurity, RuntimeConfig,
    RuntimeMode, SabineProcess, SabineWindow, ShellSurfaceMargin, ShellSurfaceOptions,
    ShellSurfaceVisibilityRequest, ShellSurfaceVisibilityState,
};
use serde_json::{Map, Value, json};
use std::{
    env,
    error::Error,
    path::PathBuf,
    sync::{Arc, Mutex, mpsc::Sender},
    time::{Duration, Instant},
};
use tracing::{debug, warn};

const VISIBILITY_ACK_TIMEOUT: Duration = Duration::from_millis(250);
const VISIBILITY_RETRY_LIMIT: u8 = 3;

pub struct WebSurface {
    kind: WebShellSurface,
    pub(crate) size: (i32, i32),
    actions_tx: Sender<WebShellAction>,
    snapshot: Arc<Mutex<WebShellSnapshot>>,
    pub(crate) visible: bool,
    keep_alive_when_hidden: bool,
    panel_menu_x: Option<i32>,
    session_menu_qs_height: Option<i32>,
    process: Option<SabineProcess>,
    visibility_request: Option<ShellSurfaceVisibilityRequest>,
    visibility_requested_at: Option<Instant>,
    visibility_attempts: u8,
    mapped: Option<bool>,
    surface_alpha: f32,
    pub(crate) shell_margin: ShellSurfaceMargin,
    pending_snapshot: String,
    rendered_snapshot: String,
    rendered_value: Option<Value>,
    snapshot_revision: u64,
}

impl WebSurface {
    pub(crate) fn new(config: WebSurfaceConfig<'_>) -> Result<Self, Box<dyn Error>> {
        let initial = serde_json::to_string(config.snapshot)?;
        let shell_margin = shell_surface(
            config.kind,
            config.size,
            config.panel_menu_x,
            config.session_menu_qs_height,
        )
        .margin;
        let mut surface = Self {
            kind: config.kind,
            size: config.size,
            actions_tx: config.actions_tx.clone(),
            snapshot: Arc::new(Mutex::new(config.snapshot.clone())),
            visible: false,
            keep_alive_when_hidden: config.keep_alive_when_hidden,
            panel_menu_x: config.panel_menu_x,
            session_menu_qs_height: config.session_menu_qs_height,
            process: None,
            visibility_request: None,
            visibility_requested_at: None,
            visibility_attempts: 0,
            mapped: None,
            surface_alpha: if config.visible { 1.0 } else { 0.0 },
            shell_margin,
            pending_snapshot: initial,
            rendered_snapshot: String::new(),
            rendered_value: None,
            snapshot_revision: 0,
        };
        surface.set_visible(config.visible);
        Ok(surface)
    }

    pub fn set_visible(&mut self, visible: bool) {
        self.set_visible_with_alpha(visible, 1.0);
    }

    pub(crate) fn set_visible_with_alpha(&mut self, visible: bool, alpha: f32) {
        if self.visible == visible {
            if visible {
                self.set_surface_alpha(alpha);
            }
            self.ensure_visibility_request();
            return;
        }
        self.visible = visible;
        self.visibility_attempts = 0;
        if visible {
            self.show_process(alpha);
        } else {
            self.hide_process();
        }
    }

    pub fn resize(&mut self, size: (i32, i32)) {
        if self.size == size {
            return;
        }
        self.size = size;
        if let Some(process) = &self.process {
            let _ = process.set_shell_surface_size(size.0.max(1) as u32, size.1.max(1) as u32);
        }
        self.set_shell_margin(self.base_shell_margin());
    }

    pub(crate) fn set_panel_menu_x(&mut self, x: Option<i32>) {
        if self.panel_menu_x == x {
            return;
        }
        self.panel_menu_x = x;
        self.set_shell_margin(self.base_shell_margin());
    }

    pub(crate) fn set_session_menu_qs_height(&mut self, height: Option<i32>) {
        if self.session_menu_qs_height == height {
            return;
        }
        self.session_menu_qs_height = height;
    }

    pub(crate) fn evaluate_snapshot(&mut self, snapshot: &WebShellSnapshot) {
        if let Ok(mut current) = self.snapshot.lock() {
            *current = snapshot.clone();
        }
        if let Ok(json) = serde_json::to_string(snapshot)
            && self.pending_snapshot != json
        {
            self.pending_snapshot = json;
        }
        self.flush_snapshot();
    }

    fn launch(&mut self) {
        if self.process.is_some() {
            self.flush_snapshot();
            return;
        }

        let window = self.build_window();
        match window.launch() {
            Ok(process) => {
                self.visibility_request = None;
                self.visibility_requested_at = None;
                self.visibility_attempts = 0;
                self.mapped = None;
                debug!(
                    pid = process.id(),
                    surface = self.kind.as_str(),
                    "launched Sabine shell surface"
                );
                self.process = Some(process);
                let _ = self.request_visibility(self.visible);
            }
            Err(error) => {
                warn!(%error, surface = self.kind.as_str(), "failed to launch Sabine shell surface");
            }
        }
    }

    pub(crate) fn prewarm(&mut self) {
        if self.process.is_none() {
            self.launch();
        }
        if !self.visible {
            self.hide_process();
        }
    }

    fn show_process(&mut self, alpha: f32) {
        let had_process = self.process.is_some();
        if had_process {
            self.set_surface_alpha(alpha);
        }
        let restored = self.request_visibility(true);
        if had_process && !restored {
            self.process = None;
            self.visibility_request = None;
            self.visibility_requested_at = None;
            self.mapped = None;
            self.rendered_snapshot.clear();
            self.rendered_value = None;
            self.snapshot_revision = 0;
        }
        if self.process.is_none() {
            self.launch();
            self.set_surface_alpha(alpha);
            self.flush_snapshot();
            return;
        }
        self.flush_snapshot();
    }

    fn hide_process(&mut self) {
        self.set_surface_alpha(0.0);
        if !self.keep_alive_when_hidden {
            self.process = None;
            self.visibility_request = None;
            self.visibility_requested_at = None;
            self.visibility_attempts = 0;
            self.mapped = Some(false);
            self.rendered_snapshot.clear();
            self.rendered_value = None;
            self.snapshot_revision = 0;
            return;
        }
        if self.process.is_none() || self.request_visibility(false) {
            return;
        }
        self.process = None;
        self.visibility_request = None;
        self.visibility_requested_at = None;
        self.mapped = None;
        self.rendered_snapshot.clear();
        self.rendered_value = None;
        self.snapshot_revision = 0;
    }

    pub(crate) fn release_hidden_process(&mut self) {
        if self.visible {
            return;
        }
        if self.process.take().is_some() {
            self.visibility_request = None;
            self.visibility_requested_at = None;
            self.mapped = None;
            self.rendered_snapshot.clear();
            self.rendered_value = None;
            self.snapshot_revision = 0;
        }
    }

    pub(crate) fn tick_visibility(&mut self) {
        self.flush_snapshot();
        let Some(request) = self.visibility_request.as_ref() else {
            self.ensure_visibility_request();
            return;
        };
        let (state, requested_visible, request_id) =
            (request.state(), request.requested_visible(), request.id());
        if state == ShellSurfaceVisibilityState::Pending {
            let timed_out = self
                .visibility_requested_at
                .is_some_and(|started| started.elapsed() >= VISIBILITY_ACK_TIMEOUT);
            if !timed_out {
                return;
            }
            if self.visibility_attempts < VISIBILITY_RETRY_LIMIT
                && self.request_visibility(self.visible)
            {
                warn!(
                    surface = self.kind.as_str(),
                    request_id,
                    requested_visible,
                    attempt = self.visibility_attempts,
                    "retrying stalled Sabine shell visibility request"
                );
                return;
            }
            warn!(
                surface = self.kind.as_str(),
                request_id,
                requested_visible,
                "restarting shell surface after stalled visibility requests"
            );
            self.restart_process();
            return;
        }
        self.visibility_request = None;
        self.visibility_requested_at = None;
        let completed = matches!(
            (requested_visible, state),
            (true, ShellSurfaceVisibilityState::Mapped)
                | (false, ShellSurfaceVisibilityState::Unmapped)
        );
        if completed {
            self.mapped = Some(requested_visible);
            self.visibility_attempts = 0;
            debug!(
                surface = self.kind.as_str(),
                request_id,
                requested_visible,
                ?state,
                "Sabine shell visibility request completed"
            );
            self.ensure_visibility_request();
            return;
        }
        warn!(
            surface = self.kind.as_str(),
            requested_visible,
            ?state,
            "Sabine shell visibility request failed"
        );
        self.restart_process();
    }

    pub(crate) fn set_surface_alpha(&mut self, alpha: f32) {
        let alpha = alpha.clamp(0.0, 1.0);
        self.surface_alpha = alpha;
        if let Some(process) = &self.process {
            let _ = process.set_shell_surface_alpha(self.surface_alpha);
        }
    }

    pub(crate) fn set_shell_margin(&mut self, margin: ShellSurfaceMargin) {
        if self.shell_margin == margin {
            return;
        }
        self.shell_margin = margin;
        if let Some(process) = &self.process {
            let _ = process.set_shell_surface_margin(margin);
        }
    }

    pub(crate) fn base_shell_margin(&self) -> ShellSurfaceMargin {
        shell_surface(
            self.kind,
            self.size,
            self.panel_menu_x,
            self.session_menu_qs_height,
        )
        .margin
    }

    fn build_window(&self) -> SabineWindow {
        let snapshot = Arc::clone(&self.snapshot);
        let action_tx = self.actions_tx.clone();
        let kind = self.kind;
        let shell_options = shell_surface(
            kind,
            self.size,
            self.panel_menu_x,
            self.session_menu_qs_height,
        )
        .margin(self.shell_margin);
        let (width, height) = cef_initial_size(&shell_options, self.size);
        let window = SabineWindow::new()
            .app_id("net.aveid.luft.shell")
            .title(format!("Luft {}", kind.as_str()))
            .fixed_size(width, height)
            .frameless()
            .glass()
            .always_on_top(true)
            .shell_surface(shell_options)
            .shell_surface_alpha(self.surface_alpha)
            .visible(self.visible)
            .active(self.visible && kind == WebShellSurface::StartMenu)
            .active_frame_rate(shell_surface_frame_rate())
            .background_frame_rate(1)
            .blur_region(shell_blur_region(kind, width as i32, height as i32))
            .runtime(runtime_config())
            .security(ContentSecurity::default())
            .bridge_descriptor_handler(
                BridgeCommandDescriptor::new("luft.ready").target("desktop"),
                move |_| {
                    let snapshot = snapshot
                        .lock()
                        .map_err(|_| BridgeError::new("failed to read luft shell snapshot"))?;
                    Ok(BridgeResponse::json(json!({
                        "surface": kind.as_str(),
                        "snapshot": &*snapshot,
                    })))
                },
            )
            .bridge_descriptor_handler(
                BridgeCommandDescriptor::new("luft.action").target("desktop"),
                move |command| match serde_json::from_value::<WebShellAction>(command.params) {
                    Ok(action) => {
                        action_tx
                            .send(action)
                            .map_err(|_| BridgeError::new("luft shell action channel closed"))?;
                        Ok(BridgeResponse::json(json!({ "ok": true })))
                    }
                    Err(error) => Err(BridgeError::new(format!(
                        "invalid luft shell action: {error}"
                    ))),
                },
            );

        match shell_entry(kind) {
            ShellEntry::Dev(url) => window.dev_url(url),
            ShellEntry::File(path) => window.entry(path),
        }
    }

    fn flush_snapshot(&mut self) {
        if self.pending_snapshot == self.rendered_snapshot {
            return;
        }
        let Some(process) = &self.process else {
            return;
        };
        let Ok(snapshot) = self.snapshot.lock() else {
            return;
        };
        let Ok(value) = serde_json::to_value(&*snapshot) else {
            return;
        };
        let revision = self.snapshot_revision.saturating_add(1);
        let (event, payload) = match &self.rendered_value {
            Some(rendered) => (
                "luft.patch",
                json!({
                    "revision": revision,
                    "changes": top_level_patch(rendered, &value),
                }),
            ),
            None => ("luft.snapshot", value.clone()),
        };
        if process.emit_bridge_event(event, payload) {
            self.rendered_snapshot.clone_from(&self.pending_snapshot);
            self.rendered_value = Some(value);
            self.snapshot_revision = revision;
        }
    }

    pub(crate) fn emit_surface_open(&self) {
        let Some(process) = &self.process else {
            return;
        };
        let _ = process.emit_bridge_event(
            "luft.surface-open",
            json!({ "surface": self.kind.as_str() }),
        );
    }

    pub(crate) fn emit_surface_close(&self) {
        let Some(process) = &self.process else {
            return;
        };
        let _ = process.emit_bridge_event(
            "luft.surface-close",
            json!({ "surface": self.kind.as_str() }),
        );
    }

    fn request_visibility(&mut self, visible: bool) -> bool {
        let Some(request) = self
            .process
            .as_ref()
            .and_then(|process| process.set_shell_surface_visible(visible))
        else {
            return false;
        };
        let request_id = request.id();
        self.visibility_request = Some(request);
        self.visibility_requested_at = Some(Instant::now());
        self.visibility_attempts = self.visibility_attempts.saturating_add(1);
        debug!(
            surface = self.kind.as_str(),
            request_id,
            visible,
            attempt = self.visibility_attempts,
            "queued Sabine shell visibility request"
        );
        true
    }

    fn ensure_visibility_request(&mut self) {
        if self.process.is_none() || self.mapped == Some(self.visible) {
            return;
        }
        if self
            .visibility_request
            .as_ref()
            .is_some_and(|request| request.requested_visible() == self.visible)
        {
            return;
        }
        if !self.request_visibility(self.visible) {
            self.restart_process();
        }
    }

    fn restart_process(&mut self) {
        self.process = None;
        self.visibility_request = None;
        self.visibility_requested_at = None;
        self.visibility_attempts = 0;
        self.mapped = None;
        self.rendered_snapshot.clear();
        self.rendered_value = None;
        self.snapshot_revision = 0;
        if self.visible || self.keep_alive_when_hidden {
            self.launch();
        }
    }
}

fn top_level_patch(previous: &Value, next: &Value) -> Value {
    let (Some(previous), Some(next)) = (previous.as_object(), next.as_object()) else {
        return next.clone();
    };
    let changes = next
        .iter()
        .filter(|(key, value)| previous.get(*key) != Some(*value))
        .map(|(key, value)| (key.clone(), value.clone()))
        .collect::<Map<String, Value>>();
    Value::Object(changes)
}

pub(crate) struct WebSurfaceConfig<'a> {
    pub kind: WebShellSurface,
    pub size: (i32, i32),
    pub visible: bool,
    pub keep_alive_when_hidden: bool,
    pub panel_menu_x: Option<i32>,
    pub session_menu_qs_height: Option<i32>,
    pub actions_tx: &'a Sender<WebShellAction>,
    pub snapshot: &'a WebShellSnapshot,
}

fn shell_surface_frame_rate() -> u32 {
    output_frame_rate()
}

fn output_frame_rate() -> u32 {
    env::var("LUFT_OUTPUT_REFRESH_MILLIHERTZ")
        .ok()
        .and_then(|value| value.parse::<u32>().ok())
        .map(|millihertz| (millihertz.saturating_add(999)) / 1000)
        .filter(|rate| *rate > 0)
        .unwrap_or(60)
}

fn runtime_config() -> RuntimeConfig {
    RuntimeConfig {
        mode: RuntimeMode::SharedPreferred,
        allow_user_install: true,
        bundled_dir: Some(workspace_root()),
        ..RuntimeConfig::default()
    }
}

enum ShellEntry {
    Dev(String),
    File(String),
}

fn shell_entry(kind: WebShellSurface) -> ShellEntry {
    if let Ok(url) = env::var("LUFT_SHELL_WEB_DEV_URL") {
        return ShellEntry::Dev(append_shell_query(url.trim_end_matches('/'), kind));
    }
    ShellEntry::File(append_shell_query(
        &manifest_dir()
            .join("web/dist/index.html")
            .display()
            .to_string(),
        kind,
    ))
}

fn append_shell_query(base: &str, kind: WebShellSurface) -> String {
    let separator = if base.contains('?') { '&' } else { '?' };
    format!("{base}{separator}surface={}&sabine=1", kind.as_str())
}

fn cef_initial_size(shell_surface: &ShellSurfaceOptions, fallback: (i32, i32)) -> (u32, u32) {
    let (width, height) = shell_surface
        .size
        .unwrap_or((fallback.0.max(1) as u32, fallback.1.max(1) as u32));
    let width = if width == 0 {
        panel_output_width().max(1) as u32
    } else {
        width.max(1)
    };
    (width, height.max(1))
}

fn workspace_root() -> PathBuf {
    manifest_dir()
        .parent()
        .and_then(|path| path.parent())
        .map(PathBuf::from)
        .unwrap_or_else(manifest_dir)
}

fn manifest_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
}

#[cfg(test)]
mod tests {
    use super::top_level_patch;
    use serde_json::json;

    #[test]
    fn snapshot_patch_only_contains_changed_domains() {
        let previous = json!({"time": "10:00", "panelApps": [1], "status": {"audio": 50}});
        let next = json!({"time": "10:01", "panelApps": [1], "status": {"audio": 50}});

        assert_eq!(top_level_patch(&previous, &next), json!({"time": "10:01"}));
    }
}
