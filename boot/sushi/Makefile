.PHONY: build install dracut test vm-build vm-run

build:
	./scripts/build.sh

install: build
	DESTDIR=$(DESTDIR) ./scripts/build.sh

dracut: install
	sudo dracut --force --omit plymouth --add relay

test:
	cargo test --workspace --exclude relayboot
	cargo build --workspace --exclude relayboot

vm-build:
	./scripts/vm/build-esp.sh

vm-run: vm-build
	./scripts/vm/run-qemu.sh