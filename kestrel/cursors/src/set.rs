use crate::draw::Pen;
use crate::palette::{Palette, RED};
use crate::shapes::*;

pub struct Cursor {
    pub name: &'static str,
    pub art: String,
    pub hotspot: (f32, f32),
    pub aliases: &'static [&'static str],
}

const POINTER_HOT: (f32, f32) = (5.5, 3.5);
const CENTRE: (f32, f32) = (16.0, 16.0);

fn cursor(
    name: &'static str,
    art: String,
    hotspot: (f32, f32),
    aliases: &'static [&'static str],
) -> Cursor {
    Cursor {
        name,
        art,
        hotspot,
        aliases,
    }
}

pub fn cursors(palette: &Palette) -> Vec<Cursor> {
    let pen = Pen { palette };
    let arrow = pen.arrow();
    let body = palette.body;
    let glyph = palette.badge_glyph;
    vec![
        cursor(
            "default",
            pen.waved_arrow("pointer"),
            POINTER_HOT,
            &["left_ptr", "arrow", "top_left_arrow", "dnd-move"],
        ),
        cursor(
            "right_ptr",
            format!(
                r#"<g transform="translate(32 0) scale(-1 1)">{}</g>"#,
                pen.waved_arrow("pointer-right")
            ),
            (26.5, 3.5),
            &["draft_large", "draft_small"],
        ),
        cursor(
            "pointer",
            pen.shape(POINTING),
            (13.5, 3.5),
            &[
                "hand2",
                "hand",
                "pointing_hand",
                "e29285e634086352946a0e7090d73106",
                "9d800788f1b08800ae810202380a0822",
            ],
        ),
        cursor(
            "help",
            format!(
                r#"{arrow}{}"#,
                pen.badge(&format!(
                    r#"{}<circle cx="24.6" cy="27.6" r="1" fill="{glyph}"/>"#,
                    pen.glyph(HELP, 1.6)
                ))
            ),
            POINTER_HOT,
            &[
                "question_arrow",
                "whats_this",
                "left_ptr_help",
                "d9ce0ab605698f320427677b458ad60b",
                "5c6cd98b3f3ebcb1f9c7f1c204630408",
            ],
        ),
        cursor(
            "context-menu",
            format!(
                r#"{arrow}<rect x="17.6" y="18" width="13" height="12.6" rx="3.4" fill="{body}"/><rect x="18.6" y="19" width="11" height="10.6" rx="2.6" fill="{}"/>{}"#,
                palette.badge,
                pen.glyph(MENU, 1.4),
            ),
            POINTER_HOT,
            &["dnd-ask"],
        ),
        cursor(
            "alias",
            format!(
                "{arrow}{}",
                pen.badge(&(pen.glyph(LINK_CURVE, 1.6) + &pen.glyph(LINK_HEAD, 1.6)))
            ),
            POINTER_HOT,
            &[
                "link",
                "dnd-link",
                "3085a0e285430894940527032f8b26df",
                "640fb0e74195791501fd1ed57b41487f",
                "a2a266d0498c3104214a47bd64ab0fc8",
            ],
        ),
        cursor(
            "copy",
            format!("{arrow}{}", pen.badge(&pen.glyph(ADD, 1.8))),
            POINTER_HOT,
            &[
                "dnd-copy",
                "1081e37283d90000800003c07f3ef6bf",
                "6407b0e94181790501fd1e167b474872",
                "b66166c04f8c3109214a4fbd64a50fc8",
            ],
        ),
        cursor("wait", pen.busy_disc(), CENTRE, &["watch"]),
        cursor(
            "progress",
            format!(
                r#"{arrow}<circle cx="24" cy="24" r="7" fill="{body}"/><g transform="translate(24 24) scale(.56) translate(-16 -16)">{}</g>"#,
                pen.busy_disc()
            ),
            POINTER_HOT,
            &[
                "left_ptr_watch",
                "half-busy",
                "3ecb610c1bf2410f44200f48c40d3599",
                "08e8e1c95fe2fc01f976f1e063a24ccd",
                "00000000000000020006000e7e9ffc3f",
            ],
        ),
        cursor("text", pen.shape(TEXT), CENTRE, &["xterm", "ibeam"]),
        cursor(
            "vertical-text",
            pen.turned(TEXT, 90.0),
            CENTRE,
            &["048008013003cff3c00c801001200000"],
        ),
        cursor(
            "crosshair",
            pen.shape(CROSS),
            CENTRE,
            &[
                "cross",
                "tcross",
                "cross_reverse",
                "diamond_cross",
                "target",
            ],
        ),
        cursor("cell", pen.softened(PLUS), CENTRE, &["plus"]),
        cursor(
            "pencil",
            pen.shape(PENCIL) + &pen.detail(PENCIL_TIP, 1.1),
            (4.6, 27.4),
            &["draft"],
        ),
        cursor(
            "color-picker",
            pen.shape(DROPPER) + &pen.detail(DROPPER_COLLAR, 1.1),
            (4.6, 27.4),
            &[],
        ),
        cursor(
            "grab",
            pen.shape(OPEN_HAND) + &pen.detail(OPEN_FINGERS, 1.0),
            (16.0, 14.0),
            &["openhand", "hand1", "5aca4d189052212118709018842178c0"],
        ),
        cursor(
            "grabbing",
            pen.shape(FIST) + &pen.detail(KNUCKLES, 1.0),
            CENTRE,
            &[
                "closedhand",
                "208530c400c041818281048008011002",
                "fcf21c00b30f7e3f83fe0dfd12e71cff",
            ],
        ),
        cursor(
            "move",
            pen.softened(MOVE),
            CENTRE,
            &[
                "all-resize",
                "fleur",
                "size_all",
                "4498f0e0c1937ffe01fd06f973665830",
                "9081237383d90e509aa00f00170e968f",
            ],
        ),
        cursor("all-scroll", pen.softened(SCROLL), CENTRE, &[]),
        cursor(
            "zoom-in",
            pen.shape(LENS) + &pen.detail(ZOOM_IN, 2.0),
            (13.2, 13.2),
            &[],
        ),
        cursor(
            "zoom-out",
            pen.shape(LENS) + &pen.detail(ZOOM_OUT, 2.0),
            (13.2, 13.2),
            &[],
        ),
        cursor(
            "ew-resize",
            pen.double(0.0),
            CENTRE,
            &[
                "sb_h_double_arrow",
                "h_double_arrow",
                "size_hor",
                "e-resize",
                "w-resize",
                "right_side",
                "left_side",
                "028006030e0e7ebffc7f7070c0600140",
            ],
        ),
        cursor(
            "ns-resize",
            pen.double(90.0),
            CENTRE,
            &[
                "sb_v_double_arrow",
                "v_double_arrow",
                "size_ver",
                "n-resize",
                "s-resize",
                "top_side",
                "bottom_side",
                "00008160000006810000408080010102",
            ],
        ),
        cursor(
            "nwse-resize",
            pen.double(45.0),
            CENTRE,
            &[
                "bd_double_arrow",
                "size_fdiag",
                "nw-resize",
                "se-resize",
                "top_left_corner",
                "bottom_right_corner",
                "ul_angle",
                "lr_angle",
                "c7088f0f3e6c8088236ef8e1e3e70000",
            ],
        ),
        cursor(
            "nesw-resize",
            pen.double(-45.0),
            CENTRE,
            &[
                "fd_double_arrow",
                "size_bdiag",
                "ne-resize",
                "sw-resize",
                "top_right_corner",
                "bottom_left_corner",
                "ur_angle",
                "ll_angle",
                "fcf1c3c7cd4491d801f1e1c78f100000",
            ],
        ),
        cursor(
            "col-resize",
            pen.softened(SPLIT),
            CENTRE,
            &["split_h", "14fef782d02440884392942c11205230"],
        ),
        cursor(
            "row-resize",
            pen.softened_turned(SPLIT, 90.0),
            CENTRE,
            &["split_v", "2870a09082c103050810ffdffffe0204"],
        ),
        cursor(
            "not-allowed",
            pen.filled(NO, RED),
            CENTRE,
            &[
                "crossed_circle",
                "forbidden",
                "circle",
                "03b6e0fcb3499374a867c041f52298f0",
            ],
        ),
        cursor(
            "no-drop",
            format!(
                r#"{arrow}<circle cx="24.6" cy="24.6" r="6.6" fill="{body}"/><g transform="translate(24.6 24.6) scale(.56) translate(-16 -16)" fill="{RED}">{NO}</g>"#
            ),
            POINTER_HOT,
            &["dnd-none", "dnd-no-drop"],
        ),
        cursor(
            "X_cursor",
            pen.shape(X_MARK),
            CENTRE,
            &["x-cursor", "pirate"],
        ),
    ]
}
