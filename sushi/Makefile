.PHONY: build check vm-build vm-build-luks vm-run vm-clean

packages = -p sushi -p sushi-scene -p sushid -p sushictl

build:
	./scripts/build.sh

check:
	cargo fmt --check $(packages) -p sushiboot
	cargo clippy $(packages) --all-targets -- -D warnings
	cargo clippy -p sushiboot --target x86_64-unknown-uefi -- -D warnings
	cargo test $(packages)

vm-build:
	./scripts/vm/tree.sh
	./scripts/vm/kestrel.sh
	./scripts/vm/disk.sh

vm-build-luks:
	./scripts/vm/tree.sh
	./scripts/vm/kestrel.sh
	LUKS=1 ./scripts/vm/disk.sh

vm-run:
	./scripts/vm/run.sh

vm-clean:
	podman unshare rm -rf vm
