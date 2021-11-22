#!/bin/bash
#------------------------------------------------------------------------------
# Automatically build a zip file with version string from manifest.json
#------------------------------------------------------------------------------
# change to root of project
cd "$(dirname "$0")/.."
# First check if dist folder exists and if not create it
if [ ! -d "dist" ]; then
  mkdir dist
fi
# build a zip file with version name from manifest.json
echo "Building zip file..."
# read the version from manifest.json
version=$(grep -m 1 '"version"' manifest.json | cut -d '"' -f 4)
# remove existing zip file if it exists
if [ -f "dist/netmonitor-v$version.zip" ]; then
  rm "dist/netmonitor-v$version.zip"
fi
# create a zip file with the version name excluding github folder
zip -r dist/netmonitor-v$version.zip . -x "*dist*" "*.git*" "*.github*" "*.idea*" "*.iml*" "*.md" "*.gitignore"
echo "Zip file created."
#------------------------------------------------------------------------------
# EOF