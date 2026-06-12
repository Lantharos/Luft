//! Minimal /sbin/init used by the QEMU demo after relayd switch_root.

use std::thread;
use std::time::Duration;

fn main() {
    println!();
    println!("========================================");
    println!("  Relay boot complete — switch-root OK");
    println!("  Real root is up (demo initramfs sysroot)");
    println!("========================================");
    println!();

    loop {
        thread::sleep(Duration::from_secs(3600));
    }
}