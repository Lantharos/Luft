.PHONY: build install dracut test vm-build vm-run

build:
	./scripts/build.sh

install: build
	DESTDIR=$(DESTDIR) ./scripts/build.sh

dracut: install
	sudo dracut --force --omit plymouth --add sushi

test:
	cargo test --workspace --exclude sushiboot
	cargo build --workspace --exclude sushiboot

vm-build:
	./scripts/vm/build-esp.sh

vm-run: vm-build
	./scripts/vm/run-qemu.sh