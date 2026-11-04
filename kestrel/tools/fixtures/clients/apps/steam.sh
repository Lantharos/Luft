#!/bin/sh
window=$1

gjs -m "$window" 'Stand-in Steam library' '#1b2838' '' Steam &
gjs -m "$window" 'Stand-in Steam friends' '#1b2838' '' steamwebhelper &
gjs -m "$window" 'Harbour Run' '#2f5d8a' '' steam_app_12345 &
gjs -m "$window" 'Harbour Run settings' '#2f5d8a' '' steam_app_12345 &
gjs -m "$window" 'Unlisted game' '#5d2f8a' '' steam_app_99999 &
SteamAppId=23456 SteamGameId=23456 gjs -m "$window" 'Native game' '#2f8a5d' '' nativegame &
wait
