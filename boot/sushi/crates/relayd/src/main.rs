//! Relay initramfs daemon — Plymouth replacement.

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
use relay_core::{
    Color, RelayEvent, RelayEventKind, RelayStage, RelayVisualState, VisualFlags, VisualMode,
    spinner_phase_at, SPINNER_FRAME_INTERVAL_MS, RELAY_RUN_DIR,
};
use relay_display::{DisplayBackend, DisplayManager, FrameBuffer};
use probe::probe_and_acquire;
use relay_log;
use relay_protocol::{load_state, load_state_from_efi, persist_state};
use relay_render::{render_frame_into, render_spinner_only};
use relay_display_fb::emergency_blackout_all;
use relay_unlock::{
    respond_to_request, secure_wipe, tpm::TpmUnlock, AskPasswordAgent, TtyReader, UnlockMessage,
};



fn main() -> Result<()> {
    if std::env::args().any(|a| a == "--version") {
        println!("relayd {}", env!("CARGO_PKG_VERSION"));
        return Ok(());
    }

    // Beat kernel fbcon to the scanout buffer if /dev/fb0 already exists.
    emergency_blackout_all();

    if let Err(err) = run() {
        eprintln!("relayd: fatal error: {err:#}");
        if std::process::id() == 1 {
            eprintln!("relayd: staying alive as init after error");
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
    let mut display = match probe_with_retry() {
        Ok(display) => display,
        Err(e) => {
            eprintln!("relayd: display unavailable ({e}); staying alive as init");
            loop {
                thread::sleep(Duration::from_secs(3600));
            }
        }
    };

    let (width, height) = display.dimensions();
    let handoff_locked = state.flags.contains(VisualFlags::ACTIVITY_LOCKED);
    state.apply_dimensions(width, height);
    if !handoff_locked {
        logo::resolve_logo(&mut state);
    } else {
        // Keep RelayBoot layout for the first paint so the spinner does not jump.
        state.logo.native_width = 80;
        state.logo.native_height = 96;
    }
    state.stage = RelayStage::Initramfs;

    // First paint ASAP — black + spinner only so we never flash a full-screen logo.
    if handoff_locked {
        paint_spinner_only(&mut display, &state)?;
        logo::resolve_logo(&mut state);
    } else {
        clear_screen(&mut display)?;
        draw_and_present(&mut display, &mut state)?;
    }
    draw_and_present(&mut display, &mut state)?;

    finish_initramfs_setup();
    disable_kernel_boot_logo();

    fs::create_dir_all(RELAY_RUN_DIR).context("create relay run dir")?;
    relay_log::init(format!("{RELAY_RUN_DIR}/boot.log"))?;

    let running = Arc::new(AtomicBool::new(true));
    let display_watch = display_watch::spawn_display_watch(running.clone());

    draw_and_present(&mut display, &mut state)?;
    relay_log::log_event(&RelayEvent::new(RelayStage::Initramfs, RelayEventKind::BootFirstFrame));
    persist_state(&state)?;

    let _ = TpmUnlock::try_silent_unlock(&mut state);
    draw_and_present(&mut display, &mut state)?;

    let (mut agent, request_rx) = AskPasswordAgent::start()?;
    let spinner_base_phase = state.spinner_phase;
    let spinner_started = Instant::now();
    let frame_interval = Duration::from_millis(SPINNER_FRAME_INTERVAL_MS);
    let mut last_frame = Instant::now();
    let mut last_persist = Instant::now();
    let mut pending_unlock: Option<relay_unlock::PasswordRequest> = None;
    let mut recovery = recovery::RecoveryState::default();
    let splash_started = Instant::now();
    let min_splash = Duration::from_secs(4);

    while running.load(Ordering::SeqCst) {
        if pivot::sysroot_ready() && splash_started.elapsed() >= min_splash {
            break;
        }

        while let Ok(msg) = request_rx.try_recv() {
            match msg {
                UnlockMessage::Request(req) => {
                    pending_unlock = Some(req);
                    state.set_mode(VisualMode::Unlocking);
                    state.set_status("Enter disk passphrase");
                    relay_log::log_event(&RelayEvent::new(
                        RelayStage::Initramfs,
                        RelayEventKind::UnlockManualRequired,
                    ));
                }
                UnlockMessage::Shutdown => break,
            }
        }

        if let Some(handoff) = display_watch.try_recv_handoff() {
            perform_display_handoff(&mut display, &mut state, handoff)?;
        }

        if let Some(req) = pending_unlock.take() {
            match handle_unlock_request(&mut display, &mut state, &req) {
                Ok(()) => {
                    state.set_mode(VisualMode::Booting);
                    state.set_status(String::new());
                }
                Err(_) => {
                    state.set_mode(VisualMode::Unlocking);
                    state.set_status("Wrong passphrase, try again");
                    state.flags |= VisualFlags::DEGRADED;
                    relay_log::log_event(&RelayEvent::new(
                        RelayStage::Initramfs,
                        RelayEventKind::UnlockManualFailed,
                    ));
                }
            }
        }

        if recovery.check_failures(&state) {
            state.set_mode(VisualMode::Recovering);
            state.flags |= VisualFlags::RECOVERY;
            relay_log::log_event(&RelayEvent::new(
                RelayStage::Initramfs,
                RelayEventKind::RecoveryEntered {
                    reason: recovery.reason.clone(),
                },
            ));
        }

        if last_frame.elapsed() >= frame_interval {
            state.spinner_phase =
                spinner_phase_at(spinner_base_phase, spinner_started.elapsed().as_secs_f32());
            draw_and_present(&mut display, &mut state)?;
            if last_persist.elapsed() >= Duration::from_millis(500) {
                persist_state(&state)?;
                last_persist = Instant::now();
            }
            last_frame = Instant::now();
        }

        thread::sleep(Duration::from_millis(8));
    }

    relay_log::log_event(&RelayEvent::new(
        RelayStage::Initramfs,
        RelayEventKind::HandoffPrepare {
            target: "switch-root".to_string(),
        },
    ));
    let _ = draw_and_present(&mut display, &mut state);

    agent.shutdown();
    pivot::switch_root(Path::new("/sysroot"))
}

fn bootstrap_visual_state() -> Result<RelayVisualState> {
    if let Some(state) = load_state() {
        return Ok(state);
    }
    if let Some(state) = load_state_from_efi() {
        relay_log::log_info(RelayStage::Initramfs, "restored visual state from EFI handoff");
        eprintln!(
            "relayd: EFI handoff ok ({}x{}, spinner={:.2})",
            state.width, state.height, state.spinner_phase
        );
        return Ok(state);
    }
    Ok(RelayVisualState::new_boot_scene(1920, 1080))
}

fn draw_and_present(display: &mut DisplayManager, state: &mut RelayVisualState) -> Result<()> {
    display.render(|frame| render_frame_into(frame, state))
}

fn paint_spinner_only(display: &mut DisplayManager, state: &RelayVisualState) -> Result<()> {
    display.render(|frame| render_spinner_only(frame, state))
}

fn clear_screen(display: &mut DisplayManager) -> Result<()> {
    display.render(|frame| {
        frame.fill_rect(0, 0, frame.width, frame.height, Color::RELAY_BG.to_argb32());
    })
}

fn perform_display_handoff(
    display: &mut DisplayManager,
    state: &mut RelayVisualState,
    device: String,
) -> Result<()> {
    relay_log::log_event(&RelayEvent::new(
        RelayStage::DriverHandoff,
        RelayEventKind::DisplayDriverReady { device: device.clone() },
    ));
    relay_log::log_event(&RelayEvent::new(
        RelayStage::DriverHandoff,
        RelayEventKind::HandoffPrepare {
            target: "native-drm".to_string(),
        },
    ));

    state.stage = RelayStage::DriverHandoff;
    state.set_mode(VisualMode::HandingOff);
    state.flags |= VisualFlags::DRIVER_HANDOFF;

    if let Ok(new_backend) = relay_display_drm::DrmBackend::open(&device) {
        let mut frame = FrameBuffer::new(new_backend.width(), new_backend.height(), new_backend.format());
        render_frame_into(&mut frame, state);
        let start = Instant::now();
        match display.try_handoff(Box::new(new_backend), &frame) {
            Ok(()) => {
                relay_log::log_event(&RelayEvent::new(
                    RelayStage::DriverHandoff,
                    RelayEventKind::HandoffComplete {
                        target: "native-drm".to_string(),
                    },
                ));
                relay_log::log_event(&RelayEvent::new(
                    RelayStage::DriverHandoff,
                    RelayEventKind::DisplayBackendChanged {
                        backend: "drm".to_string(),
                    },
                ));
                state.set_mode(VisualMode::Booting);
            }
            Err(err) => {
                relay_log::log_event(&RelayEvent::new(
                    RelayStage::DriverHandoff,
                    RelayEventKind::BootDegraded {
                        reason: format!("handoff failed: {err}"),
                    },
                ));
                state.flags |= VisualFlags::BLACK_SCREEN;
                relay_log::log_event(&RelayEvent::new(
                    RelayStage::DriverHandoff,
                    RelayEventKind::BlackScreenDetected {
                        duration_ms: start.elapsed().as_millis() as u64,
                    },
                ));
            }
        }
    }
    Ok(())
}

fn handle_unlock_request(
    display: &mut DisplayManager,
    state: &mut RelayVisualState,
    request: &relay_unlock::PasswordRequest,
) -> Result<()> {
    draw_and_present(display, state)?;

    let mut passphrase =
        TtyReader::read_line_hidden(&format!("{}: ", request.message)).context("read passphrase")?;
    respond_to_request(request, &passphrase).context("send passphrase")?;
    secure_wipe(&mut passphrase);
    Ok(())
}

fn probe_with_retry() -> Result<DisplayManager, relay_display::DisplayError> {
    for attempt in 0..300 {
        if let Ok(display) = probe_and_acquire() {
            return Ok(display);
        }
        if attempt == 0 {
            eprintln!("relayd: waiting for display backend...");
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
    let _ = fs::create_dir_all("/run/relay");
    let _ = fs::create_dir_all("/run/systemd/ask-password");
    let _ = fs::create_dir_all("/dev/dri");
    ensure_display_device_nodes();
}

fn ensure_display_device_nodes() {
    for _ in 0..40 {
        ensure_class_devices("graphics");
        ensure_class_devices("drm");
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

/// Minimal initramfs has no udev — create /dev nodes from /sys/class/* /dev.
fn disable_kernel_boot_logo() {
    for path in [
        "/sys/module/fbcon/parameters/logo",
        "/sys/module/fbcon/parameters/logo_centerscreen",
        "/sys/module/fbcon/parameters/rotate",
    ] {
        let _ = fs::write(path, "0");
    }
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