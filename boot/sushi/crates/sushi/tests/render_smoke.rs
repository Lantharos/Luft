use sushi::{render_frame_into, render_spinner_only, RenderOverlay, SushiVisualState, VisualMode};

#[test]
fn render_boot_scene_has_pixels() {
    let state = SushiVisualState::new_boot_scene(320, 240);
    let mut frame = sushi::FrameBuffer::new(320, 240, sushi::PixelFormat::Xrgb8888);
    let overlay = RenderOverlay::default();
    render_frame_into(&mut frame, &state, &overlay);
    let nonzero = frame.pixels.iter().any(|b| *b != 0);
    assert!(nonzero, "boot scene should paint non-black pixels");
}

#[test]
fn render_unlock_mode_draws_field() {
    let mut state = SushiVisualState::new_boot_scene(640, 480);
    state.set_mode(VisualMode::Unlocking);
    let mut overlay = RenderOverlay::default();
    overlay.unlock_input = Some("abc".to_string());
    overlay.cursor_visible = true;
    let mut frame = sushi::FrameBuffer::new(640, 480, sushi::PixelFormat::Xrgb8888);
    render_frame_into(&mut frame, &state, &overlay);
    assert!(frame.pixels.iter().any(|b| *b != 0));
}

#[test]
fn render_spinner_only_fills_background() {
    let state = SushiVisualState::new_boot_scene(200, 200);
    let mut frame = sushi::FrameBuffer::new(200, 200, sushi::PixelFormat::Xrgb8888);
    render_spinner_only(&mut frame, &state);
    assert!(frame.pixels[0] == 0 && frame.pixels[2] == 0);
}