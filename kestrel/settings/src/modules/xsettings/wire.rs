use std::collections::BTreeMap;

const LSB_FIRST: u8 = 0;
const TYPE_INTEGER: u8 = 0;
const TYPE_STRING: u8 = 1;

#[derive(Clone, PartialEq, Debug)]
pub enum Value {
    Int(i32),
    Str(String),
}

pub type Values = BTreeMap<&'static str, Value>;

struct Entry {
    value: Value,
    changed_at: u32,
}

#[derive(Default)]
pub struct Table {
    serial: u32,
    entries: BTreeMap<&'static str, Entry>,
}

impl Table {
    pub fn update(&mut self, values: &Values) -> bool {
        let serial = self.serial;
        let mut changed = false;
        self.entries.retain(|name, _| values.contains_key(name));
        for (name, value) in values {
            match self.entries.get_mut(name) {
                Some(entry) if entry.value == *value => {}
                Some(entry) => {
                    *entry = Entry {
                        value: value.clone(),
                        changed_at: serial,
                    };
                    changed = true;
                }
                None => {
                    self.entries.insert(
                        name,
                        Entry {
                            value: value.clone(),
                            changed_at: serial,
                        },
                    );
                    changed = true;
                }
            }
        }
        changed
    }

    pub fn encode(&mut self) -> Vec<u8> {
        let mut out = vec![LSB_FIRST, 0, 0, 0];
        out.extend(self.serial.to_le_bytes());
        out.extend((self.entries.len() as u32).to_le_bytes());
        for (name, entry) in &self.entries {
            let kind = match entry.value {
                Value::Int(_) => TYPE_INTEGER,
                Value::Str(_) => TYPE_STRING,
            };
            out.extend([kind, 0]);
            out.extend((name.len() as u16).to_le_bytes());
            push_padded(&mut out, name.as_bytes());
            out.extend(entry.changed_at.to_le_bytes());
            match &entry.value {
                Value::Int(value) => out.extend(value.to_le_bytes()),
                Value::Str(value) => {
                    out.extend((value.len() as u32).to_le_bytes());
                    push_padded(&mut out, value.as_bytes());
                }
            }
        }
        self.serial = self.serial.wrapping_add(1);
        out
    }
}

fn push_padded(out: &mut Vec<u8>, bytes: &[u8]) {
    out.extend(bytes);
    out.resize(out.len() + (4 - bytes.len() % 4) % 4, 0);
}
