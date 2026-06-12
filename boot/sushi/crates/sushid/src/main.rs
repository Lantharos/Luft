//! Sushi initramfs splash daemon.

mod display_watch;
mod logo;
mod pivot;
mod probe;
mod recovery;

use std::fs;
use std::path::Path;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::thread;
use std::time::{Duration, Instant};

use anyhow::{Context, Result};
use sushi::{
    classify_boot_error, render_frame_into, render_spinner_only, Color, CrypttabEntry,
    DisplayBackend, DisplayManager, FrameBuffer, KeyAction, Keyboard, LuksUnlock, RenderOverlay,
    SushiEvent,
    SushiEventKind, SushiStage, SushiVisualState, TpmUnlock, UnlockMessage, UnlockOutcome,
    VisualFlags, VisualMode, spinner_phase_at, SPINNER_FRAME_INTERVAL_MS, SUSHI_RUN_DIR,
};
use sushi::{load_state, load_state_from_efi, persist_state};
use sushi::emergency_blackout_all;
use sushi::unlock::{respond_to_request, secure_wipe, AskPasswordAgent, PasswordRequest};

use crate::probe::probe_and_acquire;

enum PendingUnlock {
    AskPassword(PasswordRequest),
    Luks(CrypttabEntry),
}

struct UiState {
    overlay: RenderOverlay,
    keyboard: Keyboard,
    unlock_buffer: String,
    cursor_on: bool,
    pending: Option<PendingUnlock>,
}

impl UiState {
    fn new() -> Self {
        Self {
            overlay: RenderOverlay::default(),
            keyboard: Keyboard::open(),
            unlock_buffer: String::new(),
            cursor_on: true,
            pending: None,
        }
    }

    fn refresh_debug_lines(&mut self) {
        let path = sushi::log::boot_log_path(SUSHI_RUN_DIR);
        self.overlay.debug_lines = sushi::log::tail_human_lines(&path, 18);
    }
}

fn serial_note(msg: &str) {
    let line = format!("{msg}\r\n");
    let _ = fs::write("/dev/ttyS0", &line);
    let _ = fs::write("/dev/console", &line);
}

fn main() -> Result<()> {
    if std::env::args().any(|a| a == "--version") {
        println!("sushid {}", env!("CARGO_PKG_VERSION"));
        return Ok(());
    }

    serial_note("Sushi: sushid is up");
    emergency_blackout_all();

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
    disable_kernel_boot_logo();
    ensure_display_device_nodes();
    emergency_blackout_all();

    let mut state = bootstrap_visual_state()?;
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
    let handoff_locked = state.flags.contains(VisualFlags::ACTIVITY_LOCKED);
    state.apply_dimensions(width, height);
    if !handoff_locked {
        logo::resolve_logo(&mut state);
    } else {
        state.logo.native_width = 80;
        state.logo.native_height = 96;
    }
    state.stage = SushiStage::Initramfs;

    let mut ui = UiState::new();
    if handoff_locked {
        paint_spinner_only(&mut display, &state)?;
        logo::resolve_logo(&mut state);
    } else {
        clear_screen(&mut display)?;
        draw_and_present(&mut display, &mut state, &ui.overlay)?;
    }
    draw_and_present(&mut display, &mut state, &ui.overlay)?;

    finish_initramfs_setup();
    disable_kernel_boot_logo();

    fs::create_dir_all(SUSHI_RUN_DIR).context("create sushi run dir")?;
    sushi::log::init(format!("{SUSHI_RUN_DIR}/boot.log"))?;

    let running = Arc::new(AtomicBool::new(true));
    let display_watch = display_watch::spawn_display_watch(running.clone());

    draw_and_present(&mut display, &mut state, &ui.overlay)?;
    sushi::log::log_event(&SushiEvent::new(SushiStage::Initramfs, SushiEventKind::BootFirstFrame));
    serial_note("Sushi: caught the frame");
    persist_state(&state)?;

    match TpmUnlock::try_silent_unlock(&mut state) {
        UnlockOutcome::NeedsPassphrase(entry) => {
            ui.pending = Some(PendingUnlock::Luks(entry));
            ui.unlock_buffer.clear();
            ui.overlay.unlock_input = Some(String::new());
            ui.overlay.unlock_prompt = Some("ENTER DISK PASSPHRASE".to_string());
        }
        UnlockOutcome::Unlocked { .. } => {}
        UnlockOutcome::NothingToDo => {}
    }
    draw_and_present(&mut display, &mut state, &ui.overlay)?;

    let (mut agent, request_rx) = AskPasswordAgent::start()?;
    let spinner_base_phase = state.spinner_phase;
    let spinner_started = Instant::now();
    let frame_interval = Duration::from_millis(SPINNER_FRAME_INTERVAL_MS);
    let mut last_frame = Instant::now();
    let mut last_persist = Instant::now();
    let mut last_cursor = Instant::now();
    let mut recovery = recovery::RecoveryState::default();
    let splash_started = Instant::now();
    let min_splash = Duration::from_secs(4);

    while running.load(Ordering::SeqCst) {
        if pivot::sysroot_ready() && splash_started.elapsed() >= min_splash && ui.pending.is_none() {
            break;
        }

        handle_keyboard(&mut ui, &mut state, &mut display)?;

        while let Ok(msg) = request_rx.try_recv() {
            match msg {
                UnlockMessage::Request(req) => {
                    ui.pending = Some(PendingUnlock::AskPassword(req));
                    ui.unlock_buffer.clear();
                    ui.overlay.unlock_input = Some(String::new());
                    ui.overlay.unlock_prompt = Some("ENTER DISK PASSPHRASE".to_string());
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
            state.set_mode(VisualMode::Recovering);
            state.flags |= VisualFlags::RECOVERY;
            sushi::log::log_event(&SushiEvent::new(
                SushiStage::Initramfs,
                SushiEventKind::RecoveryEntered {
                    reason: recovery.reason.clone(),
                },
            ));
        }

        if last_cursor.elapsed() >= Duration::from_millis(500) {
            ui.cursor_on = !ui.cursor_on;
            ui.overlay.cursor_visible = ui.cursor_on;
            last_cursor = Instant::now();
        }

        if last_frame.elapsed() >= frame_interval {
            if state.mode != VisualMode::Unlocking {
                state.spinner_phase =
                    spinner_phase_at(spinner_base_phase, spinner_started.elapsed().as_secs_f32());
            }
            if state.flags.contains(VisualFlags::DEBUG_LOG) {
                ui.refresh_debug_lines();
            }
            if state.mode == VisualMode::Unlocking {
                ui.overlay.unlock_input = Some(ui.unlock_buffer.clone());
            }
            draw_and_present(&mut display, &mut state, &ui.overlay)?;
            if last_persist.elapsed() >= Duration::from_millis(500) {
                persist_state(&state)?;
                last_persist = Instant::now();
            }
            last_frame = Instant::now();
        }

        thread::sleep(Duration::from_millis(8));
    }

    sushi::log::log_event(&SushiEvent::new(
        SushiStage::Initramfs,
        SushiEventKind::HandoffPrepare {
            target: "switch-root".to_string(),
        },
    ));
    let _ = draw_and_present(&mut display, &mut state, &ui.overlay);

    agent.shutdown();
    serial_note("Sushi: handing off!");
    enable_fbcon();
    pivot::switch_root(Path::new("/sysroot"))
}

fn handle_keyboard(
    ui: &mut UiState,
    state: &mut SushiVisualState,
    display: &mut DisplayManager,
) -> Result<()> {
    let Some(action) = ui.keyboard.poll() else {
        return Ok(());
    };

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
        KeyAction::Submit if state.mode == VisualMode::Unlocking => {
            if let Some(pending) = ui.pending.take() {
                submit_unlock(ui, state, display, pending)?;
            }
        }
        KeyAction::Backspace if state.mode == VisualMode::Unlocking => {
            ui.unlock_buffer.pop();
            ui.overlay.unlock_input = Some(ui.unlock_buffer.clone());
            draw_and_present(display, state, &ui.overlay)?;
        }
        KeyAction::Char(ch) if state.mode == VisualMode::Unlocking => {
            if ui.unlock_buffer.len() < 128 {
                ui.unlock_buffer.push(ch);
                ui.overlay.unlock_input = Some(ui.unlock_buffer.clone());
                draw_and_present(display, state, &ui.overlay)?;
            }
        }
        _ => {}
    }
    Ok(())
}

fn submit_unlock(
    ui: &mut UiState,
    state: &mut SushiVisualState,
    display: &mut DisplayManager,
    pending: PendingUnlock,
) -> Result<()> {
    let mut passphrase = std::mem::take(&mut ui.unlock_buffer);
    ui.overlay.unlock_input = Some(String::new());

    let result = match &pending {
        PendingUnlock::AskPassword(req) => respond_to_request(req, &passphrase).context("send passphrase"),
        PendingUnlock::Luks(entry) => LuksUnlock::unlock_with_passphrase(entry, &passphrase),
    };

    match result {
        Ok(()) => {
            state.set_mode(VisualMode::Booting);
            state.set_status(String::new());
            if let PendingUnlock::Luks(entry) = pending {
                if state.flags.contains(VisualFlags::TPM_CONFIGURED)
                    || state.flags.contains(VisualFlags::TPM_TRIED)
                {
                    sushi::log::log_event(&SushiEvent::new(
                        SushiStage::Initramfs,
                        SushiEventKind::UnlockTpmReseal,
                    ));
                    if let Err(err) = LuksUnlock::try_reseal(&entry, &passphrase) {
                        sushi::log::log_event(&SushiEvent::new(
                            SushiStage::Initramfs,
                            SushiEventKind::UnlockTpmResealFailed {
                                reason: format!("{err:#}"),
                            },
                        ));
                    }
                }
            }
        }
        Err(_) => {
            ui.pending = Some(pending);
            ui.unlock_buffer.clear();
            state.set_mode(VisualMode::Unlocking);
            state.set_status("Wrong passphrase, try again".to_string());
            state.flags |= VisualFlags::DEGRADED;
            sushi::log::log_event(&SushiEvent::new(
                SushiStage::Initramfs,
                SushiEventKind::UnlockManualFailed,
            ));
        }
    }

    secure_wipe(&mut passphrase);
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
    serial_note("Sushi: caught the frame (headless)");

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
    serial_note("Sushi: handing off!");
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

fn paint_spinner_only(display: &mut DisplayManager, state: &SushiVisualState) -> Result<()> {
    display.render(|frame| render_spinner_only(frame, state))
}

fn clear_screen(display: &mut DisplayManager) -> Result<()> {
    display.render(|frame| {
        frame.fill_rect(0, 0, frame.width, frame.height, Color::SUSHI_BG.to_argb32());
    })
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
    for attempt in 0..300 {
        if let Ok(display) = probe_and_acquire() {
            return Ok(display);
        }
        if attempt == 0 {
            eprintln!("sushid: waiting for display backend...");
        }
        thread::sleep(Duration::from_millis(5));
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
}

fn ensure_display_device_nodes() {
    for _ in 0..40 {
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
        thread::sleep(Duration::from_millis(2));
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