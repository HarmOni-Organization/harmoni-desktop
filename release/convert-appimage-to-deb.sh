#!/bin/bash

# Check if AppImage is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <your-app.AppImage>"
  exit 1
fi

APPIMAGE="$1"
APP_NAME=$(basename "$APPIMAGE" .AppImage)
DEB_NAME="${APP_NAME}-deb"

echo "Extracting AppImage..."
./"$APPIMAGE" --appimage-extract > /dev/null 2>&1

if [ ! -d "squashfs-root" ]; then
  echo "Extraction failed. Ensure the AppImage is executable."
  exit 1
fi

# Create Debian package structure
echo "Setting up Debian package structure..."
rm -rf "$DEB_NAME"
mkdir -p "$DEB_NAME/DEBIAN"
mkdir -p "$DEB_NAME/usr/share/$APP_NAME"
mkdir -p "$DEB_NAME/usr/bin"

# Move extracted files
mv squashfs-root/* "$DEB_NAME/usr/share/$APP_NAME"

# Detect main executable (assumes the largest executable is the main one)
MAIN_EXEC=$(find "$DEB_NAME/usr/share/$APP_NAME" -type f -executable -printf "%s %p\n" | sort -nr | head -n 1 | cut -d' ' -f2)

if [ -z "$MAIN_EXEC" ]; then
  echo "No main executable found. Exiting."
  exit 1
fi

echo "Detected main executable: $MAIN_EXEC"

# Create symlink
ln -s "$MAIN_EXEC" "$DEB_NAME/usr/bin/$APP_NAME"

# Create control file
cat <<EOF > "$DEB_NAME/DEBIAN/control"
Package: $APP_NAME
Version: 1.0
Section: misc
Priority: optional
Architecture: amd64
Depends: libgtk-3-0, libnss3, libxss1, libasound2
Maintainer: Your Name <your.email@example.com>
Description: HarmOni - Your all-in-one entertainment hub
EOF

# Set permissions
chmod 755 "$DEB_NAME/DEBIAN"
chmod 755 "$DEB_NAME/usr/bin/$APP_NAME"
chmod -R 755 "$DEB_NAME/usr/share/$APP_NAME"

# Build the .deb package
echo "Building .deb package..."
dpkg-deb --build "$DEB_NAME" > /dev/null 2>&1

echo "Done! The .deb package is available as ${DEB_NAME}.deb"

