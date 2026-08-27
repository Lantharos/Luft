fn main() {
    println!("cargo:rerun-if-changed=../kestrel/src");
    println!("cargo:rerun-if-changed=../kestrel/Cargo.toml");
    println!("cargo:rerun-if-changed=../luft-shell/src");
    println!("cargo:rerun-if-changed=../luft-shell/Cargo.toml");
    println!("cargo:rerun-if-changed=../luft-ipc/src");
}
