fn main() {
    println!("cargo::rerun-if-changed=src/progress.c");
    cc::Build::new().file("src/progress.c").compile("progress");
}
