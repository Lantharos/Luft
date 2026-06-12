//! Software renderer for Relay boot scenes.

use relay_core::{Color, RelayVisualState, VisualMode};
use relay_display::FrameBuffer;

mod bmp;
mod font;
mod logo_draw;
mod spinner;
mod tux;

pub use logo_draw::{probe_oem_asset, LINUX_LOGO_NATIVE};

/// Black background + spinner only (no logo) — first initramfs paint after EFI handoff.
pub fn render_spinner_only(frame: &mut FrameBuffer, state: &RelayVisualState) {
    draw_background(frame, state.background);
    spinner::draw_spinner(frame, state);
}

pub fn render_frame_into(frame: &mut FrameBuffer, state: &RelayVisualState) {
    draw_background(frame, state.background);
    logo_draw::draw_logo(frame, state);
    match state.mode {
        VisualMode::Booting | VisualMode::Updating | VisualMode::HandingOff => {
            spinner::draw_spinner(frame, state);
        }
        VisualMode::Unlocking => {
            draw_password_box(frame, state);
        }
        VisualMode::Recovering => {
            draw_recovery_menu(frame, state);
        }
    }
    if !state.status_text.is_empty() && state.mode.shows_status_line() {
        draw_status(frame, state);
    }
}

fn draw_background(frame: &mut FrameBuffer, color: Color) {
    frame.fill_rect(0, 0, frame.width, frame.height, color.to_argb32());
}

fn draw_password_box(frame: &mut FrameBuffer, state: &RelayVisualState) {
    let rect = state.activity_rect;
    let box_w = rect.w.saturating_mul(4).min(state.width / 2).max(240);
    let box_h = 48u32;
    let x = ((state.width.saturating_sub(box_w)) / 2) as i32;
    let y = rect.y;

    frame.fill_rect(x, y, box_w, box_h, Color::RELAY_TEXT.to_argb32());
    frame.fill_rect(x + 2, y + 2, box_w - 4, box_h - 4, Color::RELAY_BG.to_argb32());

    font::draw_text_centered(
        frame,
        x,
        y,
        box_w,
        box_h,
        "Enter passphrase",
        Color::RELAY_TEXT.to_argb32(),
    );
}

fn draw_recovery_menu(frame: &mut FrameBuffer, state: &RelayVisualState) {
    let lines = [
        "Boot recovery",
        "",
        &state.status_text,
        "",
        "[Try again]  [View details]",
        "[Recovery shell]  [Reboot]",
    ];
    let start_y = state.logo_rect.y + state.logo_rect.h as i32 + 48;
    for (i, line) in lines.iter().enumerate() {
        if line.is_empty() {
            continue;
        }
        font::draw_text_centered(
            frame,
            0,
            start_y + (i as i32 * 28),
            state.width,
            24,
            line,
            Color::RELAY_TEXT.to_argb32(),
        );
    }
}

fn draw_status(frame: &mut FrameBuffer, state: &RelayVisualState) {
    let y = (state.height.saturating_sub(48)) as i32;
    font::draw_text_centered(
        frame,
        0,
        y,
        state.width,
        24,
        &state.status_text,
        Color::RELAY_TEXT.to_argb32(),
    );
}