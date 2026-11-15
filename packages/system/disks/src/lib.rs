pub mod mounting;
pub mod moving;
pub mod partitions;
pub mod resize;
pub mod systems;
pub mod udisks;

use luft_i18n::{Localizer, localizer};

pub static L10N: Localizer = localizer!("locales", ["disks"]);
