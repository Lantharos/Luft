pub const ARROW: &str = r#"<path d="M6 4.5v18.3c0 1.2 1.4 1.8 2.3 1l3.4-3.2 2.6 6c.4.9 1.4 1.3 2.3.9l1.2-.5c.9-.4 1.3-1.4.9-2.3l-2.5-5.8h4.6c1.2 0 1.8-1.5.9-2.3L8.3 3.6C7.5 2.8 6 3.3 6 4.5Z"/>"#;

pub const DISC: &str = r#"<circle cx="16" cy="16" r="10.5"/>"#;
pub const DISC_WAVE: &str = r#"<path d="M5.6 15.2A10.5 10.5 0 0 1 26.5 15.2C22.9 10.8 19.7 18.8 14 19.2 10 19.5 7.2 18 5.6 15.2Z"/>"#;

pub const POINTING: &str = r#"<path d="M11 6A2.5 2.5 0 0 1 16 6V12.5H19A6.5 6.5 0 0 1 25.5 19V21A6.5 6.5 0 0 1 19 27.5H15.6C12.5 27.5 9.66 23.5 8.9 22.2L5.6 16.1A2.2 2.2 0 0 1 9.3 13.7L11 16.6Z"/>"#;
pub const OPEN_HAND: &str = r#"<path d="M10.6 11A5.6 5.6 0 0 1 16.2 5.4H19A5.6 5.6 0 0 1 24.6 11V21A6.5 6.5 0 0 1 18.1 27.5H15.6C12.5 27.5 9.66 23.5 8.9 22.2L5.6 16.1A2.2 2.2 0 0 1 9.3 13.7L10.6 15.9Z"/>"#;
pub const OPEN_FINGERS: &str = "M14.4 8.4V12.4M17.6 7.4V12.4M20.8 8.4V12.4";
pub const FIST: &str = r#"<path d="M10.6 14A5 5 0 0 1 15.6 9H19.6A5 5 0 0 1 24.6 14V21A6.5 6.5 0 0 1 18.1 27.5H15.6C12.5 27.5 9.66 23.5 8.9 22.2L6.57 17.68A2.2 2.2 0 0 1 10.35 15.44L10.6 15.86Z"/>"#;
pub const KNUCKLES: &str = "M14.6 10.8V13M17.6 10.6V13M20.6 10.8V13";

pub const TEXT: &str = concat!(
    r#"<rect x="15" y="6" width="2" height="20" rx="1"/>"#,
    r#"<rect x="11.5" y="4.5" width="9" height="2.4" rx="1.2"/>"#,
    r#"<rect x="11.5" y="25.1" width="9" height="2.4" rx="1.2"/>"#,
);
pub const CROSS: &str = concat!(
    r#"<rect x="15" y="3" width="2" height="9.5" rx="1"/><rect x="15" y="19.5" width="2" height="9.5" rx="1"/>"#,
    r#"<rect x="3" y="15" width="9.5" height="2" rx="1"/><rect x="19.5" y="15" width="9.5" height="2" rx="1"/>"#,
    r#"<circle cx="16" cy="16" r="1.4"/>"#,
);
pub const PLUS: &str = r#"<path d="M13 4.5H19V13H27.5V19H19V27.5H13V19H4.5V13H13Z"/>"#;
pub const PENCIL: &str = r#"<path d="M4.2 27.8 5.6 21.6 20.6 6.6C21.8 5.4 23.7 5.4 24.9 6.6L25.4 7.1C26.6 8.3 26.6 10.2 25.4 11.4L10.4 26.4Z"/>"#;
pub const PENCIL_TIP: &str = "M18.6 8.6 23.4 13.4";
pub const DROPPER: &str = concat!(
    r#"<path d="M4.4 27.6 5 23.8 16 12.8 19.2 16 8.2 27Z"/>"#,
    r#"<path d="M14.6 11.2 17 8.8 18.3 10.1 21.4 7C22.8 5.6 25 5.6 26.4 7S27.8 10.6 26.4 12L23.3 15.1 24.6 16.4 22.2 18.8Z"/>"#,
);
pub const DROPPER_COLLAR: &str = "M15.6 9.4 22.6 16.4";

pub const MOVE: &str = r#"<path d="M16 3 20.6 8H17.4V14.6H24V11.4L29 16 24 20.6V17.4H17.4V24H20.6L16 29 11.4 24H14.6V17.4H8V20.6L3 16 8 11.4V14.6H14.6V8H11.4Z"/>"#;
pub const SCROLL: &str = concat!(
    r#"<path d="M16 3.2 21 8.6H11Z"/><path d="M16 28.8 21 23.4H11Z"/>"#,
    r#"<path d="M3.2 16 8.6 11V21Z"/><path d="M28.8 16 23.4 11V21Z"/>"#,
    r#"<circle cx="16" cy="16" r="3.4"/>"#,
);
pub const LENS: &str = concat!(
    r#"<circle cx="13.2" cy="13.2" r="9"/>"#,
    r#"<rect x="21.1" y="17.2" width="4.4" height="11.6" rx="2.2" transform="rotate(-45 23.3 23)"/>"#,
);
pub const ZOOM_IN: &str = "M9.4 13.2H17M13.2 9.4V17";
pub const ZOOM_OUT: &str = "M9.4 13.2H17";

pub const DOUBLE: &str = r#"<path d="M3.5 16 10 9.8V14.2H22V9.8L28.5 16 22 22.2V17.8H10V22.2Z"/>"#;
pub const SPLIT: &str = concat!(
    r#"<rect x="14.6" y="4.5" width="2.8" height="23" rx="1.4"/>"#,
    r#"<path d="M2.8 16 8.8 10.6V14.3H12.4V17.7H8.8V21.4Z"/>"#,
    r#"<path d="M29.2 16 23.2 10.6V14.3H19.6V17.7H23.2V21.4Z"/>"#,
);

pub const NO: &str = concat!(
    r#"<path fill-rule="evenodd" d="M16 5.5a10.5 10.5 0 1 1 0 21 10.5 10.5 0 1 1 0-21Zm0 3.6a6.9 6.9 0 1 0 0 13.8 6.9 6.9 0 1 0 0-13.8Z"/>"#,
    r#"<rect x="14.6" y="7" width="2.8" height="18" rx="1.4" transform="rotate(-45 16 16)"/>"#,
);
pub const X_MARK: &str = concat!(
    r#"<rect x="14.2" y="4" width="3.6" height="24" rx="1.8" transform="rotate(45 16 16)"/>"#,
    r#"<rect x="14.2" y="4" width="3.6" height="24" rx="1.8" transform="rotate(-45 16 16)"/>"#,
);

pub const HELP: &str =
    "M22.6 22.6C22.6 21.4 23.5 20.6 24.6 20.6S26.6 21.4 26.6 22.5C26.6 24 24.6 24 24.6 25.6";
pub const MENU: &str = "M21.4 21.9H27.8M21.4 24.3H27.8M21.4 26.7H25.4";
pub const LINK_CURVE: &str = "M21.7 27.2C21.7 24.2 23.4 22.6 26.4 22.6";
pub const LINK_HEAD: &str = "M24.6 20.6 26.8 22.6 24.6 24.6";
pub const ADD: &str = "M24.6 21.6V27.6M21.6 24.6H27.6";
