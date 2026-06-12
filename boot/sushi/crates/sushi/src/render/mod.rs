//! Software renderer for Sushi boot scenes.

use crate::core::{Color, SushiVisualState, VisualMode};
use crate::display::FrameBuffer;

mod bmp;
mod font;
mod logo_draw;
mod overlay;
mod spinner;
mod tux;

pub use logo_draw::{probe_oem_asset, LINUX_LOGO_NATIVE};
pub use overlay::{draw_debug_overlay, draw_error_screen, draw_unlock_field, ErrorDisplay, RenderOverlay};

pub(crate) use logo_draw::draw_logo;
pub(crate) fn draw_background(frame: &mut FrameBuffer, color: Color) {
    frame.fill_rect(0, 0, frame.width, frame.height, color.to_argb32());
}

/// Black background + spinner only (no logo) — first initramfs paint after EFI handoff.
pub fn render_spinner_only(frame: &mut FrameBuffer, state: &SushiVisualState) {
    draw_background(frame, state.background);
    spinner::draw_spinner(frame, state);
}

pub fn render_frame_into(
    frame: &mut FrameBuffer,
    state: &SushiVisualState,
    overlay: &RenderOverlay,
) {
    if state.mode == VisualMode::Error {
        if let Some(error) = overlay.error.as_ref() {
            draw_error_screen(frame, state, error);
        } else {
            draw_background(frame, state.background);
        }
    } else {
        draw_background(frame, state.background);
        draw_logo(frame, state);
        match state.mode {
            VisualMode::Booting | VisualMode::Updating | VisualMode::HandingOff => {
                spinner::draw_spinner(frame, state);
            }
            VisualMode::Unlocking => {
                draw_unlock_field(frame, state, overlay);
            }
            VisualMode::Recovering => {
                draw_recovery_menu(frame, state);
            }
            VisualMode::Error => {}
        }
        if !state.status_text.is_empty() && state.mode.shows_status_line() {
            draw_status(frame, state);
        }
    }

    if state.flags.contains(crate::core::VisualFlags::DEBUG_LOG) {
        draw_debug_overlay(frame, state, &overlay.debug_lines);
    }
}

fn draw_recovery_menu(frame: &mut FrameBuffer, state: &SushiVisualState) {
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
            Color::SUSHI_TEXT.to_argb32(),
        );
    }
}

fn draw_status(frame: &mut FrameBuffer, state: &SushiVisualState) {
    let y = (state.height.saturating_sub(48)) as i32;
    font::draw_text_centered(
        frame,
        0,
        y,
        state.width,
        24,
        &state.status_text,
        Color::SUSHI_TEXT.to_argb32(),
    );
}