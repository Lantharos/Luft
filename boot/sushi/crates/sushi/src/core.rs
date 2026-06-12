//! Shared types for Sushi boot continuity.

use bitflags::bitflags;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

pub const SUSHI_STATE_VERSION: u32 = 1;

/// Fixed spinner geometry shared across SushiBoot, sushid, and handoffs.
/// Arc is a constant ~90° wedge that only rotates — never changes radius or span.
pub const SPINNER_ARC_RAD: f32 = 1.570_796_4; // π/2
pub const SPINNER_ARC_MILLIDEG: u32 = 900;
/// Phase-0 rotation offset (−90°) so the arc starts at 12 o'clock.
pub const SPINNER_ROTATION_OFFSET_MILLIDEG: u32 = 2700;
pub const SPINNER_ACTIVITY_PX: u32 = 56;
pub const SPINNER_STROKE_PX: f32 = 3.5;
pub const SPINNER_AA_FRINGE: f32 = 1.25;
pub const SPINNER_RADIUS_INSET: u32 = 4;
pub const SPINNER_WHITE: u32 = 0xFF_FF_FF_FF;
/// Smooth spin rate — phase is advanced from wall clock, not fixed per-frame steps.
pub const SPINNER_ROTATIONS_PER_SEC: f32 = 0.9;
pub const SPINNER_FRAME_INTERVAL_MS: u64 = 16;
pub const SUSHI_STATE_PATH: &str = "/run/sushi/state";

/// Phase in `[0, 1)` from a handoff/base phase and elapsed wall time.
#[inline]
pub fn spinner_phase_at(base_phase: f32, elapsed_secs: f32) -> f32 {
    (base_phase + elapsed_secs * SPINNER_ROTATIONS_PER_SEC) % 1.0
}
pub const SUSHI_LOG_DIR: &str = "/var/log/sushi";
pub const SUSHI_RUN_DIR: &str = "/run/sushi";

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[repr(u8)]
pub enum SushiStage {
    Bootloader = 0,
    Initramfs = 1,
    DriverHandoff = 2,
    System = 3,
    Greeter = 4,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[repr(u8)]
pub enum VisualMode {
    Booting = 0,
    Unlocking = 1,
    Updating = 2,
    Recovering = 3,
    HandingOff = 4,
    Error = 5,
}

impl VisualMode {
    /// Bottom status line — only for maintenance-style boots, not normal splash.
    pub fn shows_status_line(self) -> bool {
        matches!(self, VisualMode::Updating | VisualMode::Recovering)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct Color {
    pub r: u8,
    pub g: u8,
    pub b: u8,
    pub a: u8,
}

impl Color {
    pub const SUSHI_BG: Self = Self {
        r: 0,
        g: 0,
        b: 0,
        a: 255,
    };

    pub const SUSHI_ACCENT: Self = Self {
        r: 88,
        g: 166,
        b: 255,
        a: 255,
    };

    pub const SUSHI_TEXT: Self = Self {
        r: 230,
        g: 234,
        b: 242,
        a: 255,
    };

    pub const SUSHI_ERROR: Self = Self {
        r: 255,
        g: 96,
        b: 96,
        a: 255,
    };

    pub fn to_argb32(self) -> u32 {
        ((self.a as u32) << 24)
            | ((self.r as u32) << 16)
            | ((self.g as u32) << 8)
            | (self.b as u32)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct Rect {
    pub x: i32,
    pub y: i32,
    pub w: u32,
    pub h: u32,
}

impl Rect {
    pub fn center_in(container_w: u32, container_h: u32, w: u32, h: u32) -> Self {
        Self {
            x: ((container_w.saturating_sub(w)) / 2) as i32,
            y: ((container_h.saturating_sub(h)) / 2) as i32,
            w,
            h,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[repr(u8)]
pub enum LogoSource {
    Firmware = 0,
    OemAsset = 1,
    Distro = 2,
    SushiFallback = 3,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct LogoDescriptor {
    pub source: LogoSource,
    pub path: Option<String>,
    pub width: u32,
    pub height: u32,
    #[serde(default)]
    pub native_width: u32,
    #[serde(default)]
    pub native_height: u32,
}

bitflags! {
    #[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
    pub struct VisualFlags: u32 {
        const TPM_TRIED = 1 << 0;
        const TPM_SUCCESS = 1 << 1;
        const MANUAL_UNLOCK = 1 << 2;
        const DRIVER_HANDOFF = 1 << 3;
        const BLACK_SCREEN = 1 << 4;
        const DEGRADED = 1 << 5;
        const RECOVERY = 1 << 6;
        /// activity_rect came from a prior stage — do not relayout on logo resolve.
        const ACTIVITY_LOCKED = 1 << 7;
        /// F1 debug log overlay is visible.
        const DEBUG_LOG = 1 << 8;
        /// TPM was configured previously; offer reseal after manual unlock.
        const TPM_CONFIGURED = 1 << 9;
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct SushiVisualState {
    pub version: u32,
    pub boot_id: Uuid,
    pub stage: SushiStage,
    pub width: u32,
    pub height: u32,
    pub scale: f32,
    pub background: Color,
    pub logo: LogoDescriptor,
    pub logo_rect: Rect,
    pub activity_rect: Rect,
    pub spinner_phase: f32,
    pub timestamp_ns: u64,
    pub mode: VisualMode,
    pub flags: VisualFlags,
    pub status_text: String,
}

impl SushiVisualState {
    /// Fit `inner` inside `max` while preserving aspect ratio.
    pub fn fit_contain(inner_w: u32, inner_h: u32, max_w: u32, max_h: u32) -> (u32, u32) {
        Self::fit_contain_scaled(inner_w, inner_h, max_w, max_h, true)
    }

    /// Like `fit_contain`, but can refuse to upscale (keeps firmware/OEM bitmaps at native res).
    pub fn fit_contain_scaled(
        inner_w: u32,
        inner_h: u32,
        max_w: u32,
        max_h: u32,
        allow_upscale: bool,
    ) -> (u32, u32) {
        if inner_w == 0 || inner_h == 0 || max_w == 0 || max_h == 0 {
            return (max_w, max_h);
        }
        let scale_w = max_w as f64 / inner_w as f64;
        let scale_h = max_h as f64 / inner_h as f64;
        let mut scale = scale_w.min(scale_h);
        if !allow_upscale {
            scale = scale.min(1.0);
        }
        (
            (inner_w as f64 * scale).round().max(1.0) as u32,
            (inner_h as f64 * scale).round().max(1.0) as u32,
        )
    }

    /// Windows-style boot layout: logo centered above, spinner directly below.
    pub fn compute_boot_layout(width: u32, height: u32, native_w: u32, native_h: u32) -> (Rect, Rect) {
        let max_logo_w = (width / 3).clamp(160, 480);
        let max_logo_h = (height / 2).clamp(120, 500);
        let (native_w, native_h) = if native_w > 0 && native_h > 0 {
            (native_w, native_h)
        } else {
            (80, 96)
        };
        // Firmware BGRT assets are fixed resolution — never upscale, only shrink to fit.
        let allow_upscale = native_w <= 96 && native_h <= 96;
        let (logo_w, logo_h) =
            Self::fit_contain_scaled(native_w, native_h, max_logo_w, max_logo_h, allow_upscale);
        let activity_size = SPINNER_ACTIVITY_PX;
        let gap = 28u32;
        let block_h = logo_h + gap + activity_size;
        let block_top = (height.saturating_sub(block_h)) / 2;
        let logo_x = (width.saturating_sub(logo_w)) / 2;
        let spin_x = (width.saturating_sub(activity_size)) / 2;
        let logo_rect = Rect {
            x: logo_x as i32,
            y: block_top as i32,
            w: logo_w,
            h: logo_h,
        };
        let activity_rect = Rect {
            x: spin_x as i32,
            y: (block_top + logo_h + gap) as i32,
            w: activity_size,
            h: activity_size,
        };
        (logo_rect, activity_rect)
    }

    pub fn new_boot_scene(width: u32, height: u32) -> Self {
        let (logo_rect, activity_rect) = Self::compute_boot_layout(width, height, 80, 96);

        Self {
            version: SUSHI_STATE_VERSION,
            boot_id: Uuid::new_v4(),
            stage: SushiStage::Initramfs,
            width,
            height,
            scale: 1.0,
            background: Color::SUSHI_BG,
            logo: LogoDescriptor {
                source: LogoSource::Distro,
                path: None,
                width: logo_rect.w,
                height: logo_rect.h,
                native_width: 80,
                native_height: 96,
            },
            logo_rect,
            activity_rect,
            spinner_phase: 0.0,
            timestamp_ns: 0,
            mode: VisualMode::Booting,
            flags: VisualFlags::empty(),
            status_text: String::new(),
        }
    }

    pub fn apply_dimensions(&mut self, width: u32, height: u32) {
        self.width = width;
        self.height = height;
        self.apply_layout();
    }

    pub fn apply_layout(&mut self) {
        let (logo_rect, activity_rect) = Self::compute_boot_layout(
            self.width,
            self.height,
            self.logo.native_width,
            self.logo.native_height,
        );
        self.logo_rect = logo_rect;
        if self.flags.contains(VisualFlags::ACTIVITY_LOCKED) {
            // Keep handoff Y/size/phase; re-center X on the live display width.
            let y = self.activity_rect.y;
            let w = self.activity_rect.w;
            let h = self.activity_rect.h;
            self.activity_rect.x = ((self.width.saturating_sub(w)) / 2) as i32;
            self.activity_rect.y = y;
            self.activity_rect.w = w;
            self.activity_rect.h = h;
        } else {
            self.activity_rect = activity_rect;
        }
        self.logo.width = logo_rect.w;
        self.logo.height = logo_rect.h;
    }

    pub fn advance_spinner(&mut self, delta_secs: f32) {
        self.spinner_phase = spinner_phase_at(self.spinner_phase, delta_secs);
        self.timestamp_ns = now_ns();
    }

    pub fn set_mode(&mut self, mode: VisualMode) {
        self.mode = mode;
        self.timestamp_ns = now_ns();
    }

    pub fn set_status(&mut self, text: impl Into<String>) {
        self.status_text = text.into();
        self.timestamp_ns = now_ns();
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum SushiEventKind {
    BootFirstFrame,
    HandoffPrepare { target: String },
    HandoffBegin { target: String },
    HandoffComplete { target: String },
    UnlockTpmTry,
    UnlockTpmSuccess,
    UnlockManualRequired,
    UnlockManualFailed,
    UnlockTpmReseal,
    UnlockTpmResealSuccess,
    UnlockTpmResealFailed { reason: String },
    DebugOverlayToggled { visible: bool },
    DisplayBackendChanged { backend: String },
    DisplayDriverReady { device: String },
    GreeterWaiting,
    GreeterReady,
    BootComplete,
    BootDegraded { reason: String },
    BlackScreenDetected { duration_ms: u64 },
    BlackScreenRestored { duration_ms: u64 },
    RecoveryEntered { reason: String },
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SushiEvent {
    pub stage: SushiStage,
    pub kind: SushiEventKind,
    pub severity: EventSeverity,
    pub timestamp_ns: u64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum EventSeverity {
    Info,
    Warning,
    Error,
}

impl SushiEvent {
    pub fn new(stage: SushiStage, kind: SushiEventKind) -> Self {
        let severity = match &kind {
            SushiEventKind::BootDegraded { .. }
            | SushiEventKind::UnlockManualFailed
            | SushiEventKind::UnlockTpmResealFailed { .. }
            | SushiEventKind::BlackScreenDetected { .. }
            | SushiEventKind::RecoveryEntered { .. } => EventSeverity::Warning,
            _ => EventSeverity::Info,
        };
        Self {
            stage,
            kind,
            severity,
            timestamp_ns: now_ns(),
        }
    }
}

pub fn now_ns() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_nanos() as u64)
        .unwrap_or(0)
}