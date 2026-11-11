//! Crash reports of Luft's own programs: what one says, how it is kept free
//! of anything that says who sent it, and how the same crash is recognised.
//! See [docs/crash-reports.md](../../../../docs/crash-reports.md).

mod assemble;
mod report;
mod scrub;
mod signature;
mod system;

pub use assemble::{Details, program_name, report};
pub use report::{Body, Crash, Frame, Kind, Report, Sent, Vendor};
pub use scrub::Scrubber;
