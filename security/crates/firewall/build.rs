use std::path::PathBuf;
use std::process::Command;

const SOURCE: &str = "src/listening/listening.bpf.c";

fn main() {
    println!("cargo::rerun-if-changed={SOURCE}");
    let object = PathBuf::from(std::env::var_os("OUT_DIR").expect("cargo sets OUT_DIR"))
        .join("listening.bpf.o");
    let status = Command::new("clang")
        .args([
            "-target", "bpfel", "-O2", "-g", "-Wall", "-Werror", "-c", SOURCE, "-o",
        ])
        .arg(&object)
        .status()
        .expect("building the bind watcher needs clang");
    assert!(status.success(), "clang couldn't build {SOURCE}");
}
