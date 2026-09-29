set -gx XDG_DATA_DIRS (string replace -- "$TERN_FISH_DATA:" "" $XDG_DATA_DIRS)
set -e TERN_FISH_DATA

status is-interactive; or exit

function __tern_prompt --on-event fish_prompt
	set -l exit_status $status
	printf '\e]133;D;%s\a\e]7;file://%s%s\a\e]133;A\a' $exit_status $hostname (string replace -a % %25 -- $PWD)
end

function __tern_preexec --on-event fish_preexec
	printf '\e]133;C\a'
end
