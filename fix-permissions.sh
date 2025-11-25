#!/bin/bash
# Fix permissions for node_modules binaries
# Run this if you get "Permission denied" errors

echo "🔧 Fixing permissions for node_modules binaries..."

cd "$(dirname "$0")/MindWell"

# Fix all symlinked binaries
echo "Fixing .bin symlinks..."
find node_modules/.bin -type l -exec chmod +x {} \; 2>/dev/null

# Fix actual binary files
echo "Fixing actual binary files..."
find node_modules -name "*.js" -path "*/bin/*" -exec chmod +x {} \; 2>/dev/null
find node_modules -name "*.js" -path "*/dist/bin/*" -exec chmod +x {} \; 2>/dev/null

# Fix esbuild specifically
if [ -f "node_modules/esbuild/bin/esbuild" ]; then
    chmod +x node_modules/esbuild/bin/esbuild
fi

# Fix all executables in .bin
find node_modules/.bin -type f -exec chmod +x {} \; 2>/dev/null

echo "✅ Permissions fixed!"
echo ""
echo "You can now run:"
echo "  cd MindWell"
echo "  npm run dev"
echo "  or"
echo "  npm run start:both"

