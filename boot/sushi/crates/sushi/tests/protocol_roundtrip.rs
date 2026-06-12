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