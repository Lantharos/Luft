fn main() {
    println!("cargo::rustc-link-arg-bins=/MERGE:.rdata=.data");
}
