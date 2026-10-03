use std::collections::HashMap;
use std::ffi::{CStr, CString, c_char, c_void};
use std::sync::OnceLock;

use serde::Serialize;
use xkbcommon::xkb;

use crate::layout::dead;

#[repr(C)]
struct ComposeTable(c_void);
#[repr(C)]
struct ComposeIterator(c_void);
#[repr(C)]
struct ComposeEntry(c_void);

#[link(name = "xkbcommon")]
unsafe extern "C" {
    fn xkb_compose_table_new_from_locale(
        context: *mut c_void,
        locale: *const c_char,
        flags: u32,
    ) -> *mut ComposeTable;
    fn xkb_compose_table_unref(table: *mut ComposeTable);
    fn xkb_compose_table_iterator_new(table: *mut ComposeTable) -> *mut ComposeIterator;
    fn xkb_compose_table_iterator_next(iterator: *mut ComposeIterator) -> *mut ComposeEntry;
    fn xkb_compose_table_iterator_free(iterator: *mut ComposeIterator);
    fn xkb_compose_table_entry_sequence(entry: *mut ComposeEntry, length: *mut usize)
    -> *const u32;
    fn xkb_compose_table_entry_utf8(entry: *mut ComposeEntry) -> *const c_char;
}

#[derive(Serialize, Clone, Default)]
pub struct Effective {
    pub spacing: String,
    pub pairs: Vec<dead::Pair>,
}

static TABLES: OnceLock<HashMap<u32, Effective>> = OnceLock::new();

pub fn locale() -> CString {
    let locale = ["LC_ALL", "LC_CTYPE", "LANG"]
        .iter()
        .filter_map(std::env::var_os)
        .find(|value| !value.is_empty() && value != "C" && value != "POSIX")
        .map_or_else(
            || "en_US.UTF-8".into(),
            |value| value.to_string_lossy().into_owned(),
        );
    CString::new(locale).unwrap_or_default()
}

pub fn entries(mut visit: impl FnMut(&[u32], &str)) {
    let context = xkb::Context::new(xkb::CONTEXT_NO_FLAGS);
    let locale = locale();
    unsafe {
        let table =
            xkb_compose_table_new_from_locale(context.get_raw_ptr().cast(), locale.as_ptr(), 0);
        if table.is_null() {
            return;
        }
        let iterator = xkb_compose_table_iterator_new(table);
        loop {
            let entry = xkb_compose_table_iterator_next(iterator);
            if entry.is_null() {
                break;
            }
            let mut length = 0;
            let sequence = xkb_compose_table_entry_sequence(entry, &mut length);
            let text = CStr::from_ptr(xkb_compose_table_entry_utf8(entry)).to_string_lossy();
            visit(std::slice::from_raw_parts(sequence, length), &text);
        }
        xkb_compose_table_iterator_free(iterator);
        xkb_compose_table_unref(table);
    }
}

fn collect() -> HashMap<u32, Effective> {
    let space = xkb::Keysym::space.raw();
    let mut tables: HashMap<u32, Effective> = HashMap::new();
    entries(|sequence, text| {
        let &[first, second] = sequence else {
            return;
        };
        if text.is_empty() || !xkb::keysym_get_name(first.into()).starts_with("dead_") {
            return;
        }
        let table = tables.entry(first).or_default();
        if second == space || (second == first && table.spacing.is_empty()) {
            table.spacing = text.to_owned();
            return;
        }
        if let Some(base) =
            char::from_u32(xkb::keysym_to_utf32(second.into())).filter(|base| !base.is_control())
        {
            table.pairs.push(dead::Pair {
                base: base.to_string(),
                text: text.to_owned(),
                next: String::new(),
            });
        }
    });
    for table in tables.values_mut() {
        table
            .pairs
            .sort_by(|left, right| left.base.cmp(&right.base));
        table.pairs.dedup_by(|left, right| left.base == right.base);
    }
    tables
}

pub fn table(keysym: &str) -> Effective {
    let keysym = xkb::keysym_from_name(keysym, xkb::KEYSYM_NO_FLAGS).raw();
    TABLES
        .get_or_init(collect)
        .get(&keysym)
        .cloned()
        .unwrap_or_default()
}
