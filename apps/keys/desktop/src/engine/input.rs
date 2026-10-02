use xkbcommon::xkb::{self, Keysym};

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Input {
    Text(char),
    Space,
    BackSpace,
    Return,
    Escape,
    Up,
    Down,
    PageUp,
    PageDown,
    Compose,
    Other,
}

impl Input {
    pub fn from_keysym(keysym: Keysym, compose: Option<Keysym>) -> Self {
        if compose == Some(keysym) {
            return Self::Compose;
        }
        match keysym {
            Keysym::space | Keysym::KP_Space => Self::Space,
            Keysym::BackSpace => Self::BackSpace,
            Keysym::Return | Keysym::KP_Enter => Self::Return,
            Keysym::Escape => Self::Escape,
            Keysym::Up | Keysym::Left | Keysym::KP_Up | Keysym::KP_Left => Self::Up,
            Keysym::Down | Keysym::Right | Keysym::KP_Down | Keysym::KP_Right => Self::Down,
            Keysym::Page_Up | Keysym::KP_Page_Up => Self::PageUp,
            Keysym::Page_Down | Keysym::KP_Page_Down => Self::PageDown,
            _ => char::from_u32(xkb::keysym_to_utf32(keysym))
                .filter(|character| !character.is_control())
                .map_or(Self::Other, Self::Text),
        }
    }

    pub fn from_text(character: char, compose: Option<Keysym>) -> Self {
        Self::from_keysym(xkb::utf32_to_keysym(character.into()), compose)
    }
}
