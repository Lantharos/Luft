//! Command-line tools on schelf.store: their names and addresses, the index
//! the store signs for each, and which release and file a computer installs.

mod index;
mod names;

pub use index::{
    File, Project, Publisher, Release, Rollout, ToolIndex, pick_file, platform_candidates,
};
pub use names::{
    Address, Handle, KINDS, NAME_MESSAGE, PLATFORMS, STORE_TOOL, add_line, address, handle,
    index_path, install_line, install_url, invited_index_path, reserved, split_address, valid_name,
};

#[cfg(test)]
mod tests;
