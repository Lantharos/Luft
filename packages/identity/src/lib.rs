//! Who is asking, and what each app was allowed.
//!
//! Every process of yours outside a sandbox is one principal, you. An app is
//! told apart only by what its sandbox says about it from outside: the app ID
//! in the `.flatpak-info` that Flatpak, or Luft's AppImage sandbox, puts at
//! the root of every process it starts, read through a pidfd the kernel gave
//! for the caller. The rules are in [Who an app is](https://docs.luft.computer/security/identity/).
//! Which of Luft's own programs runs a process is told from the file it
//! runs, the way [`program`] describes.

pub mod caller;
pub mod permissions;
mod process;
pub mod program;
mod sandbox_info;
pub mod unit;
