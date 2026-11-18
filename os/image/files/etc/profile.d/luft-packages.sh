[ -n "$BASH_VERSION" ] || return 0
[[ $- == *i* ]] || return 0

dnf5() { dnf "$@"; }
apt() { /usr/libexec/luft-package-manager apt "$@"; }
apt-get() { /usr/libexec/luft-package-manager apt-get "$@"; }
pacman() { /usr/libexec/luft-package-manager pacman "$@"; }
zypper() { /usr/libexec/luft-package-manager zypper "$@"; }

sudo() {
	case $1 in
	dnf | dnf5 | yum | apt | apt-get | pacman | zypper) "$@" ;;
	*) command sudo "$@" ;;
	esac
}
