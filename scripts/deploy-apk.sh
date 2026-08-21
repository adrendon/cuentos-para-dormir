#!/bin/bash
set -e

# Config
SERVIDOR="129.153.66.26"
USUARIO="opc"
PEM="$HOME/Downloads/alexisrendon.pem"
RUTA_REMOTA="/usr/share/nginx/html/wordpress/upload/repository/"
APK_NAME="cuentos-para-dormir.apk"
APK_LOCAL="./$APK_NAME"
APK_SOURCE="./android/app/build/outputs/apk/release/app-release.apk"

export ANDROID_HOME=~/Library/Android/sdk

echo "🔨 Paso 1: Prebuild..."
if [ ! -d "./android" ]; then
  npx expo prebuild --platform android --no-install
fi

echo "🏗️  Paso 2: Compilando APK..."
cd android
./gradlew assembleRelease
cd ..

if [ ! -f "$APK_SOURCE" ]; then
  echo "❌ No se generó la APK"
  exit 1
fi

# Renombrar
cp "$APK_SOURCE" "$APK_LOCAL"
echo "✅ APK generada: $APK_LOCAL ($(du -h "$APK_LOCAL" | cut -f1))"

echo "📦 Paso 3: Subiendo a $USUARIO@$SERVIDOR..."
scp -o ConnectTimeout=30 -o StrictHostKeyChecking=no -i "$PEM" "$APK_LOCAL" "$USUARIO@$SERVIDOR:$RUTA_REMOTA$APK_NAME"

if [ $? -eq 0 ]; then
  echo "✅ APK subida exitosamente"
  echo "🔗 URL: http://$SERVIDOR/wordpress/upload/repository/$APK_NAME"
else
  echo "❌ Error al subir la APK"
  exit 1
fi
