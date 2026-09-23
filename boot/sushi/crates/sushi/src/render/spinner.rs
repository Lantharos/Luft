//! Fixed-size white arc spinner — rotation only, round caps, anti-aliased.

use crate::core::{
    SushiVisualState, SPINNER_AA_FRINGE, SPINNER_ARC_RAD, SPINNER_RADIUS_INSET, SPINNER_STROKE_PX,
};
use crate::display::FrameBuffer;

pub fn draw_spinner(frame: &mut FrameBuffer, state: &SushiVisualState) {
    let rect = state.activity_rect;
    let cx = frame.width as f32 * 0.5;
    let cy = rect.y as f32 + rect.h as f32 * 0.5;
    let radius = (rect.w.min(rect.h) / 2).saturating_sub(SPINNER_RADIUS_INSET) as f32;
    let half = SPINNER_STROKE_PX * 0.5;
    let rotation = state.spinner_phase * std::f32::consts::TAU - std::f32::consts::FRAC_PI_2;

    let cap0_x = cx + radius * rotation.cos();
    let cap0_y = cy + radius * rotation.sin();
    let cap1_x = cx + radius * (rotation + SPINNER_ARC_RAD).cos();
    let cap1_y = cy + radius * (rotation + SPINNER_ARC_RAD).sin();

    let pad = (radius + half + SPINNER_AA_FRINGE + 1.0).ceil() as i32;
    let cx_i = cx as i32;
    let cy_i = cy as i32;
    let x0 = (cx_i - pad).max(0);
    let y0 = (cy_i - pad).max(0);
    let x1 = (cx_i + pad).min(frame.width as i32);
    let y1 = (cy_i + pad).min(frame.height as i32);

    for py in y0..y1 {
        for px in x0..x1 {
            let fx = px as f32 + 0.5;
            let fy = py as f32 + 0.5;
            let dx = fx - cx;
            let dy = fy - cy;
            let dist = (dx * dx + dy * dy).sqrt();
            let ring = (dist - radius).abs();
            let arc_cov = {
                let mut angle = dy.atan2(dx) - rotation;
                angle = angle.rem_euclid(std::f32::consts::TAU);
                if angle <= SPINNER_ARC_RAD {
                    stroke_coverage(ring, half)
                } else {
                    0.0
                }
            };

            let cap0 = stroke_coverage(
                ((fx - cap0_x).powi(2) + (fy - cap0_y).powi(2)).sqrt(),
                half,
            );
            let cap1 = stroke_coverage(
                ((fx - cap1_x).powi(2) + (fy - cap1_y).powi(2)).sqrt(),
                half,
            );

            let coverage = arc_cov.max(cap0).max(cap1);
            if coverage <= 0.0 {
                continue;
            }

            let alpha = (coverage * 255.0).round().clamp(0.0, 255.0) as u8;
            if alpha == 0 {
                continue;
            }
            frame.put_pixel_alpha(px as u32, py as u32, 255, 255, 255, alpha);
        }
    }
}

fn stroke_coverage(dist_from_centerline: f32, half: f32) -> f32 {
    let outer = half + SPINNER_AA_FRINGE;
    1.0 - smoothstep(half - 0.25, outer, dist_from_centerline)
}

fn smoothstep(edge0: f32, edge1: f32, x: f32) -> f32 {
    if edge0 >= edge1 {
        return 0.0;
    }
    let t = ((x - edge0) / (edge1 - edge0)).clamp(0.0, 1.0);
    t * t * (3.0 - 2.0 * t)
}