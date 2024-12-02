#!/bin/bash

set -e  # Exit on any error

# Define installation directories
INSTALL_DIR="/usr/local"
BUILD_DIR="$HOME/src/ffmpeg_build"
SOURCE_DIR="$HOME/src/ffmpeg_sources"
NUM_CORES=$(nproc)

echo "Creating necessary directories..."
mkdir -p "$BUILD_DIR" "$SOURCE_DIR"

# Install required tools and dependencies
echo "Installing build tools and essential libraries..."
sudo apt-get update
sudo apt-get install -y \
  autoconf automake build-essential cmake git-core libass-dev \
  libfreetype6-dev libsdl2-dev libtool libva-dev libvdpau-dev \
  libvorbis-dev libxcb1-dev libxcb-shm0-dev libxcb-xfixes0-dev \
  meson ninja-build pkg-config texinfo wget yasm zlib1g-dev \
  nasm libx264-dev libx265-dev libnuma-dev libvpx-dev libfdk-aac-dev \
  libmp3lame-dev libopus-dev libaom-dev libfreetype6

# Build dependencies
cd "$SOURCE_DIR"

# Install libx264 with -fPIC
if [ ! -d "$SOURCE_DIR/x264" ]; then
  echo "Building and installing libx264..."
  git clone --depth 1 https://code.videolan.org/videolan/x264.git
  cd x264
  ./configure --prefix="$BUILD_DIR" --enable-static --enable-shared --enable-pic --disable-opencl
  make -j$NUM_CORES
  make install
  cd ..
fi

# Install libx265 with -fPIC
if [ ! -d "$SOURCE_DIR/x265" ]; then
  echo "Building and installing libx265..."
  git clone --depth 1 https://bitbucket.org/multicoreware/x265_git.git x265
  cd x265/build/linux
  cmake -G "Unix Makefiles" -DCMAKE_INSTALL_PREFIX="$BUILD_DIR" \
    -DENABLE_SHARED=on -DENABLE_PIC=on ../../source
  make -j$NUM_CORES
  make install
  cd ../../../
fi

# Install libvpx with -fPIC
if [ ! -d "$SOURCE_DIR/libvpx" ]; then
  echo "Building and installing libvpx..."
  git clone --depth 1 https://chromium.googlesource.com/webm/libvpx.git
  cd libvpx
  ./configure --prefix="$BUILD_DIR" --disable-examples --disable-unit-tests \
    --enable-vp9-highbitdepth --as=yasm --enable-shared
  make -j$NUM_CORES
  make install
  cd ..
fi

# Install libopus with -fPIC
if [ ! -d "$SOURCE_DIR/opus" ]; then
  echo "Building and installing libopus..."
  git clone https://github.com/xiph/opus.git
  cd opus
  ./autogen.sh
  CFLAGS="-fPIC" ./configure --prefix="$BUILD_DIR" --disable-static --enable-shared
  make -j$NUM_CORES
  make install
  cd ..
fi

# Install libaom with -fPIC
if [ ! -d "$SOURCE_DIR/aom" ]; then
  echo "Building and installing libaom..."
  git clone https://aomedia.googlesource.com/aom
  mkdir -p aom_build
  cd aom_build
  cmake -G "Unix Makefiles" -DCMAKE_INSTALL_PREFIX="$BUILD_DIR" \
    -DENABLE_SHARED=on -DENABLE_PIC=on -DENABLE_TESTS=off ../aom
  make -j$NUM_CORES
  make install
  cd ..
fi

# Build and install FFmpeg
echo "Building and installing FFmpeg..."
if [ ! -d "$SOURCE_DIR/ffmpeg" ]; then
  git clone https://git.ffmpeg.org/ffmpeg.git ffmpeg
  cd ffmpeg
else
  cd ffmpeg
  git pull
fi

PKG_CONFIG_PATH="$BUILD_DIR/lib/pkgconfig" ./configure \
  --prefix="$INSTALL_DIR" \
  --pkg-config-flags="--static" \
  --extra-cflags="-I$BUILD_DIR/include" \
  --extra-ldflags="-L$BUILD_DIR/lib" \
  --extra-libs="-lpthread -lm" \
  --bindir="$INSTALL_DIR/bin" \
  --enable-gpl \
  --enable-nonfree \
  --enable-libfreetype \
  --enable-libx264 \
  --enable-libx265 \
  --enable-libvpx \
  --enable-libmp3lame \
  --enable-libopus \
  --enable-libass \
  --enable-libvorbis \
  --enable-libaom \
  --enable-libdrm \
  --enable-version3 \
  --enable-shared \
  --enable-filter=drawtext

make clean
make -j$NUM_CORES
sudo make install
sudo ldconfig

# Final checks
echo "FFmpeg installation complete. Verifying installation..."
ffmpeg -version
