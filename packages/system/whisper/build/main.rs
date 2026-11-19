mod source;

use std::env;
use std::path::{Path, PathBuf};

use source::Upstream;

fn compile(tree: &Path) {
    let built = cmake::Config::new(tree)
        .profile("Release")
        .pic(true)
        .define("BUILD_SHARED_LIBS", "OFF")
        .define("WHISPER_BUILD_TESTS", "OFF")
        .define("WHISPER_BUILD_EXAMPLES", "OFF")
        .define("WHISPER_BUILD_SERVER", "OFF")
        .define("GGML_NATIVE", "OFF")
        .define("GGML_OPENMP", "OFF")
        .define("GGML_VULKAN", "ON")
        .build();
    for folder in ["lib", "lib64"] {
        println!(
            "cargo:rustc-link-search=native={}",
            built.join(folder).display()
        );
    }
    for library in ["whisper", "ggml", "ggml-base", "ggml-cpu", "ggml-vulkan"] {
        println!("cargo:rustc-link-lib=static={library}");
    }
    println!("cargo:rustc-link-lib=dylib=vulkan");
    println!("cargo:rustc-link-lib=dylib=stdc++");
}

fn bind(tree: &Path, out: &Path) {
    bindgen::Builder::default()
        .header(tree.join("include/whisper.h").to_string_lossy())
        .clang_arg(format!("-I{}", tree.join("ggml/include").display()))
        .allowlist_function("whisper_.*")
        .allowlist_type("whisper_.*")
        .allowlist_var("WHISPER_.*")
        .generate()
        .expect("whisper.h can be read")
        .write_to_file(out.join("whisper.rs"))
        .expect("the bindings can be saved");
}

fn main() {
    let manifest = PathBuf::from(env::var_os("CARGO_MANIFEST_DIR").expect("cargo names the crate"));
    let out = PathBuf::from(env::var_os("OUT_DIR").expect("cargo names the build folder"));
    let upstream = manifest.join("upstream.json");
    println!("cargo:rerun-if-changed={}", upstream.display());
    println!(
        "cargo:rerun-if-changed={}",
        manifest.join("build").display()
    );
    let tree = Upstream::read(&upstream).unpacked(&out);
    bind(&tree, &out);
    compile(&tree);
}
