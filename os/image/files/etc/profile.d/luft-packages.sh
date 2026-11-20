[ -n "$BASH_VERSION" ] || return 0
[[ $- == *i* ]] || return 0

dnf5() { dnf "$@"; }
apt() { /usr/libexec/schelf/apt "$@"; }
apt-get() { /usr/libexec/schelf/apt-get "$@"; }
pacman() { /usr/libexec/schelf/pacman "$@"; }
zypper() { /usr/libexec/schelf/zypper "$@"; }

sudo() {
	case $1 in
	dnf | dnf5 | yum | apt | apt-get | pacman | zypper) "$@" ;;
	*) command sudo "$@" ;;
	esac
}
