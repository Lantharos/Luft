use sushi::{
    advance_spinner_from_boot, spinner_phase_at, SushiVisualState, SPINNER_FRAME_INTERVAL_US,
    SPINNER_ROTATIONS_PER_SEC,
};

#[test]
fn spinner_frame_interval_matches_sushiboot() {
    assert_eq!(SPINNER_FRAME_INTERVAL_US, 16_666);
}

#[test]
fn spinner_phase_continues_from_handoff_base() {
    let base = 0.42;
    let after_one_sec = spinner_phase_at(base, 1.0);
    assert!((after_one_sec - (base + SPINNER_ROTATIONS_PER_SEC) % 1.0).abs() < f32::EPSILON);

    let mut state = SushiVisualState::new_boot_scene(800, 600);
    state.spinner_phase = base;
    advance_spinner_from_boot(&mut state, base);
    assert!(state.spinner_phase >= 0.0 && state.spinner_phase < 1.0);
}