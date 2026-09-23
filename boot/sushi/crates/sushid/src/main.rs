//! Sushi initramfs splash daemon.

mod console;
mod display_watch;
mod logo;
mod pivot;
mod probe;
mod recovery;

use std::fs;
use std::mem;
use std::path::Path;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::mpsc;
use std::sync::Arc;
use std::thread;
use std::time::{Duration, Instant};

use anyhow::{Context, Result};
use sushi::{
    advance_spinner_from_boot, classify_boot_error, render_frame_into, render_handoff_overlay,
    CrypttabEntry, DisplayBackend, DisplayManager, FrameBuffer, KeyAction, Keyboard, LuksUnlock,
    RenderOverlay, SushiEvent, SushiEventKind, SushiStage, SushiVisualState, TpmUnlock,
    UnlockFeedback, UnlockMessage, UnlockOutcome, VisualFlags, VisualMode,
    SPINNER_FRAME_INTERVAL_US, SUSHI_RUN_DIR,
};
use sushi::{load_state, load_state_from_efi, persist_state};
use sushi::emergency_blackout_all;
use sushi::unlock::{respond_to_request, secure_wipe, AskPasswordAgent, PasswordRequest};

use crate::probe::probe_and_acquire;

enum PendingUnlock {
    AskPassword(PasswordRequest),
    Luks(CrypttabEntry),
}

struct UnlockProbeResult {
    outcome: UnlockOutcome,
    flags: VisualFlags,
    status: String,
    mode: VisualMode,
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum UnlockTone {
    Idle,
    Checking,
    ErrorFlash,
}

struct UnlockJobResult {
    result: Result<(), anyhow::Error>,
    pending: PendingUnlock,
}

struct UnlockJob {
    rx: mpsc::Receiver<UnlockJobResult>,
}

struct UiState {
    overlay: RenderOverlay,
    keyboard: Keyboard,
    unlock_buffer: String,
    cursor_on: bool,
    pending: Option<PendingUnlock>,
    unlock_tone: UnlockTone,
    unlock_tone_at: Instant,
    unlock_job: Option<UnlockJob>,
}

impl UiState {
    fn new() -> Self {
        Self {
            overlay: RenderOverlay::default(),
            keyboard: Keyboard::open(),
            unlock_buffer: String::new(),
            cursor_on: true,
            pending: None,
            unlock_tone: UnlockTone::Idle,
            unlock_tone_at: Instant::now(),
            unlock_job: None,
        }
    }

    fn unlock_input_active(&self) -> bool {
        self.unlock_job.is_none() && self.unlock_tone == UnlockTone::Idle
    }

    fn refresh_debug_lines(&mut self) {
        let path = sushi::log::boot_log_path(SUSHI_RUN_DIR);
        self.overlay.debug_lines = sushi::log::tail_human_lines(&path, 18);
    }
}

/// User-visible serial hints (unlock prompts, failures). Routine boot traces go to boot.log only.
fn serial_alert(msg: &str) {
    let line = format!("{msg}\r\n");
    let _ = fs::write("/dev/ttyS0", &line);
    let _ = fs::write("/dev/console", &line);
}

fn main() -> Result<()> {
    if std::env::args().any(|a| a == "--version") {
        println!("sushid {}", env!("CARGO_PKG_VERSION"));
        return Ok(());
    }

    if let Err(err) = run() {
        eprintln!("sushid: fatal error: {err:#}");
        if let Ok(mut display) = probe_and_acquire() {
            run_fatal_error_screen(&mut display, err);
        }
        if std::process::id() == 1 {
            eprintln!("sushid: staying alive as init after error");
            loop {
                thread::sleep(Duration::from_secs(3600));
            }
        }
        return Err(err);
    }
    Ok(())
}

fn run() -> Result<()> {
    mount_essential()?;

    let mut state = bootstrap_visual_state()?;
    let spinner_base_phase = state.spinner_phase;
    let handoff_locked = state.flags.contains(VisualFlags::ACTIVITY_LOCKED);

    disable_kernel_boot_logo();
    suppress_fbcon_console();
    console::clear_text_console();
    ensure_display_device_nodes();
    if !handoff_locked {
        emergency_blackout_all();
    }

    let display = match probe_with_retry() {
        Ok(display) => Some(display),
        Err(e) => {
            eprintln!("sushid: display unavailable ({e}); headless splash");
            None
        }
    };

    if display.is_none() {
        return run_headless_switch_root();
    }
    let mut display = display.expect("display branch");

    let (width, height) = display.dimensions();
    if handoff_locked {
        state.width = width;
        state.height = height;
        logo::resolve_logo(&mut state);
    } else {
        state.apply_dimensions(width, height);
        logo::resolve_logo(&mut state);
        emergency_blackout_all();
    }
    state.stage = SushiStage::Initramfs;

    let mut ui = UiState::new();

    // Paint immediately — reuse EFI scanout when possible, only overlay the spinner.
    advance_spinner_from_boot(&mut state, spinner_base_phase);
    paint_first_handoff_frame(&mut display, &mut state, &ui.overlay, handoff_locked)?;

    stage_firmware_assets();
    finish_initramfs_setup();
    thread::spawn(|| {
        let _ = pivot::ensure_sysroot_mounted();
    });
    ui.keyboard.reopen();
    let keyboard_label = if ui.keyboard.is_connected() {
        ui.keyboard.source_label()
    } else {
        "unavailable".to_string()
    };
    disable_kernel_boot_logo();
    fs::create_dir_all(SUSHI_RUN_DIR).context("create sushi run dir")?;
    sushi::log::init(format!("{SUSHI_RUN_DIR}/boot.log"))?;
    sushi::log::log_event(&SushiEvent::new(SushiStage::Initramfs, SushiEventKind::BootFirstFrame));
    sushi::log::log_info(
        SushiStage::Initramfs,
        &format!("keyboard: {keyboard_label}"),
    );
    persist_state(&state)?;

    let running = Arc::new(AtomicBool::new(true));
    let display_watch = display_watch::spawn_display_watch(running.clone());

    let (mut agent, request_rx) = AskPasswordAgent::start()?;
    let (unlock_tx, unlock_rx) = mpsc::channel();
    thread::spawn(move || {
        let mut probe_state = SushiVisualState::new_boot_scene(0, 0);
        let outcome = TpmUnlock::try_silent_unlock(&mut probe_state);
        let _ = unlock_tx.send(UnlockProbeResult {
            outcome,
            flags: probe_state.flags,
            status: probe_state.status_text.clone(),
            mode: probe_state.mode,
        });
    });
    let frame_interval = Duration::from_micros(SPINNER_FRAME_INTERVAL_US);
    let mut last_frame = Instant::now();
    let mut last_persist = Instant::now();
    let mut last_cursor = Instant::now();
    let mut recovery = recovery::RecoveryState::default();
    let splash_started = Instant::now();
    let min_splash = Duration::from_secs(4);
    let mut last_keyboard_probe = Instant::now();

    while running.load(Ordering::SeqCst) {
        if last_keyboard_probe.elapsed() >= Duration::from_millis(250) {
            if ui.keyboard.refresh() {
                sushi::log::log_info(
                    SushiStage::Initramfs,
                    &format!("keyboard: {}", ui.keyboard.source_label()),
                );
            }
            last_keyboard_probe = Instant::now();
        }
        if let Ok(probe) = unlock_rx.try_recv() {
            apply_unlock_probe(&mut ui, &mut state, probe);
        }

        poll_unlock_job(&mut ui, &mut state, &mut display)?;

        if ui.pending.is_none()
            && ui.unlock_job.is_none()
            && pivot::sysroot_mounted()
            && splash_started.elapsed() >= min_splash
        {
            break;
        }

        handle_keyboard(&mut ui, &mut state, &mut display, &mut recovery)?;

        while let Ok(msg) = request_rx.try_recv() {
            match msg {
                UnlockMessage::Request(req) => {
                    ui.pending = Some(PendingUnlock::AskPassword(req));
                    ui.unlock_buffer.clear();
                    ui.overlay.unlock_input = Some(String::new());
                    ui.overlay.unlock_prompt = Some("Disk passphrase".to_string());
                    state.set_mode(VisualMode::Unlocking);
                    state.set_status(String::new());
                    sushi::log::log_event(&SushiEvent::new(
                        SushiStage::Initramfs,
                        SushiEventKind::UnlockManualRequired,
                    ));
                }
                UnlockMessage::Shutdown => break,
            }
        }

        if let Some(handoff) = display_watch.try_recv_handoff() {
            perform_display_handoff(&mut display, &mut state, &ui.overlay, handoff)?;
        }

        if recovery.check_failures(&state) {
            recovery.enter(state.status_text.clone());
            recovery.apply_menu_to_state(&mut state);
            sushi::log::log_event(&SushiEvent::new(
                SushiStage::Initramfs,
                SushiEventKind::RecoveryEntered {
                    reason: recovery.reason.clone(),
                },
            ));
        }

        if last_cursor.elapsed() >= Duration::from_millis(500) {
            ui.cursor_on = !ui.cursor_on;
            last_cursor = Instant::now();
        }

        if last_frame.elapsed() >= frame_interval {
            if state.mode != VisualMode::Unlocking {
                advance_spinner_from_boot(&mut state, spinner_base_phase);
            }
            if state.flags.contains(VisualFlags::DEBUG_LOG) {
                ui.refresh_debug_lines();
            }
            if state.mode == VisualMode::Unlocking {
                sync_unlock_feedback(&mut ui);
                ui.overlay.unlock_input = Some(ui.unlock_buffer.clone());
                ui.overlay.cursor_visible =
                    ui.unlock_input_active() && ui.cursor_on;
            }
            draw_and_present(&mut display, &mut state, &ui.overlay)?;
            if last_persist.elapsed() >= Duration::from_millis(500) {
                persist_state(&state)?;
                last_persist = Instant::now();
            }
            last_frame = Instant::now();
        }

        thread::sleep(Duration::from_millis(4));
    }

    sushi::log::log_event(&SushiEvent::new(
        SushiStage::Initramfs,
        SushiEventKind::HandoffPrepare {
            target: "switch-root".to_string(),
        },
    ));
    advance_spinner_from_boot(&mut state, spinner_base_phase);
    let _ = draw_and_present(&mut display, &mut state, &ui.overlay);

    agent.shutdown();
    // Hand off while /dev/fb0 still exists; forget display so munmap does not tear down scanout.
    console::handoff_framebuffer_to_console();
    mem::forget(display);
    pivot::switch_root(Path::new("/sysroot"))
}

fn stage_firmware_assets() {
    let _ = fs::create_dir_all("/run/sushi");
    if Path::new("/sys/firmware/acpi/bgrt/image").is_file() {
        let _ = fs::copy("/sys/firmware/acpi/bgrt/image", "/run/sushi/bgrt.bmp");
    }
}

fn handle_recovery_key(
    recovery: &mut recovery::RecoveryState,
    ch: char,
    state: &mut SushiVisualState,
    ui: &mut UiState,
    display: &mut DisplayManager,
) -> Result<()> {
    match ch {
        '1' => {
            recovery.selected = recovery::RecoveryAction::TryAgain;
            state.set_mode(VisualMode::Booting);
            state.flags.remove(VisualFlags::RECOVERY);
            state.set_status(String::new());
        }
        '2' => {
            recovery.selected = recovery::RecoveryAction::ViewDetails;
            state.flags |= VisualFlags::DEBUG_LOG;
            ui.refresh_debug_lines();
        }
        '3' => recovery.selected = recovery::RecoveryAction::RecoveryShell,
        '4' => recovery.selected = recovery::RecoveryAction::Reboot,
        _ => recovery.select_next(),
    }
    recovery.apply_menu_to_state(state);
    draw_and_present(display, state, &ui.overlay)
}

fn handle_keyboard(
    ui: &mut UiState,
    state: &mut SushiVisualState,
    display: &mut DisplayManager,
    recovery: &mut recovery::RecoveryState,
) -> Result<()> {
    while let Some(action) = ui.keyboard.poll() {
        handle_key_action(ui, state, display, recovery, action)?;
    }
    Ok(())
}

fn handle_key_action(
    ui: &mut UiState,
    state: &mut SushiVisualState,
    display: &mut DisplayManager,
    recovery: &mut recovery::RecoveryState,
    action: KeyAction,
) -> Result<()> {
    match action {
        KeyAction::ToggleDebug => {
            state.flags ^= VisualFlags::DEBUG_LOG;
            let visible = state.flags.contains(VisualFlags::DEBUG_LOG);
            if visible {
                ui.refresh_debug_lines();
            }
            sushi::log::log_event(&SushiEvent::new(
                SushiStage::Initramfs,
                SushiEventKind::DebugOverlayToggled { visible },
            ));
            draw_and_present(display, state, &ui.overlay)?;
        }
        KeyAction::Submit if state.mode == VisualMode::Unlocking && ui.unlock_input_active() => {
            if let Some(pending) = ui.pending.take() {
                begin_unlock_submit(ui, state, display, pending)?;
            }
        }
        KeyAction::Backspace
            if state.mode == VisualMode::Unlocking && ui.unlock_input_active() =>
        {
            ui.unlock_buffer.pop();
            ui.overlay.unlock_input = Some(ui.unlock_buffer.clone());
            draw_and_present(display, state, &ui.overlay)?;
        }
        KeyAction::Char(ch)
            if state.mode == VisualMode::Unlocking && ui.unlock_input_active() =>
        {
            if ui.unlock_buffer.len() < 128 {
                ui.unlock_buffer.push(ch);
                ui.overlay.unlock_input = Some(ui.unlock_buffer.clone());
                draw_and_present(display, state, &ui.overlay)?;
            }
        }
        KeyAction::Char(ch) if state.mode == VisualMode::Recovering => {
            handle_recovery_key(recovery, ch, state, ui, display)?;
        }
        _ => {}
    }
    Ok(())
}

fn resume_boot_splash_after_unlock(ui: &mut UiState, state: &mut SushiVisualState) {
    ui.unlock_tone = UnlockTone::Idle;
    ui.overlay.unlock_input = None;
    ui.overlay.unlock_prompt = None;
    ui.overlay.unlock_feedback = UnlockFeedback::Normal;
    ui.overlay.cursor_visible = false;
    state.set_mode(VisualMode::Booting);
    state.set_status(String::new());
    console::keep_splash_visible();
}

fn sync_unlock_feedback(ui: &mut UiState) {
    ui.overlay.unlock_feedback = match ui.unlock_tone {
        UnlockTone::Idle => UnlockFeedback::Normal,
        UnlockTone::Checking => {
            let pulse = ui.unlock_tone_at.elapsed().as_millis() / 350 % 2 == 0;
            UnlockFeedback::Checking { accent: pulse }
        }
        UnlockTone::ErrorFlash => {
            let elapsed = ui.unlock_tone_at.elapsed();
            if elapsed > Duration::from_millis(1350) {
                ui.unlock_tone = UnlockTone::Idle;
                ui.overlay.unlock_prompt = Some("Disk passphrase".to_string());
                UnlockFeedback::Normal
            } else {
                let flash = elapsed.as_millis() / 150 % 2 == 0;
                UnlockFeedback::Error { accent: flash }
            }
        }
    };
}

fn begin_unlock_submit(
    ui: &mut UiState,
    state: &mut SushiVisualState,
    display: &mut DisplayManager,
    pending: PendingUnlock,
) -> Result<()> {
    let mut passphrase = std::mem::take(&mut ui.unlock_buffer);
    ui.overlay.unlock_input = Some(String::new());
    ui.unlock_tone = UnlockTone::Checking;
    ui.unlock_tone_at = Instant::now();
    ui.overlay.unlock_prompt = Some("Unlocking disk...".to_string());
    sync_unlock_feedback(ui);
    draw_and_present(display, state, &ui.overlay)?;

    let try_reseal = state.flags.contains(VisualFlags::TPM_CONFIGURED)
        || state.flags.contains(VisualFlags::TPM_TRIED);
    let (tx, rx) = mpsc::channel();
    thread::spawn(move || {
        let result = match &pending {
            PendingUnlock::AskPassword(req) => {
                respond_to_request(req, &passphrase).map_err(|err| err.into())
            }
            PendingUnlock::Luks(entry) => {
                LuksUnlock::unlock_with_passphrase(entry, &passphrase).map_err(|err| err.into())
            }
        };
        if result.is_ok() {
            if let PendingUnlock::Luks(entry) = &pending {
                if try_reseal {
                    if let Err(err) = LuksUnlock::try_reseal(entry, &passphrase) {
                        sushi::log::log_event(&SushiEvent::new(
                            SushiStage::Initramfs,
                            SushiEventKind::UnlockTpmResealFailed {
                                reason: format!("{err:#}"),
                            },
                        ));
                    } else {
                        sushi::log::log_event(&SushiEvent::new(
                            SushiStage::Initramfs,
                            SushiEventKind::UnlockTpmReseal,
                        ));
                    }
                }
            }
        }
        secure_wipe(&mut passphrase);
        let _ = tx.send(UnlockJobResult { result, pending });
    });
    ui.unlock_job = Some(UnlockJob { rx });
    Ok(())
}

fn poll_unlock_job(
    ui: &mut UiState,
    state: &mut SushiVisualState,
    display: &mut DisplayManager,
) -> Result<()> {
    let Some(job) = ui.unlock_job.as_ref() else {
        return Ok(());
    };
    let Ok(done) = job.rx.try_recv() else {
        return Ok(());
    };
    ui.unlock_job = None;
    finish_unlock_submit(ui, state, display, done)
}

fn finish_unlock_submit(
    ui: &mut UiState,
    state: &mut SushiVisualState,
    display: &mut DisplayManager,
    done: UnlockJobResult,
) -> Result<()> {
    match done.result {
        Ok(()) => {
            resume_boot_splash_after_unlock(ui, state);
            thread::spawn(|| {
                let _ = pivot::ensure_sysroot_mounted();
            });
            sushi::log::log_info(SushiStage::Initramfs, "disk unlocked, resuming boot");
        }
        Err(err) => {
            serial_alert(&format!("Sushi: unlock failed: {err:#}"));
            ui.pending = Some(done.pending);
            ui.unlock_buffer.clear();
            ui.overlay.unlock_input = Some(String::new());
            ui.unlock_tone = UnlockTone::ErrorFlash;
            ui.unlock_tone_at = Instant::now();
            ui.overlay.unlock_prompt = Some("Incorrect passphrase".to_string());
            state.set_mode(VisualMode::Unlocking);
            state.set_status(String::new());
            state.flags |= VisualFlags::DEGRADED;
            sushi::log::log_event(&SushiEvent::new(
                SushiStage::Initramfs,
                SushiEventKind::UnlockManualFailed,
            ));
        }
    }
    sync_unlock_feedback(ui);
    draw_and_present(display, state, &ui.overlay)
}

fn run_fatal_error_screen(display: &mut DisplayManager, err: anyhow::Error) -> ! {
    let _ = fs::create_dir_all(SUSHI_RUN_DIR);
    let _ = sushi::log::init(format!("{SUSHI_RUN_DIR}/boot.log"));
    sushi::log::log_info(SushiStage::Initramfs, &format!("fatal: {err:#}"));

    let mut state = bootstrap_visual_state().unwrap_or_else(|_| {
        SushiVisualState::new_boot_scene(1920, 1080)
    });
    let (w, h) = display.dimensions();
    state.apply_dimensions(w, h);
    logo::resolve_logo(&mut state);
    state.set_mode(VisualMode::Error);

    let mut ui = UiState::new();
    ui.overlay.error = Some(classify_boot_error(&err));
    ui.refresh_debug_lines();

    loop {
        if let Some(KeyAction::ToggleDebug) = ui.keyboard.poll() {
            state.flags ^= VisualFlags::DEBUG_LOG;
            let visible = state.flags.contains(VisualFlags::DEBUG_LOG);
            if visible {
                ui.refresh_debug_lines();
            }
            sushi::log::log_event(&SushiEvent::new(
                SushiStage::Initramfs,
                SushiEventKind::DebugOverlayToggled { visible },
            ));
        }
        if state.flags.contains(VisualFlags::DEBUG_LOG) {
            ui.refresh_debug_lines();
        }
        let _ = draw_and_present(display, &mut state, &ui.overlay);
        thread::sleep(Duration::from_millis(50));
    }
}

fn run_headless_switch_root() -> Result<()> {
    mount_essential()?;
    finish_initramfs_setup();
    fs::create_dir_all(SUSHI_RUN_DIR).context("create sushi run dir")?;
    sushi::log::init(format!("{SUSHI_RUN_DIR}/boot.log"))?;
    sushi::log::log_event(&SushiEvent::new(SushiStage::Initramfs, SushiEventKind::BootFirstFrame));


    let mut state = SushiVisualState::new_boot_scene(0, 0);
    match TpmUnlock::try_silent_unlock(&mut state) {
        UnlockOutcome::NeedsPassphrase(_) => {
            anyhow::bail!("LUKS unlock required but no display for passphrase entry");
        }
        _ => {}
    }

    let splash_started = Instant::now();
    let min_splash = Duration::from_secs(4);
    while !(pivot::sysroot_ready() && splash_started.elapsed() >= min_splash) {
        thread::sleep(Duration::from_millis(50));
    }

    sushi::log::log_event(&SushiEvent::new(
        SushiStage::Initramfs,
        SushiEventKind::HandoffPrepare {
            target: "switch-root".to_string(),
        },
    ));
    console::clear_text_console();
    enable_fbcon();
    pivot::switch_root(Path::new("/sysroot"))
}

fn bootstrap_visual_state() -> Result<SushiVisualState> {
    if let Some(state) = load_state() {
        return Ok(state);
    }
    if let Some(state) = load_state_from_efi() {
        sushi::log::log_info(SushiStage::Initramfs, "restored visual state from EFI handoff");
        eprintln!(
            "sushid: EFI handoff ok ({}x{}, spinner={:.2})",
            state.width, state.height, state.spinner_phase
        );
        return Ok(state);
    }
    Ok(SushiVisualState::new_boot_scene(1920, 1080))
}

fn draw_and_present(
    display: &mut DisplayManager,
    state: &mut SushiVisualState,
    overlay: &RenderOverlay,
) -> Result<()> {
    display.render(|frame| render_frame_into(frame, state, overlay))
}

fn apply_unlock_probe(ui: &mut UiState, state: &mut SushiVisualState, probe: UnlockProbeResult) {
    state.flags |= probe.flags;
    if !probe.status.is_empty() {
        state.set_status(probe.status);
    }
    match probe.outcome {
        UnlockOutcome::NeedsPassphrase(entry) => {
            ui.pending = Some(PendingUnlock::Luks(entry));
            ui.unlock_buffer.clear();
            ui.overlay.unlock_input = Some(String::new());
            ui.overlay.unlock_prompt = Some("Disk passphrase".to_string());
            state.set_mode(VisualMode::Unlocking);
            serial_alert("Sushi: unlock UI ready (type passphrase, Enter)");
        }
        UnlockOutcome::Unlocked { .. } => {
            state.set_mode(probe.mode);
        }
        UnlockOutcome::NothingToDo => {}
    }
}

fn paint_first_handoff_frame(
    display: &mut DisplayManager,
    state: &mut SushiVisualState,
    overlay: &RenderOverlay,
    handoff_locked: bool,
) -> Result<()> {
    if handoff_locked && display.import_scanout() {
        display.render(|frame| render_handoff_overlay(frame, state))?;
        return Ok(());
    }
    draw_and_present(display, state, overlay)
}

fn perform_display_handoff(
    display: &mut DisplayManager,
    state: &mut SushiVisualState,
    overlay: &RenderOverlay,
    device: String,
) -> Result<()> {
    sushi::log::log_event(&SushiEvent::new(
        SushiStage::DriverHandoff,
        SushiEventKind::DisplayDriverReady { device: device.clone() },
    ));
    sushi::log::log_event(&SushiEvent::new(
        SushiStage::DriverHandoff,
        SushiEventKind::HandoffPrepare {
            target: "native-drm".to_string(),
        },
    ));

    state.stage = SushiStage::DriverHandoff;
    state.set_mode(VisualMode::HandingOff);
    state.flags |= VisualFlags::DRIVER_HANDOFF;

    if let Ok(new_backend) = sushi::DrmBackend::open(&device) {
        let mut frame = FrameBuffer::new(new_backend.width(), new_backend.height(), new_backend.format());
        render_frame_into(&mut frame, state, overlay);
        let start = Instant::now();
        match display.try_handoff(Box::new(new_backend), &frame) {
            Ok(()) => {
                sushi::log::log_event(&SushiEvent::new(
                    SushiStage::DriverHandoff,
                    SushiEventKind::HandoffComplete {
                        target: "native-drm".to_string(),
                    },
                ));
                sushi::log::log_event(&SushiEvent::new(
                    SushiStage::DriverHandoff,
                    SushiEventKind::DisplayBackendChanged {
                        backend: "drm".to_string(),
                    },
                ));
                state.set_mode(VisualMode::Booting);
            }
            Err(err) => {
                sushi::log::log_event(&SushiEvent::new(
                    SushiStage::DriverHandoff,
                    SushiEventKind::BootDegraded {
                        reason: format!("handoff failed: {err}"),
                    },
                ));
                state.flags |= VisualFlags::BLACK_SCREEN;
                sushi::log::log_event(&SushiEvent::new(
                    SushiStage::DriverHandoff,
                    SushiEventKind::BlackScreenDetected {
                        duration_ms: start.elapsed().as_millis() as u64,
                    },
                ));
            }
        }
    }
    Ok(())
}

fn probe_with_retry() -> Result<DisplayManager, sushi::DisplayError> {
    for attempt in 0..200 {
        if let Ok(display) = probe_and_acquire() {
            return Ok(display);
        }
        if attempt == 0 {
            eprintln!("sushid: waiting for display backend...");
        }
        let delay = if attempt < 30 { 1 } else { 4 };
        thread::sleep(Duration::from_millis(delay));
    }
    probe_and_acquire()
}

fn mount_essential() -> Result<()> {
    const MS_RELATIME: libc::c_ulong = 1 << 21;
    let mounts = [
        ("proc", "/proc", "proc"),
        ("sysfs", "/sys", "sysfs"),
        ("devtmpfs", "/dev", "devtmpfs"),
    ];
    for (fstype, target, source) in mounts {
        let _ = fs::create_dir_all(target);
        let ctarget = std::ffi::CString::new(target).unwrap();
        let csource = std::ffi::CString::new(source).unwrap();
        let cftype = std::ffi::CString::new(fstype).unwrap();
        unsafe {
            if libc::mount(
                csource.as_ptr(),
                ctarget.as_ptr(),
                cftype.as_ptr(),
                MS_RELATIME,
                std::ptr::null(),
            ) != 0
                && fstype != "devtmpfs"
            {
                let _ = libc::mount(
                    std::ptr::null(),
                    ctarget.as_ptr(),
                    std::ffi::CString::new("tmpfs").unwrap().as_ptr(),
                    MS_RELATIME,
                    std::ptr::null(),
                );
            }
        }
    }
    Ok(())
}

fn finish_initramfs_setup() {
    let _ = fs::create_dir_all("/run/sushi");
    let _ = fs::create_dir_all("/run/systemd/ask-password");
    let _ = fs::create_dir_all("/dev/dri");
    let _ = fs::create_dir_all("/dev/input");
    ensure_display_device_nodes();
    activate_boot_vt();
    if Path::new("/etc/crypttab").exists() {
        if let Err(err) = LuksUnlock::prepare_kernel() {
            eprintln!("sushid: LUKS kernel prep: {err:#}");
            serial_alert(&format!("Sushi: LUKS kernel prep failed: {err:#}"));
        }
    }
}

fn activate_boot_vt() {
    use std::fs::OpenOptions;
    use std::os::unix::io::AsRawFd;
    const VT_ACTIVATE: libc::c_ulong = 0x5606;
    let Ok(tty) = OpenOptions::new().write(true).open("/dev/tty0") else {
        return;
    };
    unsafe {
        let _ = libc::ioctl(tty.as_raw_fd(), VT_ACTIVATE, 1);
    }
}

fn ensure_display_device_nodes() {
    for _ in 0..25 {
        ensure_class_devices("graphics");
        ensure_class_devices("drm");
        ensure_class_devices("input");
        for card in ["card0", "card1"] {
            let drm_fb = format!("/sys/class/drm/{card}/device/graphics/fb0/dev");
            if Path::new(&drm_fb).exists() {
                ensure_device_node_from_sysfs_dev_file(&drm_fb, "/dev/fb0", 0o666);
            }
        }
        if Path::new("/dev/fb0").exists() || Path::new("/dev/dri/card0").exists() {
            break;
        }
        thread::sleep(Duration::from_millis(1));
    }
}

fn ensure_device_node_from_sysfs_dev_file(sysfs_dev: &str, dev_path: &str, mode: u32) {
    if Path::new(dev_path).exists() {
        return;
    }
    let Ok(contents) = fs::read_to_string(sysfs_dev) else {
        return;
    };
    let Some((major, minor)) = contents.trim().split_once(':') else {
        return;
    };
    let Ok(major) = major.trim().parse::<u32>() else {
        return;
    };
    let Ok(minor) = minor.trim().parse::<u32>() else {
        return;
    };
    let dev = libc::makedev(major, minor);
    let cpath = std::ffi::CString::new(dev_path).unwrap();
    unsafe {
        let _ = libc::mknod(cpath.as_ptr(), libc::S_IFCHR | mode, dev);
    }
}

fn disable_kernel_boot_logo() {
    for path in [
        "/sys/module/fbcon/parameters/logo",
        "/sys/module/fbcon/parameters/logo_centerscreen",
        "/sys/module/fbcon/parameters/rotate",
    ] {
        let _ = fs::write(path, "0");
    }
}

/// Keep fbcon from scribbling on the scanout buffer while sushid owns the splash.
pub(crate) fn suppress_fbcon_console() {
    if let Ok(entries) = fs::read_dir("/sys/class/vtconsole") {
        for entry in entries.flatten() {
            let name_path = entry.path().join("name");
            let Ok(label) = fs::read_to_string(&name_path) else {
                continue;
            };
            if label.to_ascii_lowercase().contains("frame buffer") {
                let _ = fs::write(entry.path().join("bind"), "0");
            }
        }
    }
}

pub fn enable_fbcon() {
    if let Ok(entries) = fs::read_dir("/sys/class/vtconsole") {
        for entry in entries.flatten() {
            let name_path = entry.path().join("name");
            let Ok(label) = fs::read_to_string(&name_path) else {
                continue;
            };
            if label.to_ascii_lowercase().contains("frame buffer") {
                let _ = fs::write(entry.path().join("bind"), "1");
            }
        }
    }
}

fn ensure_class_devices(class: &str) {
    let class_dir = format!("/sys/class/{class}");
    let Ok(entries) = fs::read_dir(&class_dir) else {
        return;
    };
    for entry in entries.flatten() {
        let name = entry.file_name().to_string_lossy().into_owned();
        let dev_path = format!("/dev/{name}");
        if Path::new(&dev_path).exists() {
            continue;
        }
        let sysfs_dev = entry.path().join("dev");
        let Ok(contents) = fs::read_to_string(&sysfs_dev) else {
            continue;
        };
        let Some((major, minor)) = contents.trim().split_once(':') else {
            continue;
        };
        let Ok(major) = major.trim().parse::<u32>() else {
            continue;
        };
        let Ok(minor) = minor.trim().parse::<u32>() else {
            continue;
        };
        let mode = if class == "drm" && name.starts_with("card") {
            0o660
        } else {
            0o666
        };
        let dev = libc::makedev(major, minor);
        let cpath = std::ffi::CString::new(dev_path.as_str()).unwrap();
        unsafe {
            let _ = libc::mknod(cpath.as_ptr(), libc::S_IFCHR | mode, dev);
        }
    }
}