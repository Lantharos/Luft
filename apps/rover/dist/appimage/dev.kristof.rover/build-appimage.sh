#!/bin/sh
set -e
mkdir -p 'dist/appimage/artifacts'
appimagetool 'dist/appimage/dev.kristof.rover/AppDir' 'dist/appimage/artifacts/dev.kristof.rover-0.1.0-appimage.AppImage'
