use std::collections::BTreeMap;
use std::fs;
use std::path::Path;
use std::sync::atomic::{AtomicU32, Ordering};

use xkbcommon::xkb;

use super::keys::{EDITABLE, LEVELS};
use super::symbol::Symbol;
use crate::paths;

pub type Keys = BTreeMap<String, Vec<Symbol>>;

const RULES: &str = "evdev";
const MODEL: &str = "pc105";
const LEVEL_THREE: &str = "lv3:ralt_switch";
const SCRATCH_LAYOUT: &str = "keys-scratch";

static SCRATCHES: AtomicU32 = AtomicU32::new(0);

pub struct Compiled {
    pub keymap: xkb::Keymap,
}

fn context(extra: Option<&Path>) -> xkb::Context {
    let mut context =
        xkb::Context::new(xkb::CONTEXT_NO_DEFAULT_INCLUDES | xkb::CONTEXT_NO_ENVIRONMENT_NAMES);
    if let Some(directory) = extra {
        context.include_path_append(directory);
    }
    context.include_path_append_default();
    context
}

fn from_names(context: &xkb::Context, layout: &str, variant: &str) -> Option<xkb::Keymap> {
    xkb::Keymap::new_from_names(
        context,
        RULES,
        MODEL,
        layout,
        variant,
        Some(LEVEL_THREE.into()),
        xkb::KEYMAP_COMPILE_NO_FLAGS,
    )
}

pub fn layout(id: &str) -> Result<Compiled, String> {
    let (layout, variant) = id.split_once('+').unwrap_or((id, ""));
    from_names(&context(None), layout, variant)
        .map(|keymap| Compiled { keymap })
        .ok_or_else(|| format!("The layout {id} couldn't be read"))
}

pub fn symbols(text: &str) -> Result<Compiled, String> {
    let directory =
        paths::scratch().join(format!("xkb-{}", SCRATCHES.fetch_add(1, Ordering::Relaxed)));
    paths::write(&directory.join("symbols").join(SCRATCH_LAYOUT), text)?;
    let keymap = from_names(&context(Some(&directory)), SCRATCH_LAYOUT, "");
    let _ = fs::remove_dir_all(&directory);
    keymap
        .map(|keymap| Compiled { keymap })
        .ok_or_else(|| "This layout has a mistake the keyboard can't use".into())
}

pub fn keymap(text: String) -> Result<Compiled, String> {
    xkb::Keymap::new_from_string(
        &context(None),
        text,
        xkb::KEYMAP_FORMAT_TEXT_V1,
        xkb::KEYMAP_COMPILE_NO_FLAGS,
    )
    .map(|keymap| Compiled { keymap })
    .ok_or_else(|| "This keymap couldn't be read".into())
}

impl Compiled {
    pub fn name(&self) -> String {
        self.keymap.layout_get_name(0).to_owned()
    }

    pub fn text(&self) -> String {
        self.keymap.get_as_string(xkb::KEYMAP_FORMAT_TEXT_V1)
    }

    pub fn keys(&self) -> Keys {
        let keymap = &self.keymap;
        let held = [keymap.key_by_name("LFSH"), keymap.key_by_name("RALT")];
        let combinations: [Vec<xkb::Keycode>; LEVELS] = [
            Vec::new(),
            held[..1].iter().flatten().copied().collect(),
            held[1..].iter().flatten().copied().collect(),
            held.iter().flatten().copied().collect(),
        ];
        let states: Vec<xkb::State> = combinations
            .iter()
            .map(|pressed| {
                let mut state = xkb::State::new(keymap);
                for key in pressed {
                    state.update_key(*key, xkb::KeyDirection::Down);
                }
                state
            })
            .collect();
        EDITABLE
            .iter()
            .filter_map(|name| {
                let key = keymap.key_by_name(*name)?;
                let levels: Vec<u32> = states
                    .iter()
                    .map(|state| state.key_get_level(key, 0))
                    .collect();
                let symbols = (0..LEVELS)
                    .map(|index| {
                        let repeats = match index {
                            1 => levels[1] == levels[0],
                            2 => levels[2] == levels[0],
                            3 => levels[3] == levels[2] || levels[3] == levels[1],
                            _ => false,
                        };
                        if repeats {
                            return Symbol::empty();
                        }
                        keymap
                            .key_get_syms_by_level(key, 0, levels[index])
                            .first()
                            .map_or_else(Symbol::empty, |keysym| Symbol::from_keysym(*keysym))
                    })
                    .collect::<Vec<_>>();
                symbols
                    .iter()
                    .any(|symbol| !symbol.is_empty())
                    .then(|| ((*name).to_owned(), symbols))
            })
            .collect()
    }
}
