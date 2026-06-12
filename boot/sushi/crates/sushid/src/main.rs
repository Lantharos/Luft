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
    Color, SushiEvent, SushiEventKind, SushiStage, SushiVisualState, VisualFlags, VisualMode,
    spinner_phase_at, SPINNER_FRAME_INTERVAL_MS, SUSHI_RUN_DIR,
};
use sushi::{DisplayBackend, DisplayManager, FrameBuffer};
use crate::probe::probe_and_acquire;

use sushi::{load_state, load_state_from_efi, persist_state};
use sushi::{render_frame_into, render_spinner_only};
use sushi::emergency_blackout_all;
use sushi::unlock::{
    respond_to_request, secure_wipe, tpm::TpmUnlock, AskPasswordAgent, TtyReader, UnlockMessage,
};



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

    // Beat kernel fbcon to the scanout buffer if /dev/fb0 already exists.
    emergency_blackout_all();

    if let Err(err) = run() {
        eprintln!("sushid: fatal error: {err:#}");
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
        // Keep SushiBoot layout for the first paint so the spinner does not jump.
        state.logo.native_width = 80;
        state.logo.native_height = 96;
    }
    state.stage = SushiStage::Initramfs;

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

    fs::create_dir_all(SUSHI_RUN_DIR).context("create sushi run dir")?;
    sushi::log::init(format!("{SUSHI_RUN_DIR}/boot.log"))?;

    let running = Arc::new(AtomicBool::new(true));
    let display_watch = display_watch::spawn_display_watch(running.clone());

    draw_and_present(&mut display, &mut state)?;
    sushi::log::log_event(&SushiEvent::new(SushiStage::Initramfs, SushiEventKind::BootFirstFrame));
    serial_note("Sushi: caught the frame");
    persist_state(&state)?;

    let _ = TpmUnlock::try_silent_unlock(&mut state);
    draw_and_present(&mut display, &mut state)?;

    let (mut agent, request_rx) = AskPasswordAgent::start()?;
    let spinner_base_phase = state.spinner_phase;
    let spinner_started = Instant::now();
    let frame_interval = Duration::from_millis(SPINNER_FRAME_INTERVAL_MS);
    let mut last_frame = Instant::now();
    let mut last_persist = Instant::now();
    let mut pending_unlock: Option<sushi::unlock::PasswordRequest> = None;
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
                    sushi::log::log_event(&SushiEvent::new(
                        SushiStage::Initramfs,
                        SushiEventKind::UnlockManualRequired,
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
                    sushi::log::log_event(&SushiEvent::new(
                        SushiStage::Initramfs,
                        SushiEventKind::UnlockManualFailed,
                    ));
                }
            }
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

    sushi::log::log_event(&SushiEvent::new(
        SushiStage::Initramfs,
        SushiEventKind::HandoffPrepare {
            target: "switch-root".to_string(),
        },
    ));
    let _ = draw_and_present(&mut display, &mut state);

    agent.shutdown();
    serial_note("Sushi: handing off!");
    enable_fbcon();
    pivot::switch_root(Path::new("/sysroot"))
}

fn run_headless_switch_root() -> Result<()> {
    mount_essential()?;
    finish_initramfs_setup();
    fs::create_dir_all(SUSHI_RUN_DIR).context("create sushi run dir")?;
    sushi::log::init(format!("{SUSHI_RUN_DIR}/boot.log"))?;
    sushi::log::log_event(&SushiEvent::new(SushiStage::Initramfs, SushiEventKind::BootFirstFrame));
    serial_note("Sushi: caught the frame (headless)");

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

fn draw_and_present(display: &mut DisplayManager, state: &mut SushiVisualState) -> Result<()> {
    display.render(|frame| render_frame_into(frame, state))
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
        render_frame_into(&mut frame, state);
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

fn handle_unlock_request(
    display: &mut DisplayManager,
    state: &mut SushiVisualState,
    request: &sushi::unlock::PasswordRequest,
) -> Result<()> {
    draw_and_present(display, state)?;

    let mut passphrase =
        TtyReader::read_line_hidden(&format!("{}: ", request.message)).context("read passphrase")?;
    respond_to_request(request, &passphrase).context("send passphrase")?;
    secure_wipe(&mut passphrase);
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
}

/// Re-attach fbcon so getty/login renders on the framebuffer after switch_root.
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