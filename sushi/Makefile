.PHONY: build check

packages = -p sushi -p sushi-scene -p sushid -p sushictl

build:
	./scripts/build.sh

check:
	cargo fmt --check $(packages) -p sushiboot
	cargo clippy $(packages) --all-targets -- -D warnings
	cargo clippy -p sushiboot --target x86_64-unknown-uefi -- -D warnings
	cargo test $(packages)
