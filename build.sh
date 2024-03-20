# MAKE SURE TO ADD 7z to your PATH variable
export PATH=$PATH:"C:\Program Files\7-Zip"

rm -rf build/test-extension/

echo "Building the application.."

# Check the exit status of the npm run build command
if [ $? -eq 0 ]; then
    echo "Packaging the extension..."

    mkdir -p build/test-extension

    cp test-extension.js build/test-extension/
    cp wbfolder.wbl build/test-extension/
    cp test-extension.qext build/test-extension/

    cd build && 7z a -sdel test-extension.zip test-extension
else
  echo "Build failed with an error"
  read -p "Press Enter to continue..." # Wait for user input before closing the window
fi