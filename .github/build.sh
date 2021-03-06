#!/bin/bash
#------------------------------------------------------------------------------
## Automatically build a zip file with version string from manifest.json
##
# change to root of project
cd "$(dirname "$0")/.."
# First check if dist folder exists, empty it if it does and create it if it doesn't
if [ -d dist ]; then
  rm -rf dist
fi
mkdir dist
# build a zip file with version name from manifest.json
echo "Building zip file..."
# read the version from manifest.json
version=$(grep -m 1 '"version"' manifest.json | cut -d '"' -f 4)
# remove existing zip file if it exists
if [ -f "dist/netmonitor-v$version.zip" ]; then
  rm "dist/netmonitor-v$version.zip"
fi
# create a zip file with the version name excluding github folder
zip -r dist/netmonitor-v$version.zip . -x "*dist*" "*.git*" "*.github" "*.idea*" "*.iml*" "*.md" "*.gitignore"
echo "Zip file created."
#------------------------------------------------------------------------------
# EOF- name: Push to GitHub