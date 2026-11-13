pub mod json;
pub mod output;
pub mod prompt;
pub mod style;
pub mod system;

pub const OK: i32 = 0;
pub const FAILED: i32 = 1;
pub const USAGE: i32 = 2;
pub const SIGN_IN: i32 = 3;
pub const WAITING: i32 = 4;
pub const DECLINED: i32 = 5;
