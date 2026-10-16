use zbus::zvariant::Value;

use crate::mounting;
use crate::udisks::{self, PARTITION, no_options};

pub fn delete(block: &str) -> Result<(), String> {
    mounting::release(block)?;
    let mut options = no_options();
    options.insert("tear-down", Value::from(true));
    udisks::run(block, PARTITION, "Delete", &(options,))
}
