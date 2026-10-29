.PHONY: build check

packages = -p sushi -p sushi-scene -p sushid -p sushictl

build:
	cargo build --profile release-abort -p sushid -p sushictl
	cargo build --release -p sushiboot --target x86_64-unknown-uefi

check:
	cargo fmt --check $(packages) -p sushiboot
	cargo clippy $(packages) --all-targets -- -D warnings
	cargo clippy -p sushiboot --target x86_64-unknown-uefi -- -D warnings
	cargo test $(packages)
