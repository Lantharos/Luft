use sushi::{read_state, write_state, SushiStage, SushiVisualState, VisualMode};
use std::fs;
use std::path::PathBuf;

#[test]
fn visual_state_roundtrip_json() {
    let path = PathBuf::from("/tmp/sushi-test-state.json");
    let mut state = SushiVisualState::new_boot_scene(1280, 720);
    state.stage = SushiStage::Initramfs;
    state.set_mode(VisualMode::Unlocking);
    state.set_status("test");

    write_state(&path, &state).expect("write");
    let loaded = read_state(&path).expect("read");
    assert_eq!(loaded.width, 1280);
    assert_eq!(loaded.mode, VisualMode::Unlocking);
    assert_eq!(loaded.status_text, "test");
    let _ = fs::remove_file(path);
}

#[test]
fn efi_partial_payload_restores_handoff_layout() {
    let json = br#"{"width":800,"height":600,"spinner_phase":0.25,"flags":128,"ax":372,"ay":300,"aw":56,"ah":56}"#;
    let state = sushi::state_from_efi_payload(json).expect("parse");
    assert_eq!(state.width, 800);
    assert_eq!(state.height, 600);
    assert_eq!(state.activity_rect.w, 56);
    assert!((state.spinner_phase - 0.25).abs() < f32::EPSILON);
}

#[test]
fn handoff_locked_layout_preserves_logo_rect() {
    let mut state = sushi::SushiVisualState::new_boot_scene(800, 600);
    state.flags |= sushi::VisualFlags::ACTIVITY_LOCKED;
    state.logo_rect = sushi::Rect {
        x: 300,
        y: 200,
        w: 200,
        h: 58,
    };
    state.activity_rect = sushi::Rect {
        x: 372,
        y: 286,
        w: 56,
        h: 56,
    };
    state.apply_layout();
    assert_eq!(state.logo_rect.w, 200);
    assert_eq!(state.logo_rect.h, 58);
    assert_eq!(state.logo_rect.y, 200);
    assert_eq!(state.activity_rect.w, 56);
}

#[test]
fn efi_partial_payload_restores_logo_handoff() {
    let json = br#"{"width":1920,"height":1080,"spinner_phase":0.42,"flags":128,"ax":932,"ay":562,"aw":56,"ah":56,"lx":860,"ly":434,"lw":200,"lh":100,"logo_source":0,"logo_native_w":200,"logo_native_h":100,"logo_path":"/sys/firmware/acpi/bgrt/image"}"#;
    let state = sushi::state_from_efi_payload(json).expect("parse");
    assert_eq!(state.logo.native_width, 200);
    assert_eq!(state.logo.native_height, 100);
    assert_eq!(state.logo_rect.w, 200);
    assert!(matches!(state.logo.source, sushi::LogoSource::Firmware));
    assert_eq!(
        state.logo.path.as_deref(),
        Some("/sys/firmware/acpi/bgrt/image")
    );
    assert!((state.spinner_phase - 0.42).abs() < f32::EPSILON);
}