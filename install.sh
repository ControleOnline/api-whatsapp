#!/bin/bash
set -e

# Modelo: tiny, base, small, medium, large
MODEL="small"

BASE_DIR="$(pwd)"
WHISPER_DIR="$BASE_DIR/whisper.cpp"
BUILD_DIR="$WHISPER_DIR/build"
MODEL_PATH="$WHISPER_DIR/models/ggml-$MODEL.bin"

echo "📦 Verificando dependências..."

if ! command -v cmake &> /dev/null; then
    echo "Instalando cmake e dependências..."
    sudo apt update
    sudo apt install -y git build-essential cmake ffmpeg
fi

# Clonar se não existir
if [ ! -d "$WHISPER_DIR" ]; then
    echo "⬇️ Clonando whisper.cpp..."
    git clone https://github.com/ggerganov/whisper.cpp
fi

cd "$WHISPER_DIR"

# Compilar apenas se não existir binário
if [ ! -f "$BUILD_DIR/bin/whisper-server" ]; then
    echo "🛠 Compilando whisper.cpp..."
    cmake -B build
    cmake --build build -j$(nproc)
else
    echo "✅ Binário já compilado, pulando build."
fi

# Baixar modelo apenas se não existir
if [ ! -f "$MODEL_PATH" ]; then
    echo "⬇️ Baixando modelo $MODEL..."
    bash ./models/download-ggml-model.sh $MODEL
else
    echo "✅ Modelo já existe, pulando download."
fi

echo ""
echo "🎉 Whisper pronto para uso!"
