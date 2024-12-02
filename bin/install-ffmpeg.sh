#!/bin/bash

set -e  # Exit on any error

# Define installation directories
INSTALL_DIR="$HOME/ffmpeg_build"
BIN_DIR="/usr/local/bin"
SOURCE_DIR="$HOME/ffmpeg_sources"
NUM_CORES=$(nproc)

echo "Creating necessary directories..."
mkdir -p "$INSTALL_DIR" "$BIN_DIR" "$SOURCE_DIR"

# Install required tools and dependencies
echo "Installing build tools and essential libraries..."
sudo apt-get update
sudo apt-get install -y \
  autoconf automake build-essential cmake git-core libass-dev \
  libfreetype6-dev libsdl2-dev libtool libva-dev libvdpau-dev \
  libvorbis-dev libxcb1-dev libxcb-shm0-dev libxcb-xfixes0-dev \
  meson ninja-build pkg-config texinfo wget yasm zlib1g-dev \
  nasm libnuma-dev libfdk-aac-dev libmp3lame-dev libopus-dev \
  libfreetype6 libdrm-dev mercurial libharfbuzz-bin libharfbuzz-dev

# Remove system-installed x264 and x265 to prevent conflicts
sudo apt-get remove -y libx264-dev libx265-dev x264 x265

# Build dependencies
cd "$SOURCE_DIR"

# Install libx264 (static)
if [ ! -d "$SOURCE_DIR/x264" ]; then
  echo "Building and installing libx264..."
  git clone --branch stable --depth 1 https://code.videolan.org/videolan/x264.git
  cd x264
  make distclean || true
  ./configure --prefix="$INSTALL_DIR" --enable-static --disable-opencl
  make -j$NUM_CORES
  make install
  cd "$SOURCE_DIR"
fi

# Install libx265 (static)
if [ ! -d "$SOURCE_DIR/x265" ]; then
  echo "Building and installing libx265..."
  git clone --depth 1 https://github.com/videolan/x265.git
  cd x265/build/linux
  make distclean || true
  cmake -G "Unix Makefiles" -DCMAKE_INSTALL_PREFIX="$INSTALL_DIR" \
    -DENABLE_SHARED=OFF -DENABLE_PIC=ON -DENABLE_PKGCONFIG=ON ../../source
  make -j$NUM_CORES
  make install
  cd "$SOURCE_DIR"
fi

# Install libvpx (static)
if [ ! -d "$SOURCE_DIR/libvpx" ]; then
  echo "Building and installing libvpx..."
  git clone --depth 1 https://chromium.googlesource.com/webm/libvpx.git
  cd libvpx
  make distclean || true
  ./configure --prefix="$INSTALL_DIR" --disable-examples --disable-unit-tests \
    --enable-vp9-highbitdepth --as=yasm --enable-static --enable-pic
  make -j$NUM_CORES
  make install
  cd "$SOURCE_DIR"
fi

# Install libopus (static)
if [ ! -d "$SOURCE_DIR/opus" ]; then
  echo "Building and installing libopus..."
  git clone --depth 1 https://github.com/xiph/opus.git
  cd opus
  make distclean || true
  ./autogen.sh
  ./configure --prefix="$INSTALL_DIR" --disable-shared
  make -j$NUM_CORES
  make install
  cd "$SOURCE_DIR"
fi

# Install libaom (static)
if [ ! -d "$SOURCE_DIR/aom" ]; then
  echo "Building and installing libaom..."
  git clone --depth 1 https://aomedia.googlesource.com/aom
  mkdir -p aom_build
  cd aom_build
  make distclean || true
  cmake -G "Unix Makefiles" -DCMAKE_INSTALL_PREFIX="$INSTALL_DIR" \
    -DBUILD_SHARED_LIBS=0 -DENABLE_NASM=1 -DCMAKE_C_FLAGS="-fPIC" ../aom
  make -j$NUM_CORES
  make install
  cd "$SOURCE_DIR"
fi

# Build and install FFmpeg
echo "Building and installing FFmpeg..."
cd "$SOURCE_DIR"
if [ ! -d "$SOURCE_DIR/ffmpeg" ]; then
  git clone --depth 1 https://git.ffmpeg.org/ffmpeg.git ffmpeg
  cd ffmpeg
else
  cd ffmpeg
  git pull
fi

export PKG_CONFIG_PATH="$INSTALL_DIR/lib/pkgconfig:/usr/lib/pkgconfig:/usr/share/pkgconfig:/usr/lib/$(uname -m)-linux-gnu/pkgconfig:$PKG_CONFIG_PATH"

make distclean || true
  
./configure \
  --prefix="$INSTALL_DIR" \
  --pkg-config-flags="--static" \
  --extra-cflags="-I$INSTALL_DIR/include" \
  --extra-ldflags="-L$INSTALL_DIR/lib" \
  --extra-libs="-lpthread -lm" \
  --bindir="$BIN_DIR" \
  --enable-gpl \
  --enable-nonfree \
  --enable-libfreetype \
  --enable-libx264 \
  --enable-libvpx \
  --enable-libmp3lame \
  --enable-libopus \
  --enable-libass \
  --enable-libvorbis \
  --enable-libaom \
  --enable-libdrm \
  --enable-libharfbuzz \
  --enable-version3 \
  --enable-static \
  --disable-shared \
  --enable-small
  
make -j$NUM_CORES
sudo make install

# Add ffmpeg to PATH
echo "export PATH=\"$BIN_DIR:\$PATH\"" >> "$HOME/.bashrc"
source "$HOME/.bashrc"

# Final checks
echo "FFmpeg installation complete. Verifying installation..."
ffmpeg -version
