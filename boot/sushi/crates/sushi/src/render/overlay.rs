//! Debug log overlay, fatal error screen, and unlock field chrome.

use crate::core::{Color, SushiVisualState};
use crate::display::FrameBuffer;
use super::font;

const LINE_H: i32 = 10;
const PANEL_PAD: i32 = 12;

#[derive(Debug, Clone, Default)]
pub struct ErrorDisplay {
    pub title: String,
    pub detail: String,
    pub hints: Vec<String>,
}

#[derive(Debug, Clone, Default)]
pub struct RenderOverlay {
    pub debug_lines: Vec<String>,
    pub unlock_input: Option<String>,
    pub unlock_prompt: Option<String>,
    pub error: Option<ErrorDisplay>,
    pub cursor_visible: bool,
}

pub fn draw_error_screen(frame: &mut FrameBuffer, state: &SushiVisualState, error: &ErrorDisplay) {
    super::draw_background(frame, state.background);
    super::draw_logo(frame, state);

    let accent = Color::SUSHI_ERROR.to_argb32();
    let text = Color::SUSHI_TEXT.to_argb32();
    let muted = Color::SUSHI_ACCENT.to_argb32();

    let title_y = state.logo_rect.y + state.logo_rect.h as i32 + 36;
    font::draw_text_centered(frame, 0, title_y, state.width, 12, &error.title, accent);

    let detail_y = title_y + 24;
    for (i, line) in wrap_lines(&error.detail, 56).iter().take(4).enumerate() {
        font::draw_text_centered(
            frame,
            0,
            detail_y + (i as i32 * LINE_H),
            state.width,
            10,
            line,
            text,
        );
    }

    let hints_y = detail_y + 52;
    font::draw_text_centered(frame, 0, hints_y, state.width, 10, "TRY THIS", muted);
    for (i, hint) in error.hints.iter().take(4).enumerate() {
        let line = format!("- {hint}");
        font::draw_text_centered(
            frame,
            0,
            hints_y + 16 + (i as i32 * LINE_H),
            state.width,
            10,
            &line,
            text,
        );
    }

    font::draw_text_centered(
        frame,
        0,
        state.height.saturating_sub(28) as i32,
        state.width,
        10,
        "F1 DEBUG LOG",
        muted,
    );
}

pub fn draw_debug_overlay(frame: &mut FrameBuffer, state: &SushiVisualState, lines: &[String]) {
    let panel_w = state.width.saturating_sub(80).max(320);
    let panel_h = state.height.saturating_sub(120).max(200);
    let x = ((state.width.saturating_sub(panel_w)) / 2) as i32;
    let y = ((state.height.saturating_sub(panel_h)) / 2) as i32;

    let border = Color::SUSHI_ACCENT.to_argb32();
    let bg = Color {
        r: 12,
        g: 14,
        b: 20,
        a: 230,
    }
    .to_argb32();
    let title_c = Color::SUSHI_ACCENT.to_argb32();
    let text_c = Color::SUSHI_TEXT.to_argb32();

    frame.fill_rect(x, y, panel_w, panel_h, border);
    frame.fill_rect(x + 2, y + 2, panel_w - 4, panel_h - 4, bg);

    font::draw_text(
        frame,
        x + PANEL_PAD,
        y + PANEL_PAD,
        "SUSHI DEBUG LOG  F1 HIDE",
        title_c,
    );

    let max_lines = ((panel_h as i32 - 40) / LINE_H).max(1) as usize;
    let start = lines.len().saturating_sub(max_lines);
    for (i, line) in lines.iter().skip(start).enumerate() {
        let clipped = clip_line(line, 72);
        font::draw_text(
            frame,
            x + PANEL_PAD,
            y + 28 + (i as i32 * LINE_H),
            &clipped,
            text_c,
        );
    }
}

pub fn draw_unlock_field(
    frame: &mut FrameBuffer,
    state: &SushiVisualState,
    overlay: &RenderOverlay,
) {
    let rect = state.activity_rect;
    let box_w = rect.w.saturating_mul(4).min(state.width * 2 / 3).max(260);
    let box_h = 44u32;
    let x = ((state.width.saturating_sub(box_w)) / 2) as i32;
    let y = rect.y;

    frame.fill_rect(x, y, box_w, box_h, Color::SUSHI_ACCENT.to_argb32());
    frame.fill_rect(x + 2, y + 2, box_w - 4, box_h - 4, Color::SUSHI_BG.to_argb32());

    let prompt = overlay
        .unlock_prompt
        .as_deref()
        .unwrap_or("ENTER PASSPHRASE");
    font::draw_text_centered(
        frame,
        x,
        y - 18,
        box_w,
        10,
        prompt,
        Color::SUSHI_TEXT.to_argb32(),
    );

    let input = overlay.unlock_input.as_deref().unwrap_or("");
    let masked: String = input.chars().map(|_| '*').collect();
    let mut display = masked;
    if overlay.cursor_visible {
        display.push('_');
    }
    font::draw_text_centered(
        frame,
        x,
        y,
        box_w,
        box_h,
        &display,
        Color::SUSHI_TEXT.to_argb32(),
    );
}

fn wrap_lines(text: &str, width: usize) -> Vec<String> {
    let mut out = Vec::new();
    let mut current = String::new();
    for word in text.split_whitespace() {
        if current.is_empty() {
            current = word.to_string();
        } else if current.len() + 1 + word.len() <= width {
            current.push(' ');
            current.push_str(word);
        } else {
            out.push(current);
            current = word.to_string();
        }
    }
    if !current.is_empty() {
        out.push(current);
    }
    if out.is_empty() {
        out.push(String::new());
    }
    out
}

fn clip_line(line: &str, max: usize) -> String {
    if line.len() <= max {
        return line.to_string();
    }
    format!("{}...", &line[..max.saturating_sub(3)])
}