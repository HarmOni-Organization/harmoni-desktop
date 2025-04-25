# Application Icons

## Requirements for app icons:

1. **Main icon**: Place a file named `icon.png` in this directory
   - Recommended size: 512x512 pixels
   - Format: PNG with transparency

2. **For Linux**:
   - The icon should be a square PNG file
   - Best quality: 1024x1024 pixels
   - Minimum size: 512x512 pixels

3. **For macOS**:
   - Icon should be in ICNS format
   - You can convert PNG to ICNS using tools like:
     - `png2icns` command-line tool
     - Online converters

4. **For Windows**:
   - Icon should be in ICO format
   - Should contain multiple sizes: 16x16, 32x32, 48x48, and 256x256

## How it works:

- The `icon.png` in this directory is used by electron-builder during packaging
- The configuration in package.json points to this location:
  ```json
  "linux": {
    "icon": "assets/icon.png"
  }
  ``` 
